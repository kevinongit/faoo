from flask import Flask, request, jsonify
import pandas as pd
import json
from datetime import datetime, timedelta

app = Flask(__name__)

# smb_users.json과 smb_sector.json을 로드
with open('smb_users.json') as f:
    smb_users = json.load(f)

with open('smb_sector.json') as f:
    smb_sector = json.load(f)

# 업종별 기본 정보
sector_info = {
    "치킨": {"offline_ratio": 0.4, "online_ratio": 0.6, "card_ratio": 0.8, "cash_ratio": 0.2, "tax_invoice_issuance_rate": 0.05, "delivery_platform_ratio": 0.5},
    "피자": {"offline_ratio": 0.2, "online_ratio": 0.8, "card_ratio": 0.85, "cash_ratio": 0.15, "tax_invoice_issuance_rate": 0.05, "delivery_platform_ratio": 0.4},
    "족발": {"offline_ratio": 0.5, "online_ratio": 0.5, "card_ratio": 0.75, "cash_ratio": 0.25, "tax_invoice_issuance_rate": 0.02, "delivery_platform_ratio": 0.45},
    "한식": {"offline_ratio": 0.7, "online_ratio": 0.3, "card_ratio": 0.65, "cash_ratio": 0.35, "tax_invoice_issuance_rate": 0.01, "delivery_platform_ratio": 0.2},
}

