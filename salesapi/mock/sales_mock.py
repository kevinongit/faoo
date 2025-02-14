import random
import datetime
import json
from dateutil.relativedelta import relativedelta
from pymongo import MongoClient

# 사업자 번호 리스트
business_numbers = [f"111110000{i}" for i in range(1, 6)]

# 유틸리티 함수
def random_date(start, end):
    return start + datetime.timedelta(days=random.randint(0, (end - start).days))

def random_business_number():
    return random.choice(business_numbers)

# 홈택스 데이터 생성 함수
def generate_sales_invoices(count=50):
    invoices = []
    for _ in range(count):
        invoices.append({
            "business_number": random_business_number(),
            "issue_date": random_date(datetime.date(2023, 1, 1), datetime.date(2023, 12, 31)).isoformat(),
            "supply_value": random.randint(100000, 1000000),
            "tax_amount": random.randint(10000, 100000),
            "total_amount": random.randint(110000, 1100000),
            "item_name": f"Item {random.randint(1, 100)}",
            "specification": f"Spec {random.randint(1, 10)}",
            "quantity": random.randint(1, 100),
            "unit_price": random.randint(1000, 10000),
            "supplier_business_number": random_business_number(),
            "supplier_name": f"Supplier {random.randint(1, 10)}",
            "receiver_business_number": random_business_number(),
            "receiver_name": f"Receiver {random.randint(1, 10)}"
        })
    return invoices

def generate_vat_reports():
    reports = []
    for business_number in business_numbers:
        for year in range(2021, 2024):
            for half in ['1H', '2H']:
                reports.append({
                    "business_number": business_number,
                    "tax_period": f"{year}-{half}",
                    "report_date": random_date(datetime.date(year, 1, 1), datetime.date(year, 12, 31)).isoformat(),
                    "report_type": random.choice(["Regular", "Amended"]),
                    "tax_base": random.randint(1000000, 10000000),
                    "sales_tax": random.randint(100000, 1000000),
                    "purchase_tax": random.randint(50000, 500000),
                    "payment_tax": random.randint(50000, 500000),
                    "report_status": random.choice(["Submitted", "Pending"])
                })
    return reports

def generate_vat_data(count=50):
    data = []
    for _ in range(count):
        data.append({
            "business_number": random_business_number(),
            "transaction_partner": f"Partner {random.randint(1, 20)}",
            "partner_business_number": random_business_number(),
            "supply_value": random.randint(100000, 1000000),
            "tax_amount": random.randint(10000, 100000),
            "transaction_type": random.choice(["Sales", "Purchase"]),
            "invoice_type": random.choice(["Regular", "Amended"]),
            "issue_date": random_date(datetime.date(2023, 1, 1), datetime.date(2023, 12, 31)).isoformat(),
            "report_status": random.choice(["Reported", "Unreported"])
        })
    return data

def generate_vat_summary():
    summaries = []
    for business_number in business_numbers:
        summaries.append({
            "business_number": business_number,
            "transaction_type": random.choice(["Sales", "Purchase"]),
            "business_count": random.randint(1, 20),
            "regular_taxable_supply": random.randint(1000000, 10000000),
            "regular_taxable_tax": random.randint(100000, 1000000),
            "tax_exempt_supply": random.randint(50000, 500000),
            "total_amount": random.randint(1100000, 11000000),
            "invoice_amount": random.randint(100000, 1000000),
            "credit_card_amount": random.randint(50000, 500000),
            "cash_receipt_amount": random.randint(50000, 500000),
            "others": random.randint(10000, 100000)
        })
    return summaries

