from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.data_routes import data_bp, SMB_USERS
from utils.data_generator import DataGenerator
import json
import os
from datetime import datetime, timedelta
import random
from pymongo import MongoClient
import numpy as np
from scipy.stats import norm

app = Flask(__name__)
CORS(app)

# Load sector-specific ratios
with open('smb_sector.json', 'r', encoding='utf-8') as f:
    SECTOR_RATIOS = json.load(f)

data_generator = DataGenerator(SECTOR_RATIOS, SMB_USERS)

# 상수 정의
CARD_TYPES = ["신한카드", "삼성카드", "현대카드", "롯데카드"]
CARD_FEE_RATE = 0.02  # 카드사 수수료 2%
DELIVERY_FEE_RATE = 0.10  # 배달 앱 수수료 10%

# 현실적인 시간 분포 생성 (피크타임 반영)
def generate_transaction_time(base_date, hour_range=(11, 20)):
    peak_hours = [11, 12, 13, 17, 18, 19, 20]
    regular_hours = [h for h in range(hour_range[0], hour_range[1] + 1) if h not in peak_hours]
    hour = random.choices(peak_hours + regular_hours,
                         weights=[0.15]*len(peak_hours) + [0.05]*len(regular_hours), k=1)[0]
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return base_date.replace(hour=hour, minute=minute, second=second)

# 금액에 현실적 변동 추가
def generate_variable_amount(base_amount, min_factor=0.7, max_factor=1.3):
    return int(base_amount * random.uniform(min_factor, max_factor))

# Register blueprints
app.register_blueprint(data_bp, url_prefix='/')

# Add direct routes for backward compatibility
@app.route('/users', methods=['GET'])
def get_users_direct():
    try:
        return jsonify(SMB_USERS)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/gen-smb-revenue', methods=['POST', 'OPTIONS'])
