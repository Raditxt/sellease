from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.products import products_bp
from routes.transactions import transactions_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(transactions_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'SellEase Backend is running!'}

if __name__ == '__main__':
    app.run(debug=True)
