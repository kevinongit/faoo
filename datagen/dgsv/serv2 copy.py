from flask import Flask, request, jsonify
from flask_cors import CORS  # 추가
import json
import random
from datetime import datetime, timedelta
import numpy as np  # 변동성 추가를 위해

app = Flask(__name__)
CORS(app)  # 모든 출처 허용. 특정 출처만 허용하려면 CORS(app, resources={r"/*": {"origins": "http://localhost:3010"}})

# Load sector-specific ratios
with open('smb_sector.json', 'r', encoding='utf-8') as f:
    SECTOR_RATIOS = json.load(f)

# Load user data
with open('smb_users.json', 'r', encoding='utf-8') as f:
    SMB_USERS = json.load(f)

CARD_TYPES = ["신한카드", "삼성카드", "현대카드", "롯데카드"]

# 현실적인 시간 분포 생성 (피크타임 반영)
def generate_transaction_time(base_date, hour_range=(11, 20)):
    # 점심(11-14), 저녁(17-20) 피크타임 가중치 반영
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
    print(f"duration_str: {duration_str}")
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
    # total_days가 0일 경우 기본값 반환 (변화 없음)
    if total_days == 0:
        return 1
    
    if trend_type == "slow_increase":
        return 1 + (percentage * day / total_days)
    elif trend_type == "slow_decrease":
        return 1 - (percentage * day / total_days)
    elif trend_type == "increase_up_down_up":
        mid = total_days // 2 or 1  # mid가 0이 되지 않도록 최소 1 보장
        if day <= mid:
            return 1 + (percentage * day / mid)
        return 1 + (percentage * (total_days - day) / mid)
    elif trend_type == "descrease_down_up_down":
        mid = total_days // 2 or 1  # mid가 0이 되지 않도록 최소 1 보장
        if day <= mid:
            return 1 - (percentage * day / mid)
        return 1 - (percentage * (total_days - day) / mid)
    return 1

