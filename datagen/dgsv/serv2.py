from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import numpy as np
import secrets
from pymongo import MongoClient
from tqdm import tqdm
app = Flask(__name__)
CORS(app)

# Load sector-specific ratios
with open('smb_sector.json', 'r', encoding='utf-8') as f:
    SECTOR_RATIOS = json.load(f)

# Load user data
with open('smb_users.json', 'r', encoding='utf-8') as f:
    SMB_USERS = json.load(f)

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

# Parse duration
def parse_duration(duration_str):
    # print(f"duration_str: {duration_str}")
    unit = duration_str[-1].lower()
    count = int(duration_str[:-1])
    if unit == 'd':
        return count
    elif unit == 'w':
        return count * 7
    elif unit == 'm':
        return count * 30
    elif unit == 'y':
        return count * 365
    raise ValueError("Invalid duration unit. Use 'd', 'w', 'm', or 'y'.")

# Parse revenue trend
def parse_trend(trend_str):
    parts = trend_str.split('_')
    trend_type = '_'.join(parts[:-1])
    percentage = float(parts[-1]) / 100
    return trend_type, percentage

# Calculate trend factor with zero division protection
def get_trend_factor(day, total_days, trend_type, percentage):
    if total_days == 0:
        return 1
    if trend_type == "slow_increase":
        return 1 + (percentage * day / total_days)
    elif trend_type == "slow_decrease":
        return 1 - (percentage * day / total_days)
    elif trend_type == "increase_up_down_up":
        mid = total_days // 2 or 1
        if day <= mid:
            return 1 + (percentage * day / mid)
        return 1 + (percentage * (total_days - day) / mid)
    elif trend_type == "descrease_down_up_down":
        mid = total_days // 2 or 1
        if day <= mid:
            return 1 - (percentage * day / mid)
        return 1 - (percentage * (total_days - day) / mid)
    return 1

