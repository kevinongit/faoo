import json
import sys
from pymongo import MongoClient, UpdateOne
import os
import random
from tqdm import tqdm
platform_list = [{"cd":"01", "nm":"배달의민족"}, {"cd":"02", "nm":"쿠팡이츠"}, {"cd":"03", "nm":"요기요"}, {"cd":"04", "nm":"스마트스토어"}, {"cd":"05", "nm":"11번가"}, {"cd":"06", "nm":"쿠팡"}]

# 몽고DB 연결
def connect_to_mongo():
    try:
        client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'))
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)

# 몽고DB 데이터 조회
def get_target_data(db):
    try:
        target_data = db["sales_data"]
        target_list = list(target_data.find(
            {
                "$or": [
                    {"gen_apply_yn": {"$exists": False}},  # 필드가 없는 경우
                    {"gen_apply_yn": "N"}  # 값이 "N"인 경우
                ]
            }
        ))
        return target_list
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

# 배달의민족 데이터 조회
def get_baemin_data(baemin):
    try:
        transformed_data = []
        biz_number = baemin["merchant_info"]["business_number"]
        smb_sector = baemin["merchant_info"]["smb_sector"]
        zone_nm = baemin["merchant_info"]["zone_nm"]

        for daily_data in baemin["daily_sales_data"]:
            date = daily_data["date"]
            for daily_sales in daily_data["daily_sales"]:
                transformed_data.append({
                    "sale_date": date.replace("-", ""),
                    "business_number": biz_number,
                    "sale_time": daily_sales["approval_datetime"].split(" ")[1][:2],
                    "sale_amt": daily_sales["amount"],
                    "transaction_type": "online",
                    "smb_sector": smb_sector,
                    "zone_nm": zone_nm,
                    "platform_cd": "01",
                    "platform_nm": "배달의민족",
                    "gender": random.randint(1, 2),
                    "age": f"{random.randint(0, 7)}0"
                })

        return transformed_data
    except Exception as e:
        print(f"Error get_baemin_data data: {e}")
        return []

# 카드 판매 데이터 조회
def get_card_sales_data(card):
    try:
        transformed_data = []
        biz_number = card["merchant_info"]["business_number"]
        smb_sector = card["merchant_info"]["smb_sector"]
        zone_nm = card["merchant_info"]["zone_nm"]

        for detail in card["daily_sales_data"]:
            date = detail["date"]
            for daily_sales in detail["approval_details"]:
                transformed_data.append({
                    "sale_date": date.replace("-", ""),
                    "business_number": biz_number,
                    "sale_time": daily_sales["approval_datetime"].split(" ")[1][:2],
                    "sale_amt": daily_sales["total_amount"],
                    "transaction_type": daily_sales["transaction_type"],
                    "smb_sector": smb_sector,
                    "zone_nm": zone_nm,
                    "platform_cd": "99",
                    "platform_nm": "기타",
                    "gender": random.randint(1, 2),
                    "age": f"{random.randint(0, 7)}0"
                })

        return transformed_data
    except Exception as e:
        print(f"Error get_card_sales_data data: {e}")
        return []

# 쿠팡이츠 데이터 조회
def get_coupangeats_data(coupangeats):
    try:
        transformed_data = []
        biz_number = coupangeats["merchant_info"]["business_number"]
        smb_sector = coupangeats["merchant_info"]["smb_sector"]
        zone_nm = coupangeats["merchant_info"]["zone_nm"]

        for daily_data in coupangeats["daily_sales_data"]:
            date = daily_data["date"]
            for daily_sales in daily_data["daily_sales"]:
                transformed_data.append({
                    "sale_date": date.replace("-", ""),
                    "business_number": biz_number,
                    "sale_time": daily_sales["approval_datetime"].split(" ")[1][:2],
                    "sale_amt": daily_sales["amount"],
                    "transaction_type": "online",
                    "smb_sector": smb_sector,
                    "zone_nm": zone_nm,
                    "platform_cd": "02",
                    "platform_nm": "쿠팡이츠",
                    "gender": random.randint(1, 2),
                    "age": f"{random.randint(0, 7)}0"
                })

        return transformed_data
    except Exception as e:
        print(f"Error get_coupangeats_data data: {e}")
        return []


