from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import bcrypt


# MongoDB 연결
client = MongoClient('mongodb://localhost:27017/')
db = client['fidb']
users_collection = db['users']

# 사용자 데이터
korean_generals = [
    ("이순신", "Yi Sun-shin", "Admiral Yi"),
    ("김유신", "Kim Yu-shin", "General Kim"),
    ("강감찬", "Gang Gam-chan", "Mighty Gang"),
    ("을지문덕", "Eulji Mundeok", "Strategist Eulji"),
    ("최영", "Choe Yeong", "Warrior Choe"),
    ("서희", "Seo Hui", "Diplomat Seo"),
    ("윤관", "Yun Gwan", "Commander Yun"),
    ("이성계", "Yi Seong-gye", "Founder Yi"),
    ("권율", "Gwon Yul", "Patriot Gwon"),
    ("신립", "Sin Rip", "Loyal Sin")
]

superheroes = [
    ("슈퍼맨", "Clark Kent", "Man of Steel"),
    ("배트맨", "Bruce Wayne", "Dark Knight"),
    ("원더우먼", "Diana Prince", "Amazon Princess"),
    ("스파이더맨", "Peter Parker", "Web-Slinger"),
    ("아이언맨", "Tony Stark", "Genius Billionaire"),
    ("헐크", "Bruce Banner", "Green Giant"),
    ("토르", "Thor Odinson", "God of Thunder"),
    ("블랙 위도우", "Natasha Romanoff", "Red Spy"),
    ("캡틴 아메리카", "Steve Rogers", "First Avenger"),
    ("닥터 스트레인지", "Stephen Strange", "Sorcerer Supreme")
]

got_characters = [
    ("존 스노우", "Jon Snow", "King in the North"),
    ("대너리스 타르가르옌", "Daenerys Targaryen", "Mother of Dragons"),
    ("티리온 라니스터", "Tyrion Lannister", "The Imp"),
    ("아리아 스타크", "Arya Stark", "No One"),
    ("산사 스타크", "Sansa Stark", "Lady of Winterfell"),
    ("서시 라니스터", "Cersei Lannister", "Lioness"),
    ("제이미 라니스터", "Jaime Lannister", "Kingslayer"),
    ("브란 스타크", "Bran Stark", "Three-Eyed Raven"),
    ("테온 그레이조이", "Theon Greyjoy", "Reek"),
    ("샘웰 탈리", "Samwell Tarly", "Maester Sam")
]

def generate_random_last_access():
    today = datetime.now()
    three_months_ago = today - timedelta(days=90)
    random_date = three_months_ago + timedelta(days=random.randint(0, 90))
    return random_date.strftime("%Y년 %m월 %d일 %H:%M")

def generate_random_address(character_type):
    address_pools = {
        "korean_general": [
            "서울특별시 종로구 세종대로 1",
            "경기도 수원시 팔달구 정조로 123",
            "충청남도 아산시 온천대로 456",
            "전라남도 여수시 이순신광장로 789",
            "경상남도 통영시 충렬로 101"
        ],
        "superhero": [
            "뉴욕시 맨해튼 5번가 123",
            "고담시 웨인타워 456",
            "메트로폴리스 데일리플래닛 789",
            "아스가르드 오딘궁전 101",
            "쿤룬 산맥 드래곤로드 202"
        ],
        "got_character": [
            "윈터펠 성 북쪽 타워",
            "킹스랜딩 레드킵 1층",
            "캐슬블랙 나이트워치 본부",
            "하이가든 로즈가든 123",
            "드래곤스톤 드래곤마운트 456"
        ]
    }
    return random.choice(address_pools.get(character_type, ["알 수 없는 주소"]))

def generate_random_phone_number(nullable=True):
    if nullable and random.random() < 0.5:
        return None
    return f"010-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"

def assign_job_and_company(character_type):
    job_company_pools = {
        "korean_general": [
            ("군인", "대한민국 국방부"),
            ("전략가", "조선 전략 연구소"),
            ("역사학자", "한국 역사 연구원")
        ],
        "superhero": [
            ("기자", "데일리 플래닛"),
            ("CEO", "스타크 인더스트리"),
            ("과학자", "브루스 배너 연구소")
        ],
        "got_character": [
            ("왕", "아이언 스론"),
            ("기사", "나이트워치"),
            ("정치가", "킹스랜딩 의회")
        ]
    }
    return random.choice(job_company_pools.get(character_type, [("직업 없음", "회사 없음")]))

def assign_mail_receive_address():
    return random.choice(["집", "직장", None])


def generate_hashed_password(password):
    """
    텍스트 비밀번호를 입력받아 bcrypt.hash()를 사용하여 해시된 비밀번호를 생성합니다.

    Args:
        password (str): 해시할 평문 비밀번호

    Returns:
        str: bcrypt로 해시된 비밀번호
    """
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=8))
    return hashed_password.decode('utf-8')

def generate_unique_user_id(base_id):
    user_id = base_id[:8].lower()  # 최대 8자
    if len(user_id) < 5:
        user_id = user_id.ljust(5, 'x')  # 최소 5자
    
    original_id = user_id
    counter = 1
    while users_collection.find_one({"userId": user_id}):
        # 이미 존재하는 경우, 숫자를 추가하거나 증가
        user_id = original_id[:5] + str(counter).zfill(3)  # 숫자를 추가하고 3자리로 맞춤
        counter += 1
        if len(user_id) > 8:  # 8자를 초과하면
            # 랜덤한 문자열 생성
            user_id = ''.join(random.choices(string.ascii_lowercase, k=5)) + str(counter).zfill(3)
    
    return user_id

def generate_mock_users():
    users = []
    all_characters = korean_generals + superheroes + got_characters

    for username, englishName, nickname in all_characters:
        base_id = ''.join(e for e in englishName.split()[:2] if e.isalnum())
        userId = generate_unique_user_id(base_id)
        
        character_type = "korean_general" if username in [name for name, _, _ in korean_generals] else \
                         "superhero" if username in [name for name, _, _ in superheroes] else "got_character"
        
        job, company = assign_job_and_company(character_type)
        
        user = {
            "userId": userId,
            "isSuperUser": False,
            "avatarUrl": f"/users/{userId}.png",
            "username": username,
            "nickname": nickname,
            "password": generate_hashed_password(userId),
            "lastAccess": generate_random_last_access(),
            "englishName": englishName,
            "phone": generate_random_phone_number(False),
            "email": f"{userId}@example.com",
            "homeAddress": generate_random_address(character_type),
            "homePhone": generate_random_phone_number(),
            "job": job,
            "company": company,
            "workAddress": generate_random_address(character_type),
            "workPhone": generate_random_phone_number(),
            "mailReceiveAddress": assign_mail_receive_address()
        }
        users.append(user)
    return users

# 사용자 데이터 생성
mock_users = generate_mock_users()
result = users_collection.insert_many(mock_users)

print(f"{len(result.inserted_ids)} 명의 사용자가 성공적으로 추가되었습니다.")
