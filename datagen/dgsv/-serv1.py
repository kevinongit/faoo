from flask import Flask, request, jsonify
import json
import random
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# Load input JSON files
with open('smb_sector.json', 'r', encoding='utf-8') as f:
    smb_sector_data = json.load(f)
with open('smb_users.json', 'r', encoding='utf-8') as f:
    smb_users_data = json.load(f)

# Sector-specific ratios
sector_ratios = {item["smb_sector"]: item for item in smb_sector_data}
card_types = ["신한카드", "삼성카드", "현대카드", "롯데카드"]

# Parse duration
def parse_duration(duration_str):
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

# Generate trend factor
def get_trend_factor(day, total_days, trend_type, percentage):
    if trend_type == "slow_increase":
        return 1 + (percentage * day / total_days)
    elif trend_type == "slow_decrease":
        return 1 - (percentage * day / total_days)
    elif trend_type == "increase_up_down_up":
        if day < total_days / 3:
            return 1 + (percentage * day / (total_days / 3))
        elif day < 2 * total_days / 3:
            return 1 + percentage - (percentage * (day - total_days / 3) / (total_days / 3))
        else:
            return 1 + (percentage * (day - 2 * total_days / 3) / (total_days / 3))
    elif trend_type == "descrease_down_up_down":
        if day < total_days / 3:
            return 1 - (percentage * day / (total_days / 3))
        elif day < 2 * total_days / 3:
            return 1 - percentage + (percentage * (day - total_days / 3) / (total_days / 3))
        else:
            return 1 - (percentage * (day - 2 * total_days / 3) / (total_days / 3))
    return 1