# 현금영수증 데이터 조회
def get_hometax_cash_data(hometax):
    try:
        transformed_data = []
        biz_number = hometax["merchant_info"]["business_number"]
        smb_sector = hometax["merchant_info"]["smb_sector"]
        zone_nm = hometax["merchant_info"]["zone_nm"]

        for daily_data in hometax["daily_cash_receipts_data"]:
            date = daily_data["date"]
            for daily_sales in daily_data["cash_receipts"]:
                transformed_data.append({
                    "sale_date": date.replace("-", ""),
                    "business_number": biz_number,
                    "sale_time": daily_sales["issue_datetime"].split(" ")[1][:2],
                    "sale_amt": daily_sales["amount"],
                    "transaction_type": "offline",
                    "smb_sector": smb_sector,
                    "zone_nm": zone_nm,
                    "platform_cd": "99",
                    "platform_nm": "기타",
                    "gender": random.randint(1, 2),
                    "age": f"{random.randint(0, 7)}0"
                })

        return transformed_data
    except Exception as e:
        print(f"Error get_hometax_cash_data data: {e}")
        return []

# 요기요 데이터 조회
def get_yogiyo_data(yogiyo):
    try:
        transformed_data = []
        biz_number = yogiyo["merchant_info"]["business_number"]
        smb_sector = yogiyo["merchant_info"]["smb_sector"]
        zone_nm = yogiyo["merchant_info"]["zone_nm"]

        for daily_data in yogiyo["daily_sales_data"]:
            date = daily_data["date"]
            for daily_sales in daily_data["daily_sales"]:
                transformed_data.append({
                    "sale_date": date.replace("-", ""),
                    "business_number": biz_number,
                    "sale_time": daily_sales["approval_datetime"].split(" ")[1][:2],
                    "sale_amt": daily_sales["amount"],
                    "transaction_type": "online",
                    "smb_sector": smb_sector,
                    "zone_nm": zone_nm,
                    "platform_cd": "03",
                    "platform_nm": "요기요",
                    "gender": random.randint(1, 2),
                    "age": f"{random.randint(0, 7)}0"
                })

        return transformed_data
    except Exception as e:
        print(f"Error get_yogiyo_data data: {e}")
        return []

if __name__ == "__main__":
    client = connect_to_mongo()
    result = []
    list_data = get_target_data(client['originalData'])

    print(f"총 {len(list_data)}개의 데이터를 분석 중...")
    for list_dt in tqdm(list_data):
        result.extend(get_baemin_data(list_dt["baemin"]))
        result.extend(get_card_sales_data(list_dt["card_sales_data"]))
        result.extend(get_coupangeats_data(list_dt["coupangeats"]))
        result.extend(get_hometax_cash_data(list_dt["hometax_cash_receipts"]))
        result.extend(get_yogiyo_data(list_dt["yogiyo"]))

    offline_data = list(filter(lambda x: x["transaction_type"] == "offline", result))
    online_data = list(filter(lambda x: x["transaction_type"] == "online", result))

    if offline_data:
        print(f"offlin 총 {len(offline_data)}개의 데이터를 삽입 중...")
        for idx in tqdm(range(0, len(offline_data), 10000), file=sys.stdout):
            batch = offline_data[idx:idx+10000]
            client["chart_data"]["sales_offline_info"].insert_many(batch)

    if online_data:
        print(f"online 총 {len(online_data)}개의 데이터를 삽입 중...")
        for idx in tqdm(range(0, len(online_data), 10000), file=sys.stdout):
            batch = online_data[idx:idx+10000]
            client["chart_data"]["sales_online_info"].insert_many(batch)

    # 한번에 업데이트 처리
    update_operations = []
    for item in list_data:
        update_operations.append(
            UpdateOne(
                {"_id": item["_id"]},
                {"$set": {"gen_apply_yn": "Y"}}
            )
        )

    if update_operations:
        client['originalData']['sales_data'].bulk_write(update_operations)