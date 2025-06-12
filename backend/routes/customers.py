# backend/routes/customers.py

from flask import Blueprint, request, jsonify
from db import get_db_connection

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/customers', methods=['GET'])
def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM customers ORDER BY id DESC")
    customers = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(customers)

@customers_bp.route('/customers', methods=['POST'])
def add_customer():
    data = request.json
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')

    if not name:
        return jsonify({'error': 'Nama wajib diisi'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO customers (name, phone, email)
            VALUES (%s, %s, %s)
        """, (name, phone, email))
        conn.commit()
        return jsonify({
            'message': 'Pelanggan berhasil ditambahkan',
            'id': cursor.lastrowid  # ✅ penting untuk frontend
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
