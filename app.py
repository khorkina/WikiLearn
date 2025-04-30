import os
import logging
from flask import Flask

# --------------------------------------------------
# базовая конфигурация
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "wikilearn_dev_secret_key")

# 👇  всё маршрутизацией занимается routes.py
from routes import *           # noqa: E402,F401

if __name__ == "__main__":
    # при локальной разработке → Ctrl-C останавливает
    app.run(host="0.0.0.0", port=5000, debug=True)
