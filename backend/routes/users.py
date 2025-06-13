# backend/routes/users.py

from flask import Blueprint, request, jsonify
from db import get_db_connection
from werkzeug.security import generate_password_hash

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, role FROM users ORDER BY id DESC")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)

@users_bp.route('/users', methods=['POST'])
def add_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if not username or not password or role not in ['admin', 'kasir']:
        return jsonify({'error': 'Data tidak valid'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) AS count FROM users WHERE username = %s", (username,))
        if cursor.fetchone()['count'] > 0:
            return jsonify({'error': 'Username sudah digunakan'}), 409

        hash_pw = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)", (username, hash_pw, role))
        conn.commit()
        return jsonify({'message': 'User berhasil ditambahkan'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