def generate_smb_revenue_direct():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.json
        print("\n=== /gen-smb-revenue API 호출 파라미터 ===")
        print("Form Data:", json.dumps(data, indent=2, ensure_ascii=False))
        print("==================================\n")

        # 필수 필드 검증
        required_fields = ['businessNumber', 'businessDays', 'weekdayAvgSales', 'startDate', 'endDate']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            print(f"Missing required fields: {missing_fields}")
            response = jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
            print("\n=== /gen-smb-revenue API 응답 ===")
            print("Response:", json.dumps(response[0].json, indent=2, ensure_ascii=False))
            print("==================================\n")
            return response

        # 사용자 정보 확인
        user = next((u for u in SMB_USERS if u["business_number"] == data['businessNumber']), None)
        if not user:
            print(f"Business number not found: {data['businessNumber']}")
            return jsonify({'error': 'Business number not found'}), 404

        # 요일 매핑
        weekday_map = {
            'mon': 0, 'tue': 1, 'wed': 2, 'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6
        }
        try:
            business_days = [weekday_map[day] for day in data['businessDays']]
        except KeyError as e:
            print(f"Invalid business day: {str(e)}")
            return jsonify({'error': f'Invalid business day: {str(e)}'}), 400

        # 데이터 생성
        result = {
            'merchant_info': {
                'bid': user['bid'],
                'merchant_name': user['merchant_name'],
                'business_number': user['business_number'],
                'business_number_dash': user['business_number_dash'],
                'merchant_address': user['merchant_address'],
                'merchant_zipcode': user['merchant_zipcode'],
                'smb_sector': user['smb_sector'],
                'smb_sector_en': user['smb_sector_en'],
                'deposit_bank': user['deposit_bank'],
                'account_number': user['account_number'],
                'zone_nm': user['zone_nm']
            },
            'card_sales_data': {
                'daily_sales_data': []
            },
            'baemin': {
                'daily_sales_data': []
            },
            'coupangeats': {
                'daily_sales_data': []
            },
            'yogiyo': {
                'daily_sales_data': []
            },
            'hometax_cash_receipts': [],
            'hometax_tax_invoices': []
        }

        # 일별 데이터 생성
        start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
        end_date = datetime.strptime(data['endDate'], '%Y-%m-%d')
        current_date = start_date
        data_count = 0

        while current_date <= end_date:
            # 영업일 여부 확인
            if current_date.weekday() not in business_days:
                current_date += timedelta(days=1)
                continue

            # 주중/주말 구분
            is_weekend = current_date.weekday() >= 5
            base_sales = int(data['weekdayAvgSales']) * (1.2 if is_weekend else 1)

            # 카드 거래 생성
            card_txns = []
            card_txn_count = random.randint(5, 15)
            card_total = base_sales

            for i in range(card_txn_count):
                amount = generate_variable_amount(card_total // card_txn_count, 0.5, 1.5)
                approval_time = generate_transaction_time(current_date)
                approval_number = f"{chr(65+data_count)}{random.randint(100000000, 999999999)}"
                card_type = random.choice(CARD_TYPES)
                
                # 승인 정보
                card_txns.append({
                    "transaction_type": "offline",
                    "supply_value": int(amount / 1.1),
                    "vat": amount - int(amount / 1.1),
                    "total_amount": amount,
                    "card_type": card_type,
                    "approval_number": approval_number,
                    "approval_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S")
                })

            # 카드 매출 데이터 추가
            result['card_sales_data']['daily_sales_data'].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "sales_stats": {
                    "approval_count": len(card_txns),
                    "acquisition_count": len(card_txns),
                    "deposit_count": 1
                },
                "approval_details": card_txns,
                "acquisition_details": {
                    "acquisition_date": (current_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                    "total_supply_value": sum(t["supply_value"] for t in card_txns),
                    "total_vat": sum(t["vat"] for t in card_txns),
                    "total_amount": sum(t["total_amount"] for t in card_txns),
                    "total_fee": int(sum(t["total_amount"] for t in card_txns) * CARD_FEE_RATE),
                    "net_amount": sum(t["total_amount"] for t in card_txns) - int(sum(t["total_amount"] for t in card_txns) * CARD_FEE_RATE),
                    "card_company": "혼합",
                    "acquisition_number": f"ACQ-{current_date.strftime('%m%d')}-001",
                    "approval_numbers": [t["approval_number"] for t in card_txns]
                },
                "deposit_details": {
                    "deposit_date": (current_date + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "deposit_amount": sum(t["total_amount"] for t in card_txns) - int(sum(t["total_amount"] for t in card_txns) * CARD_FEE_RATE),
                    "fee": int(sum(t["total_amount"] for t in card_txns) * CARD_FEE_RATE),
                    "bank": user['deposit_bank'],
                    "account_number": user['account_number'],
                    "deposit_reference": f"DEP-{current_date.strftime('%m%d')}-001",
                    "acquisition_number": f"ACQ-{current_date.strftime('%m%d')}-001"
                }
            })

            # 배달 플랫폼 데이터 생성
            if data.get('hasDelivery', False):
                delivery_ratio = float(data.get('deliveryRatio', 0)) / 100
                delivery_sales = int(base_sales * delivery_ratio)

                for platform, ratio in [
                    ('baemin', float(data.get('baeminRatio', 0)) / 100),
                    ('coupangeats', float(data.get('coupangEatsRatio', 0)) / 100),
                    ('yogiyo', float(data.get('yogiyoRatio', 0)) / 100)
                ]:
                    if ratio > 0:
                        platform_sales = int(delivery_sales * ratio)
                        txns = []
                        for _ in range(random.randint(2, 4)):
                            amount = generate_variable_amount(platform_sales // 3)
                            approval_time = generate_transaction_time(current_date, (12, 22))
                            fee = int(amount * DELIVERY_FEE_RATE)
                            txns.append({
                                "amount": amount,
                                "fee": fee,
                                "net_amount": amount - fee,
                                "card_type": random.choice(CARD_TYPES),
                                "approval_number": f"{platform[:2].upper()}-{chr(65+data_count)}{random.randint(100000000, 999999999)}",
                                "approval_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S")
                            })

                        # 배달 플랫폼 데이터 추가
                        if platform not in result:
                            result[platform] = {"daily_sales_data": []}
                        
                        result[platform]['daily_sales_data'].append({
                            "date": current_date.strftime("%Y-%m-%d"),
                            "daily_sales": txns,
                            "total_sales_amount": sum(t["amount"] for t in txns),
                            "total_fee": sum(t["fee"] for t in txns),
                            "settlement_amount": sum(t["net_amount"] for t in txns),
                            "payment_status": "paid" if (datetime.now() - current_date).days >= 7 else "pending",
                            "payment_due_date": (current_date + timedelta(days=7)).strftime("%Y-%m-%d"),
                            "settlement_reference": f"{platform[:2].upper()}-SET-{current_date.strftime('%m%d')}-001"
                        })

            # 현금영수증 데이터 생성
            cash_txn_count = random.randint(0, 4)
            cash_txns = []
            for _ in range(cash_txn_count):
                amount = generate_variable_amount(50000, 0.8, 1.5)
                approval_time = generate_transaction_time(current_date)
                cash_txns.append({
                    "amount": amount,
                    "receipt_number": f"CR-{current_date.strftime('%y%m%d')}-{str(len(cash_txns)+1).zfill(3)}",
                    "issue_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "customer_id": f"010-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                    "status": "issued"
                })

            result['hometax_cash_receipts'].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "cash_receipts": cash_txns,
                "total_cash_amount": sum(t["amount"] for t in cash_txns),
                "total_issued_amount": sum(t["amount"] for t in cash_txns),
                "issued_count": len(cash_txns),
                "non_issued_count": 0
            })

            # 세금계산서 데이터 생성
            if random.random() < 0.1:  # 10% 확률로 세금계산서 발행
                amount = generate_variable_amount(50000, 0.8, 1.5)
                approval_time = generate_transaction_time(current_date)
                result['hometax_tax_invoices'].append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "tax_invoices": [{
                        "invoice_number": f"TI-{current_date.strftime('%y%m%d')}-001",
                        "issue_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S"),
                        "supply_value": int(amount / 1.1),
                        "vat": amount - int(amount / 1.1),
                        "total_amount": amount,
                        "payment_method": "card",
                        "card_type": random.choice(CARD_TYPES),
                        "approval_number": f"TI-{chr(65+data_count)}{random.randint(100000000, 999999999)}",
                        "buyer_name": "㈜중구테크",
                        "buyer_business_number": "123-45-67890",
                        "buyer_address": "서울시 중구 세종대로 100",
                        "status": "issued"
                    }],
                    "total_issued_amount": amount,
                    "issued_count": 1
                })
            else:
                result['hometax_tax_invoices'].append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "tax_invoices": [],
                    "total_issued_amount": 0,
                    "issued_count": 0
                })

            data_count += 1
            current_date += timedelta(days=1)

        # 결과 데이터 저장
        os.makedirs('gend', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d')
        filename = f'gend/{data["businessNumber"]}_{timestamp}.log'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        response = jsonify({
            'status': 'success',
            'message': '데이터 생성이 완료되었습니다.',
            'dataCount': data_count,
            'period': f'{data["startDate"]} ~ {data["endDate"]}',
            'generatedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        print("\n=== /gen-smb-revenue API 응답 ===")
        print("Response:", json.dumps(response.json, indent=2, ensure_ascii=False))
        print("==================================\n")
        return response

    except Exception as e:
        print(f"Error in generate_smb_revenue: {str(e)}")
        response = jsonify({'error': str(e)}), 500
        print("\n=== /gen-smb-revenue API 응답 ===")
        print("Response:", json.dumps(response[0].json, indent=2, ensure_ascii=False))
        print("==================================\n")
        return response

@app.route('/fetch-smb-revenue', methods=['POST', 'OPTIONS'])
def fetch_smb_revenue():
    if request.method == 'OPTIONS':
        return '', 200
    try:
        data = request.json
        print("\n=== /fetch-smb-revenue API 호출 파라미터 ===")
        print("Request Data:", json.dumps(data, indent=2, ensure_ascii=False))
        print("==================================\n")

        if not data or 'businessNumber' not in data:
            response = jsonify({'error': 'Business number is required'}), 400
            print("\n=== /fetch-smb-revenue API 응답 ===")
            print("Response:", json.dumps(response[0].json, indent=2, ensure_ascii=False))
            print("==================================\n")
            return response

        # 오늘 날짜로 파일명 생성
        today = datetime.now().strftime('%Y%m%d')
        business_number = data['businessNumber']
        target_filename = f"{business_number}_{today}.log"
        
        # 해당 파일이 존재하는지 확인
        if not os.path.exists(f'gend/{target_filename}'):
            response = jsonify({
                'error': 'No data found for today',
                'message': f'File not found: {target_filename}'
            }), 404
            print("\n=== /fetch-smb-revenue API 응답 ===")
            print("Response:", json.dumps(response[0].json, indent=2, ensure_ascii=False))
            print("==================================\n")
            return response

        # 파일 읽기
        with open(f'gend/{target_filename}', 'r', encoding='utf-8') as f:
            result = json.load(f)

        response = jsonify({
            'status': 'success',
            'data': result,
            'filename': target_filename,
            'retrievedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        print("\n=== /fetch-smb-revenue API 응답 ===")
        print("Response:", json.dumps(response.json, indent=2, ensure_ascii=False))
        print("==================================\n")
        return response

    except Exception as e:
        print(f"Error in fetch_smb_revenue: {str(e)}")
        response = jsonify({'error': str(e)}), 500
        print("\n=== /fetch-smb-revenue API 응답 ===")
        print("Response:", json.dumps(response[0].json, indent=2, ensure_ascii=False))
        print("==================================\n")
        return response

@app.route('/do-collect', methods=['POST', 'OPTIONS'])
def do_collect():
    if request.method == 'OPTIONS':
        print("\n=== /do-collect OPTIONS 요청 ===")
        print("CORS preflight 요청 처리")
        print("==================================\n")
        return '', 200

    try:
        print("\n=== /do-collect API 호출 시작 ===")
        data = request.get_json()
        business_number = data.get('businessNumber')
        print(f"요청 데이터: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
        if not business_number:
            print("사업자번호 누락")
            return jsonify({
                'status': 'error',
                'message': '사업자번호가 필요합니다.'
            }), 400

        print(f"\nMongoDB 연결 시도...")
        # MongoDB 연결
        client = MongoClient('mongodb://localhost:27017/')
        db = client['originalData']
        collection = db['sales_data']
        analyzed_db = client['analyzed']
        monthly_sales_collection = analyzed_db['monthly_sales']
        print("MongoDB 연결 성공")

        # 오늘 날짜로 로그 파일 경로 생성
        today = datetime.now().strftime('%Y%m%d')
        log_file = f"{business_number}_{today}.log"
        log_path = os.path.join('gend', log_file)
        print(f"\n로그 파일 확인: {log_path}")

        if not os.path.exists(log_path):
            print(f"로그 파일을 찾을 수 없음: {log_file}")
            return jsonify({
                'status': 'error',
                'message': f'오늘 생성된 데이터 파일을 찾을 수 없습니다: {log_file}'
            }), 404

        print("로그 파일 읽기 시작...")
        # 로그 파일 읽기
        with open(log_path, 'r', encoding='utf-8') as f:
            log_data = json.load(f)
        print("로그 파일 읽기 완료")

        print("\nMongoDB에 데이터 저장 시작...")
        # 데이터 저장
        document = {
            'business_number': business_number,
            'file_name': log_file,
            'merchant_info': log_data['merchant_info'],
            'card_sales_data': log_data['card_sales_data'],
            'baemin': log_data['baemin'],
            'coupangeats': log_data['coupangeats'],
            'yogiyo': log_data['yogiyo'],
            'hometax_cash_receipts': log_data['hometax_cash_receipts'],
            'hometax_tax_invoices': log_data['hometax_tax_invoices'],
            'created_at': datetime.now()
        }
        collection.insert_one(document)
        print("MongoDB 데이터 저장 완료")

        # 월간 매출 데이터 계산 및 저장
        print("\n월간 매출 데이터 계산 시작...")
        monthly_sales = {}
        
        # 카드 매출 데이터 처리
        for daily_data in log_data['card_sales_data']['daily_sales_data']:
            date = datetime.strptime(daily_data['date'], '%Y-%m-%d')
            year_month = f"{date.year}-{date.month:02d}"
            
            if year_month not in monthly_sales:
                monthly_sales[year_month] = {
                    'business_number': business_number,
                    'year': date.year,
                    'month': date.month,
                    'revenue': 0
                }
            
            # 일별 매출 합계 계산
            daily_revenue = sum(txn['total_amount'] for txn in daily_data['approval_details'])
            monthly_sales[year_month]['revenue'] += daily_revenue

        # 배달 앱 매출 데이터 처리
        for platform in ['baemin', 'coupangeats', 'yogiyo']:
            if platform in log_data and 'daily_sales_data' in log_data[platform]:
                for daily_data in log_data[platform]['daily_sales_data']:
                    date = datetime.strptime(daily_data['date'], '%Y-%m-%d')
                    year_month = f"{date.year}-{date.month:02d}"
                    
                    if year_month not in monthly_sales:
                        monthly_sales[year_month] = {
                            'business_number': business_number,
                            'year': date.year,
                            'month': date.month,
                            'revenue': 0
                        }
                    
                    monthly_sales[year_month]['revenue'] += daily_data['total_sales_amount']

        # 월간 매출 데이터 저장
        print("\n월간 매출 데이터 저장 시작...")
        for year_month, data in monthly_sales.items():
            # 기존 데이터가 있는지 확인
            existing_data = monthly_sales_collection.find_one({
                'business_number': business_number,
                'year': data['year'],
                'month': data['month']
            })
            
            if existing_data:
                # 기존 데이터 업데이트
                monthly_sales_collection.update_one(
                    {'_id': existing_data['_id']},
                    {'$set': {'revenue': data['revenue']}}
                )
            else:
                # 새 데이터 삽입
                monthly_sales_collection.insert_one(data)

        # 저장된 월간 매출 데이터 조회
        monthly_sales_data = list(monthly_sales_collection.find(
            {'business_number': business_number},
            {'_id': 1, 'business_number': 1, 'year': 1, 'month': 1, 'revenue': 1}
        ))
        
        # ObjectId를 문자열로 변환
        for data in monthly_sales_data:
            data['_id'] = str(data['_id'])
            
        print("월간 매출 데이터 저장 완료")

        client.close()

        response = {
            'status': 'success',
            'message': '데이터 수집 및 분석이 완료되었습니다.',
            'data': {
                'business_number': business_number,
                'file_name': log_file,
                'collected_at': datetime.now().isoformat(),
                'monthly_sales': monthly_sales_data
            }
        }
        print("\n=== /do-collect API 응답 ===")
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print("==================================\n")
        return jsonify(response), 200

    except Exception as e:
        print(f"\n=== /do-collect API 오류 발생 ===")
        print(f"Error: {str(e)}")
        print("==================================\n")
        return jsonify({
            'status': 'error',
            'message': f'데이터 수집 중 오류가 발생했습니다: {str(e)}'
        }), 500

def get_previous_month():
    today = datetime.now()
    first_day_of_month = today.replace(day=1)
    last_day_of_prev_month = first_day_of_month - timedelta(days=1)
    return last_day_of_prev_month.strftime("%Y%m")

def generate_revenue_distribution(base_revenue, revenue_grade):
    """
    자연스러운 매출 분포를 생성하는 함수
    로그 정규 분포를 사용하여 base_revenue가 선택된 등급 구간에 자연스럽게 분포되도록 함
    """
    # 등급별 구간 정의 (1등급이 가장 높은 매출)
    grade_ranges = {
        1: (90, 100),   # 1등급: top10Avg (상위 10%)
        2: (80, 90),    # 2등급: top20Avg (상위 20%)
        3: (70, 80),    # 3등급: top30Avg (상위 30%)
        4: (60, 70),    # 4등급: top40Avg (상위 40%)
        5: (50, 60),    # 5등급: top50Avg (평균)
        6: (40, 50),    # 6등급: top60Avg (전체 60% 내)
        7: (30, 40),    # 7등급: top70Avg (전체 70% 내)
        8: (20, 30),    # 8등급: top80Avg (하위 30% 이하)
        9: (10, 20),    # 9등급: top90Avg (하위 20% 이하)
        10: (0, 10)     # 10등급: topOthAvg (하위 10% 이하)
    }
    
    # 선택된 등급의 구간 가져오기
    min_percentile, max_percentile = grade_ranges[revenue_grade]
    
    # base_revenue가 선택된 등급 구간의 중간값이 되도록 설정
    target_percentile = (min_percentile + max_percentile) / 2
    
    # 로그 정규 분포 파라미터 설정
    base_mean = np.log(max(base_revenue, 100000))
    base_std = 0.5  # 표준편차는 0.5로 설정하여 적절한 분포 생성
    
    # base_revenue가 target_percentile에 위치하도록 조정
    adjusted_mean = np.log(base_revenue) - (norm.ppf(target_percentile/100) * base_std)
    
    # 로그 정규 분포에서 샘플 생성
    samples = np.random.lognormal(adjusted_mean, base_std, 10000)
    
    # 각 등급별 하한선 값 계산
    distribution = {}
    for grade, (min_p, max_p) in grade_ranges.items():
        if grade == 10:
            key = "topOthAvg"  # 10등급은 topOthAvg
        else:
            key = f"top{grade}0Avg"  # 1-9등급은 topX0Avg
        
        # 퍼센타일 범위를 0-100으로 조정
        min_p = max(0, min_p)
        max_p = min(100, max_p)
        
        # 해당 등급의 하한선 값 계산
        distribution[key] = int(np.percentile(samples, min_p))
    
    # 전체 평균 계산
    distribution["totalAvg"] = int(np.mean(samples))
    
    return distribution

@app.route('/comparison-groups', methods=['POST', 'OPTIONS'])
def generate_comparison_groups():
    if request.method == 'OPTIONS':
        print("\n=== /comparison-groups OPTIONS 요청 ===")
        print("CORS preflight 요청 처리")
        print("==================================\n")
        return '', 200

    try:
        print("\n=== /comparison-groups API 호출 시작 ===")
        data = request.json
        print(f"요청 데이터: {json.dumps(data, indent=2, ensure_ascii=False)}")

        # 필수 파라미터 검증
        zone_nm = data.get('zone_nm')
        if not zone_nm:
            print("zone_nm 누락")
            return jsonify({"error": "zone_nm is required"}), 400
            
        smb_sector = data.get('smb_sector')
        if not smb_sector:
            print("smb_sector 누락")
            return jsonify({"error": "smb_sector is required"}), 400

        # 선택적 파라미터 처리
        smb_city = data.get('smb_city', '서울')
        base_date = data.get('base_date', get_previous_month())
        revenue_grade = min(max(int(data.get('revenue_grade', 4)), 1), 9)
        base_revenue = float(data.get('base_revenue', 500000))

        print(f"\n처리된 파라미터:")
        print(f"zone_nm: {zone_nm}")
        print(f"smb_sector: {smb_sector}")
        print(f"smb_city: {smb_city}")
        print(f"base_date: {base_date}")
        print(f"revenue_grade: {revenue_grade}")
        print(f"base_revenue: {base_revenue}")

        # 매출 분포 생성
        distribution = generate_revenue_distribution(base_revenue, revenue_grade)

        # 응답 데이터 구성
        response = {
            "monthInfo": {
                "percentileRank": str(revenue_grade),
                **distribution
            },
            "monthAmt": int(base_revenue),
            "smb_sector": smb_sector,
            "smb_city": smb_city,
            "zone_nm": zone_nm,
            "base_date": base_date,
            "created_at": datetime.now().isoformat()  # ISO 형식으로 변환
        }

        # MongoDB에 저장
        print("\nMongoDB 연결 시도...")
        client = MongoClient('mongodb://localhost:27017/')
        db = client['analyzed']
        collection = db['comparison_groups']
        
        # 기존 데이터 확인
        existing_data = collection.find_one({
            'zone_nm': zone_nm,
            'smb_sector': smb_sector,
            'smb_city': smb_city,
            'base_date': base_date
        })
        
        if existing_data:
            # 기존 데이터 업데이트
            collection.update_one(
                {'_id': existing_data['_id']},
                {'$set': response}
            )
            print("기존 데이터 업데이트 완료")
        else:
            # 새 데이터 삽입
            collection.insert_one(response)
            print("새 데이터 저장 완료")
        
        client.close()
        print("MongoDB 연결 종료")

        print("\n=== /comparison-groups API 응답 ===")
        print(f"Response: {json.dumps(response, indent=2, ensure_ascii=False)}")
        print("==================================\n")
        return jsonify(response), 200

    except Exception as e:
        print(f"\n=== /comparison-groups API 오류 발생 ===")
        print(f"Error: {str(e)}")
        print("==================================\n")
        return jsonify({
            "error": f"비교군 생성 중 오류가 발생했습니다: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3400, debug=True) 