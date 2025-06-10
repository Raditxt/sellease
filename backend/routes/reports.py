# backend/routes/reports.py

from flask import Blueprint, request, jsonify
from db import get_db_connection

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/sales', methods=['GET'])
def sales_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({'error': 'start_date dan end_date diperlukan'}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Ringkasan Penjualan
        cursor.execute("""
            SELECT 
                IFNULL(SUM(total_amount), 0) AS total_sales,
                COUNT(*) AS total_transactions,
                IFNULL(AVG(total_amount), 0) AS average_order
            FROM transactions
            WHERE DATE(created_at) BETWEEN %s AND %s
        """, (start_date, end_date))
        summary = cursor.fetchone()

        # Penjualan per bulan (12 bulan terakhir)
        cursor.execute("""
            SELECT 
                DATE_FORMAT(created_at, '%%Y-%%m') AS month,
                SUM(total_amount) AS monthly_sales
            FROM transactions
            WHERE DATE(created_at) BETWEEN %s AND %s
            GROUP BY month
            ORDER BY month
        """, (start_date, end_date))
        monthly_sales = cursor.fetchall()

        # Produk terlaris
        cursor.execute("""
            SELECT 
                p.name AS product,
                SUM(ti.quantity) AS units_sold,
                SUM(ti.quantity * ti.price) AS revenue
            FROM transaction_items ti
            JOIN products p ON ti.product_id = p.id
            JOIN transactions t ON ti.transaction_id = t.id
            WHERE DATE(t.created_at) BETWEEN %s AND %s
            GROUP BY product
            ORDER BY units_sold DESC
            LIMIT 10
        """, (start_date, end_date))
        top_products = cursor.fetchall()

        return jsonify({
            'summary': summary,
            'monthly_sales': monthly_sales,
            'top_products': top_products
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()
