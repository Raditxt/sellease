# backend/routes/dashboard.py

from flask import Blueprint, jsonify
from db import get_db_connection

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/summary', methods=['GET'])
def dashboard_summary():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Total penjualan (bulan ini)
    cursor.execute("""
        SELECT IFNULL(SUM(total_amount), 0) AS total_sales
        FROM transactions
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
    """)
    total_sales = cursor.fetchone()['total_sales']

    # Jumlah produk
    cursor.execute("SELECT COUNT(*) AS total_products FROM products")
    total_products = cursor.fetchone()['total_products']

    # Jumlah pelanggan
    cursor.execute("SELECT COUNT(*) AS total_customers FROM customers")
    total_customers = cursor.fetchone()['total_customers']

    # Stok rendah
    cursor.execute("""
        SELECT COUNT(*) AS low_stock_count
        FROM products
        WHERE stock <= low_stock_threshold
    """)
    low_stock = cursor.fetchone()['low_stock_count']

    # Transaksi terakhir (limit 5)
    cursor.execute("""
        SELECT t.id, t.created_at, c.name AS customer_name, t.total_amount
        FROM transactions t
        LEFT JOIN customers c ON t.customer_id = c.id
        ORDER BY t.created_at DESC
        LIMIT 5
    """)
    recent_transactions = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        'total_sales': total_sales,
        'total_products': total_products,
        'total_customers': total_customers,
        'low_stock_items': low_stock,
        'recent_transactions': recent_transactions
    })