# 쿠팡이츠 데이터 생성 함수
def generate_coupangeats_seller_info():
    return [{
        "business_number": bn,
        "seller_id": f"CE{bn[-4:]}",
        "store_name": f"Store {random.randint(1, 100)}",
        "representative_name": f"Rep {random.randint(1, 50)}",
        "business_type": random.choice(["Restaurant", "Cafe", "Bakery"]),
        "business_category": random.choice(["Korean", "Japanese", "Chinese", "Western"]),
        "store_address": f"Address {random.randint(1, 1000)}",
        "contact": f"010-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        "contract_start_date": random_date(datetime.date(2020, 1, 1), datetime.date(2023, 12, 31)).isoformat(),
        "account_status": random.choice(["Active", "Suspended", "Terminated"])
    } for bn in business_numbers]

def generate_coupangeats_vat_reports():
    reports = []
    end_date = datetime.date.today()
    start_date = end_date - relativedelta(years=3)
    current_date = start_date
    while current_date <= end_date:
        for bn in business_numbers:
            reports.append({
                "business_number": bn,
                "report_month": current_date.strftime("%Y-%m"),
                "total_sales": random.randint(1000000, 10000000),
                "taxable_sales": random.randint(900000, 9000000),
                "tax_exempt_sales": random.randint(100000, 1000000),
                "vat_amount": random.randint(90000, 900000),
                "order_count": random.randint(100, 1000),
                "cancel_return_count": random.randint(5, 50),
                "commission": random.randint(50000, 500000),
                "settlement_amount": random.randint(850000, 8500000)
            })
        current_date += relativedelta(months=1)
    return reports

# 네이버 데이터 생성 함수
def generate_naver_seller_info():
    return [{
        "business_number": bn,
        "seller_id": f"NS{bn[-4:]}",
        "store_name": f"Naver Store {random.randint(1, 100)}",
        "representative_name": f"Rep {random.randint(1, 50)}",
        "business_type": random.choice(["Retail", "Wholesale", "Manufacturing"]),
        "business_category": random.choice(["Fashion", "Electronics", "Home Goods", "Beauty"]),
        "store_address": f"Address {random.randint(1, 1000)}",
        "customer_service_contact": f"02-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        "account_creation_date": random_date(datetime.date(2020, 1, 1), datetime.date(2023, 12, 31)).isoformat(),
        "account_status": random.choice(["Active", "Suspended", "Terminated"])
    } for bn in business_numbers]

def generate_naver_vat_reports():
    reports = []
    end_date = datetime.date.today()
    start_date = end_date - relativedelta(years=3)
    current_date = start_date
    while current_date <= end_date:
        for bn in business_numbers:
            reports.append({
                "business_number": bn,
                "report_month": current_date.strftime("%Y-%m"),
                "total_sales": random.randint(5000000, 50000000),
                "taxable_sales": random.randint(4500000, 45000000),
                "tax_exempt_sales": random.randint(500000, 5000000),
                "vat_amount": random.randint(450000, 4500000),
                "order_count": random.randint(500, 5000),
                "cancel_return_count": random.randint(25, 250),
                "commission": random.randint(250000, 2500000),
                "settlement_amount": random.randint(4250000, 42500000)
            })
        current_date += relativedelta(months=1)
    return reports

# 제로페이 데이터 생성 함수
def generate_zeropay_merchant_info():
    return [{
        "business_number": bn,
        "merchant_id": f"ZP{bn[-4:]}",
        "merchant_name": f"ZeroPay Merchant {random.randint(1, 100)}",
        "representative_name": f"Rep {random.randint(1, 50)}",
        "business_type": random.choice(["Retail", "Restaurant", "Service"]),
        "business_category": random.choice(["Small Business", "Franchise", "Individual"]),
        "store_address": f"Address {random.randint(1, 1000)}",
        "contact": f"010-{random.randint(1000,9999)}-{random.randint(1000,9999)}",
        "join_date": random_date(datetime.date(2020, 1, 1), datetime.date(2023, 12, 31)).isoformat(),
        "account_status": random.choice(["Active", "Suspended", "Terminated"])
    } for bn in business_numbers]

