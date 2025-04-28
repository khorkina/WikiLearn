import os
import logging
from flask import Flask, render_template, request, redirect, url_for, jsonify, session

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "wikilearn_dev_secret_key")

# Import routes after app initialization to avoid circular imports
from routes import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
