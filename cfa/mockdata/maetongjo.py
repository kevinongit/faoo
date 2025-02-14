from pymongo import MongoClient
import random
from datetime import datetime, timedelta

client = MongoClient('mongodb://localhost:27017/')
db = client['maetongjo']

merchant_collection = db['merchants']
approval_collection = db['approvals']
deposit_collection = db['deposits']
purchase_collection = db['purchases']


def generate_sample_data():
    current_date = datetime(2025, 2, 11)
    
    merchants = [
        {
            "merNo": f"M{str(i).zfill(4)}",
            "merNm": f"Merchant {i}",
            "bizNo": f"123-45-{str(i).zfill(5)}",
            "ceoNm": f"CEO {i}",
            "merTel": f"010-1234-{str(i).zfill(4)}",
            "merZip": f"{str(10000 + i)}",
            "merAdr": f"Address {i}",
            "merDtlAdr": f"Detail Address {i}",
            "merSts": "1",
            "merStsNm": "Active",
            "bizSec": "01",
            "bizSecNm": "General",
            "indCd": "5812",
            "indNm": "Restaurant"
        } for i in range(1, 21)
    ]

    approvals = [
        {
            "merNo": f"M{str(random.randint(1, 20)).zfill(4)}",
            "aprNo": f"A{str(i).zfill(4)}",
            "aprDt": (current_date - timedelta(days=random.randint(1, 30))).strftime("%Y%m%d"),
            "aprTm": f"{random.randint(0, 23):02d}{random.randint(0, 59):02d}{random.randint(0, 59):02d}",
            "cardNo": f"1234-56**-****-{str(i).zfill(4)}",
            "instMm": f"{random.randint(0, 12):02d}",
            "aprAmt": random.randint(1000, 100000),
            "vat": random.randint(100, 10000),
            "aprSts": "1",
            "aprStsNm": "Approved"
        } for i in range(1, 21)
    ]

    deposits = [
        {
            "merNo": f"M{str(random.randint(1, 20)).zfill(4)}",
            "depDt": (current_date - timedelta(days=random.randint(1, 30))).strftime("%Y%m%d"),
            "depAmt": random.randint(10000, 1000000),
            "depSts": "1",
            "depStsNm": "Deposited",
            "bankCd": f"{random.randint(1, 999):03d}",
            "bankNm": f"Bank {i}",
            "acctNo": f"123-45-{str(i).zfill(4)}"
        } for i in range(1, 21)
    ]

    purchases = [
        {
            "merNo": f"M{str(random.randint(1, 20)).zfill(4)}",
            "aprNo": f"A{str(random.randint(1, 20)).zfill(4)}",
            "aprDt": (current_date - timedelta(days=random.randint(1, 30))).strftime("%Y%m%d"),
            "cardNo": f"1234-56**-****-{str(i).zfill(4)}",
            "instMm": f"{random.randint(0, 12):02d}",
            "buyAmt": random.randint(1000, 100000),
            "vat": random.randint(100, 10000),
            "buySts": "1",
            "buyStsNm": "Purchased",
            "buyDt": (current_date - timedelta(days=random.randint(0, 7))).strftime("%Y%m%d")
        } for i in range(1, 21)
    ]

    return merchants, approvals, deposits, purchases

merchants, approvals, deposits, purchases = generate_sample_data()

merchant_collection.insert_many(merchants)
approval_collection.insert_many(approvals)
deposit_collection.insert_many(deposits)
purchase_collection.insert_many(purchases)

print("각 컬렉션에 20개의 레코드가 삽입되었습니다.")