# Generate daily sales data
def generate_sales_data(user, duration_days, weekday_avg_revenue, trend_type, percentage):
    today = datetime(2025, 3, 10)
    start_date = today - timedelta(days=duration_days - 1)
    sector = next(s for s in SECTOR_RATIOS if s["smb_sector"] == user["smb_sector_en"])
    
    total_weekday_avg = weekday_avg_revenue / sector["card_ratio"]
    weekend_boost = random.uniform(1.1, 1.3)  # 주말 부스트도 약간 변동
    data = {"card_sales": [], "baemin": [], "coupangeats": [], "yogiyo": [], "cash_receipts": [], "tax_invoices": []}
    
    # 일별 변동성을 위한 노이즈 생성 (trend와 독립적)
    daily_noise = np.random.normal(1, 0.1, duration_days)  # 평균 1, 표준편차 0.1
    
    for day in range(duration_days):
        current_date = start_date + timedelta(days=day)
        is_weekend = current_date.weekday() >= 5
        base_sales = total_weekday_avg * (weekend_boost if is_weekend else 1)
        trend_factor = get_trend_factor(day, duration_days - 1, trend_type, percentage)
        noise_factor = max(0.8, min(1.2, daily_noise[day]))  # 노이즈 범위 제한
        daily_total_sales = int(base_sales * trend_factor * noise_factor)
        
        offline_sales = int(daily_total_sales * sector["offline_ratio"])
        online_sales = daily_total_sales - offline_sales
        offline_card_sales = int(offline_sales * sector["card_ratio"])
        cash_sales = offline_sales - offline_card_sales
        delivery_sales = int(online_sales * sector["delivery_platform_ratio"])
        per_platform_sales = delivery_sales // 3
        
        # 카드 거래 (현실적 시간과 금액 분포)
        card_txn_count = random.randint(5, 15)  # 거래 건수 변동 폭 확대
        card_total = offline_card_sales + online_sales
        card_txns = []
        card_weights = [0.35, 0.30, 0.20, 0.15]  # 카드사별 현실적 비율 (신한, 삼성, 현대, 롯데)
        for _ in range(card_txn_count):
            amount = generate_variable_amount(card_total // card_txn_count, 0.5, 1.5)
            is_offline = random.random() < sector["offline_ratio"]
            approval_time = generate_transaction_time(current_date)
            card_txns.append({
                "transaction_type": "offline" if is_offline else "online",
                "supply_value": int(amount / 1.1),
                "vat": amount - int(amount / 1.1),
                "total_amount": amount,
                "card_type": random.choices(CARD_TYPES, weights=card_weights, k=1)[0],
                "approval_number": f"{chr(65+day)}{random.randint(100000000, 999999999)}",
                "approval_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S")
            })
        data["card_sales"].append({
            "date": current_date.strftime("%Y-%m-%d"),
            "merchant_name": user["merchant_name"],
            "biz_number": user["biz_number"],
            "address": user["merchant_address"],
            "approval_details": card_txns,
            "acquisition_details": {
                "acquisition_date": (current_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                "total_supply_value": sum(t["supply_value"] for t in card_txns),
                "total_vat": sum(t["vat"] for t in card_txns),
                "total_amount": sum(t["total_amount"] for t in card_txns),
                "card_company": "혼합",
                "acquisition_number": f"ACQ-{current_date.strftime('%m%d')}-001"
            },
            "deposit_details": {
                "deposit_date": (current_date + timedelta(days=3)).strftime("%Y-%m-%d"),
                "deposit_amount": sum(t["total_amount"] for t in card_txns),
                "bank": user["deposit_bank"],
                "account_number": user["account_number"],
                "deposit_reference": f"DEP-{current_date.strftime('%m%d')}-001"
            }
        })
        
        # 배달 플랫폼 (시간과 금액 변동 추가)
        for platform, due_days in [("baemin", 7), ("coupangeats", 3), ("yogiyo", 1)]:
            txns = []
            for _ in range(random.randint(2, 4)):  # 플랫폼별 거래 건수 변동
                amount = generate_variable_amount(per_platform_sales // 3)
                approval_time = generate_transaction_time(current_date, (12, 22))  # 배달은 저녁 피크
                txns.append({
                    "amount": amount,
                    "card_type": random.choices(CARD_TYPES, weights=card_weights, k=1)[0],
                    "approval_number": f"{platform[:2].upper()}-{chr(65+day)}{random.randint(100000000, 999999999)}",
                    "approval_datetime": approval_time.strftime("%Y-%m-%d %H:%M:%S")
                })
            data[platform].append({
                "date": current_date.strftime("%Y-%m-%d"),
                "daily_sales": txns,
                "total_sales_amount": sum(t["amount"] for t in txns),
                "settlement_amount": sum(t["amount"] for t in txns),
                "payment_status": "paid" if (today - current_date).days >= due_days else "pending",
                "payment_due_date": (current_date + timedelta(days=due_days)).strftime("%Y-%m-%d"),
                "settlement_reference": f"{platform[:2].upper()}-SET-{current_date.strftime('%m%d')}-001"
            })
        
        # 현금영수증 (현실적 변동)
        cash_txn_count = random.randint(0, 4) if cash_sales > 0 else 0
        cash_txns = []
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
        
        # 세금계산서 (기존 로직 유지, 금액 변동 추가)
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
                    "buyer_biz_number": "123-45-67890",
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
    
    return {k: {"merchant_info": {key: user[key] for key in ["bid", "merchant_name", "biz_number", "biz_number_dash", "merchant_address", "merchant_zipcode", "smb_sector", "smb_sector_en", "deposit_bank", "account_number"]}, 
                f"daily_{k}_data" if k in ["cash_receipts", "tax_invoices"] else "daily_sales_data": v} 
            for k, v in data.items()}

@app.route('/gen-data', methods=['POST'])
def generate_data():
    data = request.json
    business_number = data.get("business_number")
    gen_duration = data.get("gen_duration")
    weekday_avg_revenue = data.get("weekday_avg_revenue")
    revenue_trend = data.get("revenue_trend")
    
    if not all([business_number, gen_duration, weekday_avg_revenue, revenue_trend]):
        return jsonify({"error": "Missing required fields"}), 400
    
    user = next((u for u in SMB_USERS if u["biz_number"] == business_number), None)
    if not user:
        return jsonify({"error": "Business number not found"}), 404
    
    try:
        duration_days = parse_duration(gen_duration)
        trend_type, percentage = parse_trend(revenue_trend)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
    result = generate_sales_data(user, duration_days, weekday_avg_revenue, trend_type, percentage)
    return jsonify({
        "card_sales_data": result["card_sales"],
        "baemin": result["baemin"],
        "coupangeats": result["coupangeats"],
        "yogiyo": result["yogiyo"],
        "hometax_cash_receipts": result["cash_receipts"],
        "hometax_tax_invoices": result["tax_invoices"]
    })

# New endpoint: /users
@app.route('/users', methods=['GET'])
def get_users():
    try:
        return jsonify(SMB_USERS)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New endpoint: /rtrend
@app.route('/rtrend', methods=['GET'])
def get_revenue_trends():
    # Define possible revenue trends from parse_trend logic
    possible_trends = [
        "slow_increase_10",
        "slow_decrease_15",
        "increase_up_down_up_10",
        "descrease_down_up_down_10"
    ]
    # Extract unique trend types (excluding last _number)
    trend_types = sorted(set('_'.join(t.split('_')[:-1]) for t in possible_trends))
    return jsonify(trend_types)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3400)