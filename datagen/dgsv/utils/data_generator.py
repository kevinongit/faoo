import random
from datetime import datetime, timedelta
import numpy as np

# 상수 정의
CARD_TYPES = ["신한카드", "삼성카드", "현대카드", "롯데카드"]
CARD_FEE_RATE = 0.02  # 카드사 수수료 2%
DELIVERY_FEE_RATE = 0.10  # 배달 앱 수수료 10%

class DataGenerator:
    def __init__(self, sector_ratios, users):
        self.sector_ratios = sector_ratios
        self.users = users

    def generate_transaction_time(self, base_date, hour_range=(11, 20)):
        peak_hours = [11, 12, 13, 17, 18, 19, 20]
        regular_hours = [h for h in range(hour_range[0], hour_range[1] + 1) if h not in peak_hours]
        hour = random.choices(peak_hours + regular_hours,
                            weights=[0.15]*len(peak_hours) + [0.05]*len(regular_hours), k=1)[0]
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        return base_date.replace(hour=hour, minute=minute, second=second)

    def generate_variable_amount(self, base_amount, min_factor=0.7, max_factor=1.3):
        return int(base_amount * random.uniform(min_factor, max_factor))

    def parse_duration(self, duration_str):
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

    def parse_trend(self, trend_str):
        parts = trend_str.split('_')
        trend_type = '_'.join(parts[:-1])
        percentage = float(parts[-1]) / 100
        return trend_type, percentage

    def get_trend_factor(self, day, total_days, trend_type, percentage):
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

    def generate_sales_data(self, user, duration_days, weekday_avg_revenue, trend_type, percentage, is_compare=False):
        today = datetime.now() - timedelta(days=1)
        start_date = today - timedelta(days=duration_days - 1)
        sector = next(s for s in self.sector_ratios if s["smb_sector"] == user["smb_sector"])

        total_weekday_avg = weekday_avg_revenue / sector["card_ratio"]
        weekend_boost = random.uniform(1.1, 1.3)
        data = {"card_sales": [], "baemin": [], "coupangeats": [], "yogiyo": [], "cash_receipts": [], "tax_invoices": []}

        daily_noise = np.random.normal(1, 0.1, duration_days)

        for day in range(duration_days):
            current_date = start_date + timedelta(days=day)
            is_weekend = current_date.weekday() >= 5
            base_sales = total_weekday_avg * (weekend_boost if is_weekend else 1)
            trend_factor = self.get_trend_factor(day, duration_days - 1, trend_type, percentage)
            noise_factor = max(0.8, min(1.2, daily_noise[day]))
            daily_total_sales = int(base_sales * trend_factor * noise_factor)

            offline_sales = int(daily_total_sales * sector["offline_ratio"])
            online_sales = daily_total_sales - offline_sales
            offline_card_sales = int(offline_sales * sector["card_ratio"])
            cash_sales = offline_sales - offline_card_sales
            delivery_sales = int(online_sales * sector["delivery_platform_ratio"])
            per_platform_sales = delivery_sales // 3

            # 카드 거래 생성
            card_txn_count = random.randint(5, 15)
            card_total = offline_card_sales + online_sales
            card_txns = []
            card_weights = [0.35, 0.30, 0.20, 0.15]
            
            for _ in range(card_txn_count):
                amount = self.generate_variable_amount(card_total // card_txn_count, 0.5, 1.5)
                is_offline = random.random() < sector["offline_ratio"]
                approval_time = self.generate_transaction_time(current_date)
                fee = int(amount * CARD_FEE_RATE)
                card_txns.append({
                    "transaction_type": "offline" if is_offline else "online",
                    "supply_value": int(amount / 1.1),
                    "vat": amount - int(amount / 1.1),
                    "total_amount": amount,
                    "fee": fee,
                    "net_amount": amount - fee,
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
                    "total_fee": sum(t["fee"] for t in card_txns),
                    "net_amount": sum(t["net_amount"] for t in card_txns),
                    "card_company": "혼합",
                    "acquisition_number": f"ACQ-{current_date.strftime('%m%d')}-001"
                }
            }

            if not is_compare:
                tempObj["deposit_details"] = {
                    "deposit_date": (current_date + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "deposit_amount": sum(t["net_amount"] for t in card_txns),
                    "fee": sum(t["fee"] for t in card_txns),
                    "bank": user["deposit_bank"],
                    "account_number": user["account_number"],
                    "deposit_reference": f"DEP-{current_date.strftime('%m%d')}-001"
                }

            data["card_sales"].append(tempObj)

            # 배달 플랫폼 데이터 생성
            for platform, due_days in [("baemin", 7), ("coupangeats", 3), ("yogiyo", 1)]:
                txns = []
                for _ in range(random.randint(2, 4)):
                    amount = self.generate_variable_amount(per_platform_sales // 3)
                    approval_time = self.generate_transaction_time(current_date, (12, 22))
                    fee = int(amount * DELIVERY_FEE_RATE)
                    txns.append({
                        "amount": amount,
                        "fee": fee,
                        "net_amount": amount - fee,
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
                    "total_fee": total_fee,
                    "settlement_amount": total_amount - total_fee,
                    "payment_status": "paid" if (today - current_date).days >= due_days else "pending",
                    "payment_due_date": (current_date + timedelta(days=due_days)).strftime("%Y-%m-%d"),
                    "settlement_reference": f"{platform[:2].upper()}-SET-{current_date.strftime('%m%d')}-001"
                })

            # 현금영수증 데이터 생성
            cash_txn_count = random.randint(0, 4) if cash_sales > 0 else 0
            cash_txns = []
            for _ in range(cash_txn_count):
                amount = self.generate_variable_amount(cash_sales // (cash_txn_count or 1))
                approval_time = self.generate_transaction_time(current_date)
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

            # 세금계산서 데이터 생성
            if duration_days >= 5 and random.random() < sector["tax_invoice_issuance_rate"]:
                amount = self.generate_variable_amount(50000, 0.8, 1.5)
                approval_time = self.generate_transaction_time(current_date)
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

        # 최상위 merchant_info 생성
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