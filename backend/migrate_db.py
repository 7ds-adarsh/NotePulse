import sqlite3
import os

def migrate_database():
    """Add title and formatting columns to notes table"""
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'app.db')

    if not os.path.exists(db_path):
        print("Database not found. Please run the app first to create the database.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(note)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'title' not in columns:
            print("Adding title column...")
            cursor.execute("ALTER TABLE note ADD COLUMN title VARCHAR(200)")
        else:
            print("Title column already exists")

        if 'formatting' not in columns:
            print("Adding formatting column...")
            cursor.execute("ALTER TABLE note ADD COLUMN formatting TEXT")
        else:
            print("Formatting column already exists")

        conn.commit()
        print("Migration completed successfully!")

    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()

    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()