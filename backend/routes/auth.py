# backend/routes/auth.py

from flask import Blueprint, request, jsonify
from db import get_db_connection
from utils.security import verify_password
from utils.logger import log_activity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and verify_password(password, user['password_hash']):
        # Sukses login
        log_activity(user['id'], f"login sebagai {user['role']}")
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role']
            }
        })
    else:
        return jsonify({'error': 'Invalid username or password'}), 401
