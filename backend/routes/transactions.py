# backend/routes/transactions.py

from flask import Blueprint, request, jsonify
from db import get_db_connection
from datetime import datetime
from utils.logger import log_activity

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.json

    customer_id = data.get('customer_id', 1)  # default pelanggan anonim
    user_id = data.get('user_id')
    total = data.get('total_amount')
    discount = data.get('discount', 0.0)
    tax = data.get('tax', 0.0)
    payment_method = data.get('payment_method')
    items = data.get('items')  # list produk [{product_id, quantity, price}, ...]

    if not user_id or not payment_method or not items:
        return jsonify({'error': 'Data tidak lengkap'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Simpan transaksi
        cursor.execute("""
            INSERT INTO transactions (customer_id, user_id, total_amount, discount, tax, payment_method)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (customer_id, user_id, total, discount, tax, payment_method))
        transaction_id = cursor.lastrowid

        # Simpan tiap item & kurangi stok
        for item in items:
            product_id = item['product_id']
            quantity = item['quantity']
            price = item['price']

            cursor.execute("""
                INSERT INTO transaction_items (transaction_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (transaction_id, product_id, quantity, price))

            cursor.execute("""
                UPDATE products SET stock = stock - %s WHERE id = %s
            """, (quantity, product_id))

        conn.commit()
        log_activity(user_id, f"Melakukan transaksi ID {transaction_id} dengan total {total}")
        return jsonify({'message': 'Transaksi berhasil disimpan'}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()
        
@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    user_id = request.args.get('user_id')  # optional (kasir)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT t.id, t.created_at, t.total_amount, t.payment_method,
                   c.name AS customer_name, u.username AS kasir
            FROM transactions t
            LEFT JOIN customers c ON t.customer_id = c.id
            LEFT JOIN users u ON t.user_id = u.id
        """
        if user_id:
            query += " WHERE t.user_id = %s ORDER BY t.created_at DESC"
            cursor.execute(query, (user_id,))
        else:
            query += " ORDER BY t.created_at DESC"
            cursor.execute(query)

        results = cursor.fetchall()
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

