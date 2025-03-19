import json
import os
import random
import datetime
from dateutil.relativedelta import relativedelta
import bcrypt
from pymongo import MongoClient

# 현재 디렉토리에서 smb_users.json 읽기
current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "smb_users.json")

with open(json_path, "r", encoding="utf-8") as f:
    users_data = json.load(f)  # 바로 배열로 읽음

# 랜덤 날짜 생성 함수 (오늘 이전 1개월 내)
def get_random_date_in_last_month():
    today = datetime.datetime(2025, 3, 15)
    one_month_ago = today - relativedelta(months=1)
    random_seconds = random.randint(0, int((today - one_month_ago).total_seconds()))
    random_date = one_month_ago + datetime.timedelta(seconds=random_seconds)
    return random_date.isoformat()

# 랜덤 전화번호 생성 함수
def get_random_phone():
    num1 = str(random.randint(1000, 9999))
    num2 = str(random.randint(1000, 9999))
    return f"010-{num1}-{num2}"

# 닉네임 생성 함수
def generate_nickname(username):
    random_num = random.randint(1000, 9999)
    return f"{username}{random_num}"

# MongoDB 형식으로 변환
def transform_users_to_mongo_format(users):
    transformed_users = []
    for user in users:  # users_data가 바로 배열이므로 직접 순회
        user_id = user.get("bid", user.get("id", "unknown"))
        password = user.get("bpassword", user.get("password", "unknown"))
        username = user.get("name", "unknown")
        hashed_password = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt(rounds=8)
        ).decode("utf-8")

        transformed_user = {
            "userId": user_id,
            "isSuperUser": False,
            "avatarUrl": f"/users/{user_id}.jpg",
            "username": username,
            "nickname": generate_nickname(username),
            "password": hashed_password,
            "lastAccess": get_random_date_in_last_month(),
            "englishName": user.get("en_name", ""),
            "phone": get_random_phone(),
            "email": f"{user_id}@example.com",
            "job": "자영업자",
            "company": user.get("merchant_name", "미등록 회사"),
            "workAddress": user.get("merchant_address", "미등록 주소"),
            "workPhone": (
                f"02-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
                if user.get("merchant_address")
                else "02-1234-5678"
            ),
            "mailReceiveAddress": "직장",
            "smb_sector": user.get("smb_sector", "미등록 업종"),
            "smb_sector_en": user.get("smb_sector_en", "미등록 업종"),
            "zone_nm": user.get("merchant_address", "지역 없음").split(" ")[1].strip(),
            "business_number": user.get("business_number", "미등록 사업자 번호"),
            "business_name": user.get("merchant_name", "미등록 회사"),
        }
        transformed_users.append(transformed_user)
    return transformed_users

# 변환 및 출력
transformed_users = transform_users_to_mongo_format(users_data)

# 콘솔에 출력
print(json.dumps(transformed_users, indent=2, ensure_ascii=False))

# MongoDB에 삽입
def insert_into_mongodb(transformed_users):
    try:
        client = MongoClient("mongodb://localhost:27017/")
        db = client["fidb"]
        collection = db["users"]

        # 기존 데이터 삭제 (선택 사항)
        collection.delete_many({})
        # 데이터 삽입
        result = collection.insert_many(transformed_users)
        print(f"Inserted {len(result.inserted_ids)} users into MongoDB")
    except Exception as e:
        print(f"Error inserting into MongoDB: {e}")
    finally:
        client.close()

# MongoDB에 삽입 실행
insert_into_mongodb(transformed_users)