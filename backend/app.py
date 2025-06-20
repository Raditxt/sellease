from flask import Flask
from flask_cors import CORS
from routes.auth import auth_bp
from routes.products import products_bp
from routes.transactions import transactions_bp
from routes.dashboard import dashboard_bp
from routes.reports import reports_bp
from routes.logs import logs_bp
from routes.customers import customers_bp
from routes.users import users_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(products_bp, url_prefix='/api')
app.register_blueprint(transactions_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')   
app.register_blueprint(logs_bp, url_prefix='/api')
app.register_blueprint(customers_bp, url_prefix='/api')
app.register_blueprint(users_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'SellEase Backend is running!'}

if __name__ == '__main__':
    app.run(debug=True)