# Generate JSON data
def generate_data(business_number, gen_duration, weekday_avg_revenue, revenue_trend):
    # Find merchant by business number
    merchant = next((user for user in smb_users_data if user["biz_number"] == business_number), None)
    if not merchant:
        raise ValueError(f"Business number {business_number} not found in smb_users.json")
    
    sector = merchant["smb_sector_en"]
    ratios = sector_ratios[sector]
    total_days = parse_duration(gen_duration)
    today = datetime(2025, 3, 10)  # Current date from system context
    start_date = today - timedelta(days=total_days - 1)
    
    # Adjust weekday average to total revenue (card + cash)
    total_weekday_avg = weekday_avg_revenue / ratios["card_ratio"]
    weekend_boost = 1.2  # 20% increase on weekends
    
    # Data containers
    card_sales_data = []
    baemin_data = {"merchant_info": merchant, "daily_sales_data": []}
    coupangeats_data = {"merchant_info": merchant, "daily_sales_data": []}
    yogiyo_data = {"merchant_info": merchant, "daily_sales_data": []}
    cash_receipt_data = {"merchant_info": merchant, "daily_cash_receipt_data": []}
    tax_invoice_data = {"merchant_info": merchant, "daily_tax_invoice_data": []}
    
    for day in range(total_days):
        current_date = start_date + timedelta(days=day)
        is_weekend = current_date.weekday() >= 5
        base_revenue = total_weekday_avg * (weekend_boost if is_weekend else 1)
        trend_factor = get_trend_factor(day, total_days - 1, *parse_trend(revenue_trend))
        daily_total_revenue = int(base_revenue * trend_factor)
        
        # Split revenue
        offline_revenue = int(daily_total_revenue * ratios["offline_ratio"])
        online_revenue = daily_total_revenue - offline_revenue
        card_revenue = int(daily_total_revenue * ratios["card_ratio"])
        cash_revenue = daily_total_revenue - card_revenue
        
        # Offline card transactions
        offline_card_revenue = int(offline_revenue * ratios["card_ratio"])
        offline_txn_count = random.randint(5, 10)
        offline_card_amounts = [random.randint(10000, 20000) for _ in range(offline_txn_count)]
        offline_card_total = sum(offline_card_amounts)
        if offline_card_total != offline_card_revenue:
            offline_card_amounts[-1] += offline_card_revenue - offline_card_total
        
        # Online card transactions (delivery platforms)
        online_card_revenue = card_revenue - offline_card_revenue
        delivery_revenue = int(online_card_revenue * ratios["delivery_platform_ratio"])
        baemin_revenue = int(delivery_revenue * 0.4)  # 40% of delivery
        coupangeats_revenue = int(delivery_revenue * 0.4)  # 40% of delivery
        yogiyo_revenue = delivery_revenue - baemin_revenue - coupangeats_revenue  # Remaining
        
        for platform, revenue in [("baemin", baemin_revenue), ("coupangeats", coupangeats_revenue), ("yogiyo", yogiyo_revenue)]:
            txn_count = random.randint(2, 5)
            amounts = [random.randint(10000, 20000) for _ in range(txn_count)]
            total = sum(amounts)
            if total != revenue:
                amounts[-1] += revenue - total
            daily_sales = [{"amount": amt, "card_type": random.choice(card_types), "approval_number": f"{platform[0].upper()}-{chr(65+day)}{random.randint(1000000, 9999999)}", "approval_datetime": (current_date + timedelta(hours=12 + i)).strftime("%Y-%m-%d %H:%M:%S")} for i, amt in enumerate(amounts)]
            payment_due = current_date + timedelta(days=7 if platform == "baemin" else 3 if platform == "coupangeats" else 1)
            payment_status = "paid" if payment_due <= today else "pending"
            sales_data = {"date": current_date.strftime("%Y-%m-%d"), "daily_sales": daily_sales, "total_sales_amount": revenue, "settlement_amount": revenue, "payment_status": payment_status, "payment_due_date": payment_due.strftime("%Y-%m-%d"), "settlement_reference": f"{platform[0].upper()}-SET-{payment_due.strftime('%m%d')}-001"}
            if platform == "baemin":
                baemin_data["daily_sales_data"].append(sales_data)
            elif platform == "coupangeats":
                coupangeats_data["daily_sales_data"].append(sales_data)
            else:
                yogiyo_data["daily_sales_data"].append(sales_data)
        
        # Card sales data
        card_approval_details = [{"transaction_type": "offline", "supply_value": int(amt / 1.1), "vat": amt - int(amt / 1.1), "total_amount": amt, "card_type": random.choice(card_types), "approval_number": f"C-{chr(65+day)}{random.randint(1000000, 9999999)}", "approval_datetime": (current_date + timedelta(hours=11 + i)).strftime("%Y-%m-%d %H:%M:%S")} for i, amt in enumerate(offline_card_amounts)]
        card_sales_data.append({
            "date": current_date.strftime("%Y-%m-%d"), "merchant_name": merchant["merchant_name"], "biz_number": merchant["biz_number"], "address": merchant["merchant_address"],
            "approval_details": card_approval_details,
            "acquisition_details": {"acquisition_date": (current_date + timedelta(days=1)).strftime("%Y-%m-%d"), "total_supply_value": sum(t["supply_value"] for t in card_approval_details), "total_vat": sum(t["vat"] for t in card_approval_details), "total_amount": offline_card_revenue, "card_company": "혼합", "acquisition_number": f"ACQ-{current_date.strftime('%m%d')}-001"},
            "deposit_details": {"deposit_date": (current_date + timedelta(days=3)).strftime("%Y-%m-%d"), "deposit_amount": offline_card_revenue, "bank": merchant["deposit_bank"], "account_number": merchant["account_number"], "deposit_reference": f"DEP-{current_date.strftime('%m%d')}-001"}
        })
        
        # Cash receipts (offline only)
        cash_txn_count = random.randint(1, 3) if cash_revenue > 0 else 0
        cash_amounts = [random.randint(10000, 20000) for _ in range(cash_txn_count)]
        cash_total = sum(cash_amounts)
        if cash_total > cash_revenue:
            cash_amounts = cash_amounts[:1]  # Limit to 1 if exceeds
            cash_amounts[0] = cash_revenue
        cash_receipts = [{"amount": amt, "receipt_number": f"CR-{current_date.strftime('%y%m%d')}-{i+1:03d}", "issue_datetime": (current_date + timedelta(hours=11 + i)).strftime("%Y-%m-%d %H:%M:%S"), "customer_id": f"010-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}", "status": "issued"} for i, amt in enumerate(cash_amounts)]
        cash_receipt_data["daily_cash_receipt_data"].append({"date": current_date.strftime("%Y-%m-%d"), "cash_receipts": cash_receipts, "total_cash_amount": cash_revenue, "total_issued_amount": sum(t["amount"] for t in cash_receipts), "issued_count": len(cash_receipts), "non_issued_count": max(0, cash_txn_count - len(cash_receipts))})
        
        # Tax invoices (intermittent, B2B)
        if total_days >= 5 and random.random() < ratios["tax_invoice_issuance_rate"]:
            tax_amount = random.randint(30000, 50000)
            tax_invoices = [{"invoice_number": f"TI-{current_date.strftime('%y%m%d')}-001", "issue_datetime": (current_date + timedelta(hours=12)).strftime("%Y-%m-%d %H:%M:%S"), "supply_value": int(tax_amount / 1.1), "vat": tax_amount - int(tax_amount / 1.1), "total_amount": tax_amount, "payment_method": "card", "card_type": random.choice(card_types), "approval_number": f"TI-{chr(65+day)}{random.randint(1000000, 9999999)}", "buyer_name": "㈜중구테크", "buyer_biz_number": "123-45-67890", "buyer_address": "서울시 중구 세종대로 100", "status": "issued"}]
            tax_invoice_data["daily_tax_invoice_data"].append({"date": current_date.strftime("%Y-%m-%d"), "tax_invoices": tax_invoices, "total_issued_amount": tax_amount, "issued_count": 1})
        else:
            tax_invoice_data["daily_tax_invoice_data"].append({"date": current_date.strftime("%Y-%m-%d"), "tax_invoices": [], "total_issued_amount": 0, "issued_count": 0})
    
    # Save JSON files
    for data, filename in [(card_sales_data, "card_sales_data.json"), (baemin_data, "baemin.json"), (coupangeats_data, "coupangeats.json"), (yogiyo_data, "yogiyo.json"), (cash_receipt_data, "hometax_cash_receipt.json"), (tax_invoice_data, "hometax_tax_invoice.json")]:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    return {"status": "success", "files_generated": ["card_sales_data.json", "baemin.json", "coupangeats.json", "yogiyo.json", "hometax_cash_receipt.json", "hometax_tax_invoice.json"]}

# REST API endpoint
@app.route('/generate-data', methods=['POST'])
def generate_data_endpoint():
    try:
        data = request.get_json()
        business_number = data["business_number"]
        gen_duration = data["gen_duration"]
        weekday_avg_revenue = int(data["weekday_avg_revenue"])
        revenue_trend = data["revenue_trend"]
        
        result = generate_data(business_number, gen_duration, weekday_avg_revenue, revenue_trend)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3300)