# Generate daily sales data
def generate_sales_data(user, duration_days, weekday_avg_revenue, trend_type, percentage, is_compare=False):
    # today = datetime(2025, 3, 10)
    today = datetime.now() - timedelta(days=1)
    start_date = today - timedelta(days=duration_days - 1)
    sector = next(s for s in SECTOR_RATIOS if s["smb_sector"] == user["smb_sector"])

    total_weekday_avg = weekday_avg_revenue / sector["card_ratio"]
    weekend_boost = random.uniform(1.1, 1.3)
    data = {"card_sales": [], "baemin": [], "coupangeats": [], "yogiyo": [], "cash_receipts": [], "tax_invoices": []}

    daily_noise = np.random.normal(1, 0.1, duration_days)

    for day in range(duration_days):
        current_date = start_date + timedelta(days=day)
        is_weekend = current_date.weekday() >= 5
        base_sales = total_weekday_avg * (weekend_boost if is_weekend else 1)
        trend_factor = get_trend_factor(day, duration_days - 1, trend_type, percentage)
        noise_factor = max(0.8, min(1.2, daily_noise[day]))
        daily_total_sales = int(base_sales * trend_factor * noise_factor)

        offline_sales = int(daily_total_sales * sector["offline_ratio"])
        online_sales = daily_total_sales - offline_sales
        offline_card_sales = int(offline_sales * sector["card_ratio"])
        cash_sales = offline_sales - offline_card_sales
        delivery_sales = int(online_sales * sector["delivery_platform_ratio"])
        per_platform_sales = delivery_sales // 3
        # print(f"day: {day}, current_date: {current_date}, daily_total_sales: {daily_total_sales}, offline_sales: {offline_sales}, online_sales: {online_sales}, offline_card_sales: {offline_card_sales}, cash_sales: {cash_sales}, delivery_sales: {delivery_sales}, per_platform_sales: {per_platform_sales}")

        # 카드 거래
        card_txn_count = random.randint(5, 15)
        card_total = offline_card_sales + online_sales
        card_txns = []
        card_weights = [0.35, 0.30, 0.20, 0.15]
        for _ in range(card_txn_count):
            amount = generate_variable_amount(card_total // card_txn_count, 0.5, 1.5)
            is_offline = random.random() < sector["offline_ratio"]
            approval_time = generate_transaction_time(current_date)
            fee = int(amount * CARD_FEE_RATE)
            card_txns.append({
                "transaction_type": "offline" if is_offline else "online",
                "supply_value": int(amount / 1.1),
                "vat": amount - int(amount / 1.1),
                "total_amount": amount,
                "fee": fee,  # 카드사 수수료 추가
                "net_amount": amount - fee,  # 실수령액 추가
                "card_type": random.choices(CARD_TYPES, weights=card_weights, k=1)[0],
                "approval_number": f"{chr(65+day)}{random.randint(100000000, 999999999)}",
                "approval_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S")
            })
        tempObj = {
            "date": current_date.strftime("%Y-%m-%d"),
            "merchant_name": user["merchant_name"],
            "business_number": user["business_number"],
            "address": user["merchant_address"],
            "approval_details": card_txns,
            "acquisition_details": {
                "acquisition_date": (current_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                "total_supply_value": sum(t["supply_value"] for t in card_txns),
                "total_vat": sum(t["vat"] for t in card_txns),
                "total_amount": sum(t["total_amount"] for t in card_txns),
                "total_fee": sum(t["fee"] for t in card_txns),  # 총 수수료
                "net_amount": sum(t["net_amount"] for t in card_txns),  # 실수령액
                "card_company": "혼합",
                "acquisition_number": f"ACQ-{current_date.strftime('%m%d')}-001"
            }
        }

        if is_compare == False:
            tempObj["deposit_details"] = {
                "deposit_date": (current_date + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "deposit_amount": sum(t["net_amount"] for t in card_txns),  # 수수료 제외 입금액
                    "fee": sum(t["fee"] for t in card_txns),  # 입금 시 수수료 명시
                    "bank": user["deposit_bank"],
                    "account_number": user["account_number"],
                        "deposit_reference": f"DEP-{current_date.strftime('%m%d')}-001"
            }

        data["card_sales"].append(tempObj)

        # 배달 플랫폼
        for platform, due_days in [("baemin", 7), ("coupangeats", 3), ("yogiyo", 1)]:
            txns = []
            for _ in range(random.randint(2, 4)):
                amount = generate_variable_amount(per_platform_sales // 3)
                approval_time = generate_transaction_time(current_date, (12, 22))
                fee = int(amount * DELIVERY_FEE_RATE)
                txns.append({
                    "amount": amount,
                    "fee": fee,  # 배달 앱 수수료 추가
                    "net_amount": amount - fee,  # 실수령액 추가
                    "card_type": random.choices(CARD_TYPES, weights=card_weights, k=1)[0],
                    "approval_number": f"{platform[:2].upper()}-{chr(65+day)}{random.randint(100000000, 999999999)}",
                    "approval_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S")
                })
            total_amount = sum(t["amount"] for t in txns)
            total_fee = sum(t["fee"] for t in txns)
            data[platform].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "daily_sales": txns,
                "total_sales_amount": total_amount,
                "total_fee": total_fee,  # 배달 앱 총 수수료
                "settlement_amount": total_amount - total_fee,  # 수수료 제외 정산액
                "payment_status": "paid" if (today - current_date).days >= due_days else "pending",
                "payment_due_date": (current_date + timedelta(days=due_days)).strftime("%Y-%m-%d"),
                "settlement_reference": f"{platform[:2].upper()}-SET-{current_date.strftime('%m%d')}-001"
            })

        # 현금영수증
        cash_txn_count = random.randint(0, 4) if cash_sales > 0 else 0
        cash_txns = []
        # print(f"cash_txn_count: {cash_txn_count}")
        for _ in range(cash_txn_count):
            amount = generate_variable_amount(cash_sales // (cash_txn_count or 1))
            approval_time = generate_transaction_time(current_date)
            cash_txns.append({
                "amount": amount,
                "receipt_number": f"CR-{current_date.strftime('%y%m%d')}-{str(len(cash_txns)+1).zfill(3)}",
                "issue_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S"),
                "customer_id": f"010-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                "status": "issued"
            })
        data["cash_receipts"].append({
            "date": current_date.strftime("%Y-%m-%d"),
            "cash_receipts": cash_txns,
            "total_cash_amount": cash_sales,
            "total_issued_amount": sum(t["amount"] for t in cash_txns),
            "issued_count": len(cash_txns),
            "non_issued_count": max(0, cash_txn_count - len(cash_txns))
        })

        # 세금계산서
        if duration_days >= 5 and random.random() < sector["tax_invoice_issuance_rate"]:
            amount = generate_variable_amount(50000, 0.8, 1.5)
            approval_time = generate_transaction_time(current_date)
            data["tax_invoices"].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "tax_invoices": [{
                    "invoice_number": f"TI-{current_date.strftime('%y%m%d')}-001",
                    "issue_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "supply_value": int(amount / 1.1),
                    "vat": amount - int(amount / 1.1),
                    "total_amount": amount,
                    "payment_method": "card",
                    "card_type": random.choices(CARD_TYPES, weights=card_weights, k=1)[0],
                    "approval_number": f"TI-{chr(65+day)}{random.randint(100000000, 999999999)}",
                    "buyer_name": "㈜중구테크",
                    "buyer_business_number": "123-45-67890",
                    "buyer_address": "서울시 중구 세종대로 100",
                    "status": "issued"
                }],
                "total_issued_amount": amount,
                "issued_count": 1
            })
        else:
            data["tax_invoices"].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "tax_invoices": [],
                "total_issued_amount": 0,
                "issued_count": 0
            })

    # 최상위 merchant_info 생성 및 각 섹션 데이터 구성
    merchant_info = {}

    if is_compare:
        merchant_info = {key: user[key] for key in ["merchant_name", "business_number", "merchant_address", "smb_sector", "smb_sector_en"]}
        merchant_info["zone_nm"] = user["merchant_address"].split(" ")[1].strip()
    else:
        merchant_info = {key: user[key] for key in ["bid", "merchant_name", "business_number", "business_number_dash", "merchant_address", "merchant_zipcode", "smb_sector", "smb_sector_en", "deposit_bank", "account_number"]}
        merchant_info["zone_nm"] = user["merchant_address"].split(" ")[1].strip()

    return {
        "merchant_info": merchant_info,
        "card_sales_data": {"merchant_info": merchant_info, "daily_sales_data": data["card_sales"]},
        "baemin": {"merchant_info": merchant_info, "daily_sales_data": data["baemin"]},
        "coupangeats": {"merchant_info": merchant_info, "daily_sales_data": data["coupangeats"]},
        "yogiyo": {"merchant_info": merchant_info, "daily_sales_data": data["yogiyo"]},
        "hometax_cash_receipts": {"merchant_info": merchant_info, "daily_cash_receipts_data": data["cash_receipts"]},
        "hometax_tax_invoices": {"merchant_info": merchant_info, "daily_tax_invoices_data": data["tax_invoices"]}
    }

