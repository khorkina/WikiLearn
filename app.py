import os
import logging
from flask import Flask

# --------------------------------------------------
# базовая конфигурация
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "wikilearn_dev_secret_key")


from routes import *