# backend/app.py

from flask import Flask
from flask_cors import CORS

# Blueprint import nanti di sini
# from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)

# Register route blueprint di sini
# app.register_blueprint(auth_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'SellEase Backend is running!'}

if __name__ == '__main__':
    app.run(debug=True)