@app.route('/gen-data', methods=['POST'])
def generate_data():
    data = request.json
    business_number = data.get("business_number")
    gen_duration = data.get("gen_duration")
    weekday_avg_revenue = data.get("weekday_avg_revenue")
    revenue_trend = data.get("revenue_trend")

    if not all([business_number, gen_duration, weekday_avg_revenue, revenue_trend]):
        return jsonify({"error": "Missing required fields"}), 400

    user = next((u for u in SMB_USERS if u["business_number"] == business_number), None)
    if not user:
        return jsonify({"error": "Business number not found"}), 404

    try:
        duration_days = parse_duration(gen_duration)
        trend_type, percentage = parse_trend(revenue_trend)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    result = generate_sales_data(user, duration_days, weekday_avg_revenue, trend_type, percentage)
    return jsonify(result)

@app.route('/gen-data-temporary', methods=['POST'])
def generate_compare_data():
    data = request.json
    business_number = data.get("business_number")
    gen_duration = data.get("gen_duration")
    weekday_avg_revenue = data.get("weekday_avg_revenue")

    user = next((u for u in SMB_USERS if u["business_number"] == business_number), None)

    result_list = []
    print(f"총 100 개의 데이터를 생성 중...")
    for idx in tqdm(range(0, 100, 1)):
        random_number = f"10010{secrets.randbelow(100000):05}"

        user_copy = {}
        user_copy["business_number"] = random_number
        user_copy["merchant_name"] = f"가맹점{random_number}"
        user_copy["merchant_address"] = user["merchant_address"]
        user_copy["smb_sector"] = user["smb_sector"]
        user_copy["smb_sector_en"] = user["smb_sector_en"]

        trend_list = ["slow_increase", "slow_decrease", "increase_up_down_up", "descrease_down_up_down"]
        revenue_trend = random.choice(trend_list) + "_" + str(random.randint(1, 100))

        randomized_revenue = weekday_avg_revenue + random.randint(
            -int(weekday_avg_revenue * 0.2),  # -20%
            int(weekday_avg_revenue * 0.2)   # +20%
        )

        try:
            duration_days = parse_duration(gen_duration)
            trend_type, percentage = parse_trend(revenue_trend)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        result = generate_sales_data(user_copy, duration_days, randomized_revenue, trend_type, percentage, True)
        result_list.append(result)

    # MongoDB 연결
    client = MongoClient('mongodb://localhost:27017/')
    db = client['originalData']
    collection = db['sales_data']

    print(f"총 {len(result_list)}개의 데이터를 삽입 중...")
    for idx in tqdm(range(0, len(result_list), 5)):
        batch = result_list[idx:idx+5]
        collection.insert_many(batch)
    client.close()

    return jsonify({"message": "정상 처리되었습니다."})

