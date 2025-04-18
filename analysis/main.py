from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import numpy as np
import subprocess
import sys
import os

app = Flask(__name__)
CORS(app)

@app.route('/datagen', methods=['GET'])
def run_data_collect():
    try:
        # business_number를 환경변수로 전달
        business_number = request.args.get('businessNumber')
        if not business_number:
            return jsonify({
                "status": "error",
                "message": "사업자번호가 필요합니다."
            }), 400

        # 환경변수로 business_number 전달
        env = os.environ.copy()
        env['BUSINESS_NUMBER'] = business_number

        process = subprocess.Popen([sys.executable, 'scripts/dataCollect.py'],
                                 stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE,
                                 text=True,
                                 env=env)

        # 🔹 실시간 출력 처리
        output_lines = []
        for line in process.stdout:
            print(line.strip())  # Flask 콘솔에 실시간 출력
            output_lines.append(line.strip())

        process.wait()  # 스크립트가 종료될 때까지 대기

        if process.returncode == 0:
            return jsonify({
                "status": "success",
                "message": "데이터 수집이 완료되었습니다."
            })
        else:
            error_output = process.stderr.read()
            return jsonify({
                "status": "error",
                "message": "데이터 수집 중 오류가 발생했습니다.",
                "error": error_output
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "실행 중 오류가 발생했습니다.",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3800)