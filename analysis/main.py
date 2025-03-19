from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/datagen', methods=['GET'])
def run_data_collect():
    try:
        import subprocess

        # scripts/dataCollect.py 실행
        result = subprocess.run(['python', 'scripts/dataCollect.py'],
                              capture_output=True,
                              text=True)

        if result.returncode == 0:
            return jsonify({
                "status": "success",
                "message": "데이터 수집이 완료되었습니다."
            })
        else:
            return jsonify({
                "status": "error",
                "message": "데이터 수집 중 오류가 발생했습니다.",
                "error": result.stderr
            }), 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "실행 중 오류가 발생했습니다.",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=3800)