@app.route('/users', methods=['GET'])
def get_users():
    try:
        return jsonify(SMB_USERS)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/rtrend', methods=['GET'])
def get_revenue_trends():
    possible_trends = [
        "slow_increase_10",
        "slow_decrease_15",
        "increase_up_down_up_10",
        "descrease_down_up_down_10"
    ]
    trend_types = sorted(set('_'.join(t.split('_')[:-1]) for t in possible_trends))
    return jsonify(trend_types)

@app.route('/sectors', methods=['GET'])
def get_sectors():
    try:
        # SECTOR_RATIOS에서 smb_sector 값만 추출하여 중복 제거 후 정렬
        sectors = sorted(set(sector["smb_sector"] for sector in SECTOR_RATIOS))
        return jsonify(sectors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/gen-sales', methods=['POST'])
def gen_salse():
    try:
        data = request.json
        print("\n=== /gen-sales API 호출 파라미터 ===")
        print("Business Info:", json.dumps(data.get('business_info', {}), indent=2, ensure_ascii=False))
        print("Sales Data:", json.dumps(data.get('sales_data', {}), indent=2, ensure_ascii=False))
        print("Date Range:", json.dumps(data.get('date_range', {}), indent=2, ensure_ascii=False))
        print("Trend:", json.dumps(data.get('trend', {}), indent=2, ensure_ascii=False))
        print("Seasonality:", json.dumps(data.get('seasonality', {}), indent=2, ensure_ascii=False))
        print("==================================\n")

        # 필수 필드 검증
        business_info = data.get('business_info', {})
        sales_data = data.get('sales_data', {})
        date_range = data.get('date_range', {})
        trend = data.get('trend', {})
        seasonality = data.get('seasonality', {})

        # 필수 필드 검증
        required_fields = {
            'business_info': ['business_number', 'business_type', 'business_days'],
            'sales_data': ['weekday_avg_sales'],
            'date_range': ['start_date', 'end_date']
        }

        for section, fields in required_fields.items():
            for field in fields:
                if not data.get(section, {}).get(field):
                    return jsonify({'error': f'Missing required field: {section}.{field}'}), 400

        # 배달 비율 검증
        if sales_data.get('has_delivery'):
            delivery_ratios = sales_data.get('delivery_ratios', {})
            if not all(key in delivery_ratios for key in ['baemin', 'coupang_eats', 'yogiyo']):
                return jsonify({'error': 'Missing delivery platform ratios'}), 400
            if sum(delivery_ratios.values()) != 100:
                return jsonify({'error': 'Delivery platform ratios must sum to 100%'}), 400

        # 온라인 판매 비율 검증
        if sales_data.get('has_online_sales'):
            online_ratios = sales_data.get('online_sales_ratios', {})
            if not all(key in online_ratios for key in ['smart_store', 'eleven_street', 'gmarket']):
                return jsonify({'error': 'Missing online sales platform ratios'}), 400
            if sum(online_ratios.values()) != 100:
                return jsonify({'error': 'Online sales platform ratios must sum to 100%'}), 400

        # 날짜 형식 검증
        try:
            start_date = datetime.strptime(date_range['start_date'], '%Y-%m-%d')
            end_date = datetime.strptime(date_range['end_date'], '%Y-%m-%d')
            if start_date > end_date:
                return jsonify({'error': 'Start date must be before end date'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # 매출 데이터 생성
        result = generate_sales_data_v2(
            business_info=business_info,
            sales_data=sales_data,
            date_range=date_range,
            trend=trend,
            seasonality=seasonality
        )

        # 임시 파일로 저장
        business_number = business_info.get('business_number', 'unknown')
        timestamp = datetime.now().strftime('%Y%m%d')
        filename = f'gen_{business_number}_{timestamp}.log'
        
        # 결과 데이터에 메타데이터 추가
        result_with_meta = {
            'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'business_info': business_info,
            'sales_data': sales_data,
            'date_range': date_range,
            'trend': trend,
            'seasonality': seasonality,
            'sales_data': result
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(result_with_meta, f, ensure_ascii=False, indent=2)
        print(f"\n생성된 데이터가 {filename} 파일로 저장되었습니다.")

        return jsonify(result)

    except Exception as e:
        print(f"Error in generate_sales_data: {str(e)}")
        return jsonify({'error': str(e)}), 500

def generate_sales_data_v2(business_info, sales_data, date_range, trend, seasonality):
    # 기본 설정
    start_date = datetime.strptime(date_range['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(date_range['end_date'], '%Y-%m-%d')
    
    # business_days를 숫자 배열로 변환
    weekday_map = {
        'mon': 0, 'monday': 0,
        'tue': 1, 'tuesday': 1,
        'wed': 2, 'wednesday': 2,
        'thu': 3, 'thursday': 3,
        'fri': 4, 'friday': 4,
        'sat': 5, 'saturday': 5,
        'sun': 6, 'sunday': 6
    }
    
    # 요일 문자열을 소문자로 변환하고 매핑
    business_days = [weekday_map[day.lower()] for day in business_info.get('business_days', [])]
    
    # 매출 기본값 설정
    weekday_avg_sales = int(sales_data.get('weekday_avg_sales', 0))
    
    # 배달 비율 설정
    delivery_ratios = sales_data.get('delivery_ratios', {
        'baemin': 55,
        'coupang_eats': 40,
        'yogiyo': 5
    }) if sales_data.get('has_delivery', False) else {
        'baemin': 0,
        'coupang_eats': 0,
        'yogiyo': 0
    }
    
    # 온라인 판매 비율 설정
    online_sales_ratios = sales_data.get('online_sales_ratios', {
        'smart_store': 40,
        'eleven_street': 30,
        'gmarket': 30
    }) if sales_data.get('has_online_sales', False) else {
        'smart_store': 0,
        'eleven_street': 0,
        'gmarket': 0
    }

    # 트렌드 설정
    trend_type = trend.get('type', 'stable')
    trend_rate = float(trend.get('rate', 0))
    trend_deviation = float(trend.get('deviation', 0))

    # 시즌성 설정
    seasonality_pattern = seasonality.get('pattern', 'low')
    seasonality_intensity = float(seasonality.get('intensity', 0))

    # 결과 데이터 초기화
    result = {
        'merchant': [],
        'approval': [],
        'acquisition': [],
        'deposit': [],
        'baemin': [],
        'coupangeats': [],
        'yogiyo': [],
        'cash': [],
        'tax': []
    }

    # 시즌성 패턴에 따른 계수 설정
    def get_seasonality_factor(date, pattern, intensity):
        month = date.month
        if pattern == 'low':
            # 겨울철(12-2월) 저조기
            if month in [12, 1, 2]:
                return 1 - (intensity / 100)
            # 여름철(6-8월) 저조기
            elif month in [6, 7, 8]:
                return 1 - (intensity / 200)
            else:
                return 1
        elif pattern == 'high':
            # 봄철(3-5월) 성수기
            if month in [3, 4, 5]:
                return 1 + (intensity / 100)
            # 가을철(9-11월) 성수기
            elif month in [9, 10, 11]:
                return 1 + (intensity / 200)
            else:
                return 1
        else:  # 'stable'
            return 1

    # 일별 데이터 생성
    current_date = start_date
    while current_date <= end_date:
        # 영업일 여부 확인 - business_days에 포함된 요일만 영업
        if current_date.weekday() not in business_days:
            current_date += timedelta(days=1)
            continue

        # 기본 매출액 계산
        base_sales = weekday_avg_sales
        
        # 시즌성 계수 적용
        seasonality_factor = get_seasonality_factor(current_date, seasonality_pattern, seasonality_intensity)
        adjusted_sales = int(base_sales * seasonality_factor)

        # 트렌드 계수 적용
        days_passed = (current_date - start_date).days
        total_days = (end_date - start_date).days
        trend_factor = get_trend_factor(days_passed, total_days, trend_type, trend_rate)
        final_sales = int(adjusted_sales * trend_factor)

        # 거래 데이터 생성
        transaction_time = generate_transaction_time(current_date)
        
        # 카드 거래
        card_txn = {
            "transaction_type": "offline",
            "supply_value": int(final_sales / 1.1),
            "vat": final_sales - int(final_sales / 1.1),
            "total_amount": final_sales,
            "fee": int(final_sales * CARD_FEE_RATE),
            "net_amount": final_sales - int(final_sales * CARD_FEE_RATE),
            "card_type": random.choice(CARD_TYPES),
            "approval_number": f"{chr(65+days_passed)}{random.randint(100000000, 999999999)}",
            "approval_datetime": transaction_time.strftime("%Y-%m-%d %H:%M:%S")
        }

        # 결과에 추가
        result['approval'].append({
            "date": current_date.strftime("%Y-%m-%d"),
            "merchant_name": business_info.get('business_name', ''),
            "business_number": business_info.get('business_number', ''),
            "approval_details": [card_txn]
        })

        # 배달 플랫폼 데이터 생성
        if delivery_ratios:
            for platform, ratio in delivery_ratios.items():
                if ratio > 0:
                    platform_sales = int(final_sales * (ratio / 100))
                    platform_txn = {
                        "amount": platform_sales,
                        "fee": int(platform_sales * DELIVERY_FEE_RATE),
                        "net_amount": platform_sales - int(platform_sales * DELIVERY_FEE_RATE),
                        "approval_number": f"{platform[:2].upper()}-{chr(65+days_passed)}{random.randint(100000000, 999999999)}",
                        "approval_datetime": transaction_time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    result[platform].append({
                        "date": current_date.strftime("%Y-%m-%d"),
                        "daily_sales": [platform_txn],
                        "total_sales_amount": platform_sales,
                        "total_fee": int(platform_sales * DELIVERY_FEE_RATE),
                        "settlement_amount": platform_sales - int(platform_sales * DELIVERY_FEE_RATE)
                    })

        current_date += timedelta(days=1)

    return result

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3399)