# 매출 추이 함수
def calculate_revenue_trend(weekday_avg_revenue, revenue_trend, duration):
    trend_type, percentage = revenue_trend.split('_')
    percentage = float(percentage)
    
    if trend_type == "slow_increase":
        return [weekday_avg_revenue * (1 + (percentage / 100) * i / duration) for i in range(duration)]
    elif trend_type == "slow_decrease":
        return [weekday_avg_revenue * (1 - (percentage / 100) * i / duration) for i in range(duration)]
    elif trend_type == "increase_up_down_up":
        mid_point = duration // 2
        return [weekday_avg_revenue * (1 + (percentage / 100) * i / mid_point) if i < mid_point else 
                weekday_avg_revenue * (1 - (percentage / 100) * (i - mid_point) / (duration - mid_point)) if i < duration * 3 // 4 else 
                weekday_avg_revenue * (1 + (percentage / 100) * (i - duration * 3 // 4) / (duration - duration * 3 // 4)) for i in range(duration)]
    elif trend_type == "decrease_down_up_down":
        mid_point = duration // 2
        return [weekday_avg_revenue * (1 - (percentage / 100) * i / mid_point) if i < mid_point else 
                weekday_avg_revenue * (1 + (percentage / 100) * (i - mid_point) / (duration - mid_point)) if i < duration * 3 // 4 else 
                weekday_avg_revenue * (1 - (percentage / 100) * (i - duration * 3 // 4) / (duration - duration * 3 // 4)) for i in range(duration)]

# 데이터 생성 함수
def generate_data(business_number, gen_duration, weekday_avg_revenue, revenue_trend):
    # 사용자 정보 가져오기
    user_info = next((user for user in smb_users if user['biz_number'] == business_number), None)
    if user_info is None:
        return jsonify({"error": "Invalid business number"}), 400
    
    # 업종 정보 가져오기
    sector_name = user_info['smb_sector_en']
    sector_data = next((sector for sector in smb_sector if sector['smb_sector_en'] == sector_name), None)
    
    # 기간 계산
    duration = int(''.join(filter(str.isdigit, gen_duration)))
    period = gen_duration[-1]
    if period == 'd':
        end_date = datetime.now()
        start_date = end_date - timedelta(days=duration)
    elif period == 'w':
        end_date = datetime.now()
        start_date = end_date - timedelta(weeks=duration)
    elif period == 'm':
        end_date = datetime.now()
        start_date = end_date - timedelta(days=duration*30)
    elif period == 'y':
        end_date = datetime.now()
        start_date = end_date - timedelta(days=duration*365)
    
    # 매출 추이 계산
    daily_revenues = calculate_revenue_trend(weekday_avg_revenue, revenue_trend, duration)
    
    # 데이터 생성
    data = []
    for i, date in enumerate(pd.date_range(start=start_date, end=end_date, freq='D')):
        daily_data = {
            "date": date.strftime('%Y-%m-%d'),
            "daily_sales": [],
            "total_sales_amount": 0,
            "settlement_amount": 0,
            "payment_status": "paid",
            "payment_due_date": (date + timedelta(days=1)).strftime('%Y-%m-%d'),
            "settlement_reference": f"SET-{date.strftime('%Y%m%d')}-001"
        }
        
        # 매출 데이터 생성
        revenue = daily_revenues[i]
        if date.weekday() >= 5:  # 주말은 매출이 낮아짐
            revenue *= 0.8
        
        # 온라인, 오프라인 매출 분리
        online_revenue = revenue * sector_data['online_ratio']
        offline_revenue = revenue * sector_data['offline_ratio']
        
        # 카드, 현금 분리
        online_card_revenue = online_revenue * sector_data['card_ratio']
        offline_card_revenue = offline_revenue * sector_data['card_ratio']
        offline_cash_revenue = offline_revenue * sector_data['cash_ratio']
        
        # 배달 플랫폼 매출 분리
        delivery_revenue = revenue * sector_data['delivery_platform_ratio']
        
        # 세금 계산서 발행 여부
        tax_invoice = True if i % 10 == 0 and duration >= 5 else False
        
        # 거래 데이터 생성
        daily_data['daily_sales'].append({
            "amount": int(online_card_revenue * 0.4),  # 요기요
            "card_type": "삼성카드",
            "approval_number": f"YG-A{i}",
            "approval_datetime": f"{date.strftime('%Y-%m-%d')} 13:00:00"
        })
        daily_data['daily_sales'].append({
            "amount": int(online_card_revenue * 0.3),  # 배달의민족
            "card_type": "현대카드",
            "approval_number": f"BM-A{i}",
            "approval_datetime": f"{date.strftime('%Y-%m-%d')} 18:00:00"
        })
        daily_data['daily_sales'].append({
            "amount": int(online_card_revenue * 0.3),  # 쿠팡이츠
            "card_type": "롯데카드",
            "approval_number": f"CP-A{i}",
            "approval_datetime": f"{date.strftime('%Y-%m-%d')} 19:45:00"
        })
        daily_data['daily_sales'].append({
            "amount": int(offline_card_revenue),  # 오프라인 카드
            "card_type": "신한카드",
            "approval_number": f"OFF-A{i}",
            "approval_datetime": f"{date.strftime('%Y-%m-%d')} 12:15:00"
        })
        daily_data['daily_sales'].append({
            "amount": int(offline_cash_revenue),  # 오프라인 현금
            "card_type": None,
            "approval_number": None,
            "approval_datetime": f"{date.strftime('%Y-%m-%d')} 17:30:00"
        })
        
        # 총 매출 계산
        daily_data['total_sales_amount'] = sum([sale['amount'] for sale in daily_data['daily_sales']])
        daily_data['settlement_amount'] = daily_data['total_sales_amount']
        
        # 세금 계산서 발행
        if tax_invoice:
            daily_data['tax_invoice'] = True
        
        data.append(daily_data)
    
    return jsonify(data)

@app.route('/generate_data', methods=['POST'])
def generate():
    data = request.json
    business_number = data.get('business_number')
    gen_duration = data.get('gen_duration')
    weekday_avg_revenue = data.get('weekday_avg_revenue')
    revenue_trend = data.get('revenue_trend')
    
    return generate_data(business_number, gen_duration, weekday_avg_revenue, revenue_trend)

if __name__ == '__main__':
    app.run(debug=True)
