from flask import Blueprint, request, jsonify
import json
import secrets
import random
from datetime import datetime
from tqdm import tqdm
from pymongo import MongoClient
from utils.data_generator import DataGenerator

data_bp = Blueprint('data', __name__)

# Load sector-specific ratios
with open('smb_sector.json', 'r', encoding='utf-8') as f:
    SECTOR_RATIOS = json.load(f)

# Load user data
with open('smb_users.json', 'r', encoding='utf-8') as f:
    SMB_USERS = json.load(f)

data_generator = DataGenerator(SECTOR_RATIOS, SMB_USERS)

@data_bp.route('/gen-data', methods=['POST'])
def generate_data():
    data = request.json
    business_number = data.get("business_number")
    gen_duration = data.get("gen_duration")
    weekday_avg_revenue = data.get("weekday_avg_revenue")
    revenue_trend = data.get("revenue_trend")

    if not all([business_number, gen_duration, weekday_avg_revenue, revenue_trend]):
        return jsonify({"error": "Missing required fields"}), 400

    user = next((u for u in SMB_USERS if u["business_number"] == business_number), None)
    if not user:
        return jsonify({"error": "Business number not found"}), 404

    try:
        duration_days = data_generator.parse_duration(gen_duration)
        trend_type, percentage = data_generator.parse_trend(revenue_trend)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    result = data_generator.generate_sales_data(user, duration_days, weekday_avg_revenue, trend_type, percentage)
    return jsonify(result)

@data_bp.route('/gen-data-temporary', methods=['POST', 'OPTIONS'])
def generate_compare_data():
    data = request.json
    business_number = data.get("business_number")
    gen_duration = data.get("gen_duration")
    weekday_avg_revenue = data.get("weekday_avg_revenue")

    user = next((u for u in SMB_USERS if u["business_number"] == business_number), None)

    result_list = []
    print(f"총 100 개의 데이터를 생성 중...")
    for idx in tqdm(range(0, 100, 1)):
        random_number = f"10010{secrets.randbelow(100000):05}"

        user_copy = {}
        user_copy["business_number"] = random_number
        user_copy["merchant_name"] = f"가맹점{random_number}"
        user_copy["merchant_address"] = user["merchant_address"]
        user_copy["smb_sector"] = user["smb_sector"]
        user_copy["smb_sector_en"] = user["smb_sector_en"]

        trend_list = ["slow_increase", "slow_decrease", "increase_up_down_up", "descrease_down_up_down"]
        revenue_trend = random.choice(trend_list) + "_" + str(random.randint(1, 100))

        randomized_revenue = weekday_avg_revenue + random.randint(
            -int(weekday_avg_revenue * 0.2),  # -20%
            int(weekday_avg_revenue * 0.2)   # +20%
        )

        try:
            duration_days = data_generator.parse_duration(gen_duration)
            trend_type, percentage = data_generator.parse_trend(revenue_trend)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        result = data_generator.generate_sales_data(user_copy, duration_days, randomized_revenue, trend_type, percentage, True)
        result_list.append(result)

    # MongoDB 연결
    client = MongoClient('mongodb://localhost:27017/')
    db = client['originalData']
    collection = db['sales_data']

    print(f"총 {len(result_list)}개의 데이터를 삽입 중...")
    for idx in tqdm(range(0, len(result_list), 5)):
        batch = result_list[idx:idx+5]
        collection.insert_many(batch)
    client.close()

    return jsonify({"message": "정상 처리되었습니다."})

@data_bp.route('/users', methods=['GET'])
def get_users():
    print(SMB_USERS)
    try:
        return jsonify(SMB_USERS)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@data_bp.route('/rtrend', methods=['GET'])
def get_revenue_trends():
    possible_trends = [
        "slow_increase_10",
        "slow_decrease_15",
        "increase_up_down_up_10",
        "descrease_down_up_down_10"
    ]
    trend_types = sorted(set('_'.join(t.split('_')[:-1]) for t in possible_trends))
    return jsonify(trend_types)

@data_bp.route('/sectors', methods=['GET'])
def get_sectors():
    try:
        sectors = sorted(set(sector["smb_sector"] for sector in SECTOR_RATIOS))
        return jsonify(sectors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500 