def generate_zeropay_payment_history(count=100):
    history = []
    for _ in range(count):
        payment_date = random_date(datetime.date(2023, 1, 1), datetime.date(2023, 12, 31))
        payment_amount = random.randint(1000, 100000)
        history.append({
            "business_number": random_business_number(),
            "transaction_id": f"TR{random.randint(10000, 99999)}",
            "payment_date": payment_date.isoformat(),
            "payment_amount": payment_amount,
            "discount_amount": random.randint(0, int(payment_amount * 0.1)),
            "actual_payment_amount": payment_amount,
            "payment_method": random.choice(["Bank Transfer", "Credit Card", "ZeroPay Points"]),
            "customer_info": f"Customer {random.randint(1, 1000)}",
            "product_name": f"Product {random.randint(1, 100)}",
            "transaction_status": random.choice(["Completed", "Pending", "Cancelled"])
        })
    return history

def generate_zeropay_deposit_schedule(count=50):
    schedule = []
    for _ in range(count):
        deposit_date = random_date(datetime.date(2023, 1, 1), datetime.date(2024, 12, 31))
        deposit_amount = random.randint(10000, 1000000)
        fee = int(deposit_amount * 0.03)
        schedule.append({
            "business_number": random_business_number(),
            "scheduled_deposit_date": deposit_date.isoformat(),
            "scheduled_deposit_amount": deposit_amount,
            "transaction_count": random.randint(1, 100),
            "settlement_period": f"{(deposit_date - datetime.timedelta(days=7)).isoformat()} ~ {deposit_date.isoformat()}",
            "fee": fee,
            "actual_deposit_amount": deposit_amount - fee,
            "deposit_account_info": f"Bank {random.randint(1, 10)} Account {random.randint(100000, 999999)}",
            "settlement_status": random.choice(["Scheduled", "Completed", "Delayed"])
        })
    return schedule

# 전체 데이터 생성
mock_data = {
    "hometax": {
        "sales_invoices": generate_sales_invoices(),
        "vat_reports": generate_vat_reports(),
        "vat_data": generate_vat_data(),
        "vat_summaries": generate_vat_summary()
    },
    "coupangeats": {
        "seller_info": generate_coupangeats_seller_info(),
        "vat_reports": generate_coupangeats_vat_reports()
    },
    "naver": {
        "seller_info": generate_naver_seller_info(),
        "vat_reports": generate_naver_vat_reports()
    },
    "zeropay": {
        "merchant_info": generate_zeropay_merchant_info(),
        "payment_history": generate_zeropay_payment_history(),
        "deposit_schedule": generate_zeropay_deposit_schedule()
    }
}

# JSON 형식으로 출력
# print(json.dumps(mock_data, indent=2))

# MongoDB 연결
client = MongoClient('mongodb://localhost:27017/')
db = client['business_data']

# 데이터 삽입
def insert_mock_data():
    # 홈택스 데이터 삽입
    db.hometax_sales_invoices.insert_many(mock_data['hometax']['sales_invoices'])
    db.hometax_vat_reports.insert_many(mock_data['hometax']['vat_reports'])
    db.hometax_vat_data.insert_many(mock_data['hometax']['vat_data'])
    db.hometax_vat_summaries.insert_many(mock_data['hometax']['vat_summaries'])

    # 쿠팡이츠 데이터 삽입
    db.coupangeats_seller_info.insert_many(mock_data['coupangeats']['seller_info'])
    db.coupangeats_vat_reports.insert_many(mock_data['coupangeats']['vat_reports'])

    # 네이버 데이터 삽입
    db.naver_seller_info.insert_many(mock_data['naver']['seller_info'])
    db.naver_vat_reports.insert_many(mock_data['naver']['vat_reports'])

    # 제로페이 데이터 삽입
    db.zeropay_merchant_info.insert_many(mock_data['zeropay']['merchant_info'])
    db.zeropay_payment_history.insert_many(mock_data['zeropay']['payment_history'])
    db.zeropay_deposit_schedule.insert_many(mock_data['zeropay']['deposit_schedule'])

    print("Mock data inserted into MongoDB successfully!")

# 데이터 삽입 실행
insert_mock_data()
