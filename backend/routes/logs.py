# Tambahkan di bawah route summary atau di file baru

from flask import Blueprint, jsonify
from db import get_db_connection

logs_bp = Blueprint('logs', __name__)

@logs_bp.route('/logs', methods=['GET'])
def get_logs():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT l.id, u.username, u.role, l.action, l.created_at
        FROM activity_logs l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 100
    """)
    logs = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(logs)
