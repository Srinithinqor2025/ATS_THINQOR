import pymysql
from utils.db import get_db_connection

conn = get_db_connection()
if conn:
    cursor = conn.cursor()
    cursor.execute('SHOW TABLES')
    tables = cursor.fetchall()
    print('Tables:', [t[0] for t in tables])

    # Check if candidate_progress table exists and has data
    cursor.execute("SELECT COUNT(*) FROM candidate_progress WHERE status='COMPLETED'")
    completed_count = cursor.fetchone()[0]
    print('Completed candidates:', completed_count)

    # Check users table
    cursor.execute('SELECT COUNT(*) FROM users')
    users_count = cursor.fetchone()[0]
    print('Total users:', users_count)

    cursor.close()
    conn.close()
else:
    print('Database connection failed')