import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to default 'postgres' database
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="root",
            host="localhost",
            port="5432"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if inspectai database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'inspectai';")
        exists = cursor.fetchone()
        if not exists:
            cursor.execute("CREATE DATABASE inspectai;")
            print("Successfully created 'inspectai' database in PostgreSQL!")
        else:
            print("Database 'inspectai' already exists in PostgreSQL.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error provisioning PostgreSQL database: {e}")

if __name__ == "__main__":
    create_database()
