import os
import mysql.connector
from mysql.connector import Error

# -------------------------------------
# Database connection configuration
# -------------------------------------
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'pujitha'),
    'database': os.getenv('DB_NAME', 'ats_system')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            # print("✅ MySQL Database connected successfully!") # Optional: reduce noise
            return connection
    except Error as e:
        print("❌ Database connection failed:", e)
        return None
