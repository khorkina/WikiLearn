from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/proxy', methods=['POST'])
def proxy():
    data = request.json
    # Путь к API Puter
    putter_api_url = "https://api.puter.com/v1/chat"  # ОБЯЗАТЕЛЬНО укажи правильный реальный endpoint
    response = requests.post(putter_api_url, json=data)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
