# 온라인 매출 정보 생성
# db : chart_data
# collection : sales_online_info
# 항목 예시
#   "sale_date": "20240101",
#   "business_number": "1111100056",
#   "kind_cd": "0006",
#   "kind_nm": "커피전문점",
#   "where_cd": "0006",
#   "where_nm": "광진구",
#   "platform": "배달의민족",
#   "sale_time": "01", // 01시대
#   "sale_amt": "13200",
#   "gender": 1, // 1: 남성, 2: 여성
#   "age": "00" // 00: 10대미만, 10: 20대 미만 ... 70: 80대 미만
import random
from datetime import datetime, timedelta
from pymongo import MongoClient

# MongoDB 연결
client = MongoClient('mongodb://localhost:27017/')
db = client['chart_data']

# 사업자 정보 collection
collection = db["business_info"]

# 사업자 정보 리스트
business_numbers = []
business_list = collection.find()
for business_info in business_list:
    business_numbers.append(business_info)

# 두 날짜 간의 차이(일)를 계산
def days_between_dates(date1, date2):
    return abs((date2 - date1).days)

# 매출일자 지정
def sale_date():
    date_list = []
    basedate = datetime(2024, 1, 1)
    nowdate = datetime.now()
    days = days_between_dates(basedate, nowdate)
    for i in range(0, days):
        date_list.append((basedate + timedelta(i)).strftime("%Y%m%d"))

    return date_list

# 사업장별 매출금액 random
def sale_amt(datestr):
    sale_list = []
    platform_list = ["배달의민족", "쿠팡이츠", "요기요"]
    """ 일일 매출건수 300건씩 랜덤 사업장, 플랫폼, 시간, 성별, 금액, 연령대를 구성"""
    for i in range(1, 301):
        nn = f"1111100{random.randint(1, 100):03d}"
        business_info = next((item for item in business_numbers if item["business_number"] == nn), None)
        sale_list.append({
            "sale_date": datestr,
            "business_number": business_info["business_number"],
            "kind_cd": business_info["kind_cd"],
            "kind_nm": business_info["kind_nm"],
            "where_cd": business_info["where_cd"],
            "where_nm": business_info["where_nm"],
            "platform": random.choice(platform_list),
            "sale_time": f"{random.randint(1, 23):02d}",
            "sale_amt": f"{random.randint(50, 1000)}00",
            "gender": random.randint(1, 2),
            "age": f"{random.randint(0, 7)}0"
        })

    return sale_list

def generate_offsales():
    date_list = sale_date()
    sale_total = []
    for date in date_list:
        sale_list = sale_amt(date)
        sale_total.extend(sale_list)

    return sale_total

# 데이터 삽입
def insert_mock_data():
    db.sales_online_info.insert_many(generate_offsales())

insert_mock_data()