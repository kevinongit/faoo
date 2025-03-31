# 사업자 정보 생성
# db : chart_data
# collection : business_data
# 항목 예시
#   "business_number": "1111100076",
#   "kind_cd": "0006",
#   "kind_nm": "커피전문점",
#   "where_cd": "0006",
#   "where_nm": "광진구"
from itertools import cycle
from pymongo import MongoClient

# 사업자 번호 리스트
business_numbers = [{"name": f"사업장{i:04d}", "number": f"100101{i:04d}"} for i in range(1, 1001)]

# 업종코드 리스트
def generate_business_kind():
    kinds_cd = [f"00{i:02d}" for i in range(1, 11)]
    kinds_nm = ["커피전문점","편의점","한식","일식","양식"]
    kinds = []
    for kind_cd, kind_nm in zip(kinds_cd, cycle(kinds_nm)):
        kinds.append({
            "kind_cd": kind_cd,
            "kind_nm": kind_nm
        })

    return kinds

# 행정구역 리스트
def generate_business_where():
    wheres_cd = [f"00{i:02d}" for i in range(1, 11)]
    wheres_nm = ["강남구","용산구","영등포구","중구","마포구","광진구","종로구","노원구","중랑구","동대문구"]
    wheres = []
    for where_cd, where_nm in zip(wheres_cd, wheres_nm):
        wheres.append({
            "where_cd": where_cd,
            "where_nm": where_nm
        })

    return wheres

# 사업자 기본정보 구조 생성
def generate_business_info():
    kind_list = generate_business_kind()
    where_list = generate_business_where()

    business_list = []
    for business_info, kind_info, where_info in zip(business_numbers, cycle(kind_list), cycle(where_list)):
        business_list.append({
            "business_number": business_info["number"],
            "business_nm": business_info["name"],
            "kind_cd": kind_info["kind_cd"],
            "kind_nm": kind_info["kind_nm"],
            "where_cd": where_info["where_cd"],
            "where_nm": where_info["where_nm"]
        })

    return business_list

# 데이터 삽입
def insert_mock_data():
    # MongoDB 연결
    client = MongoClient('mongodb://localhost:27017/')
    db = client['chart_data']

    db.business_info.insert_many(generate_business_info())

insert_mock_data()