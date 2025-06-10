# backend/utils/logger.py

from db import get_db_connection

def log_activity(user_id, action):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO activity_logs (user_id, action)
            VALUES (%s, %s)
        """, (user_id, action))
        conn.commit()
    except Exception as e:
        print("LOGGING ERROR:", e)
    finally:
        cursor.close()
        conn.close()
