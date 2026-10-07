from flask import Flask, jsonify, request
from flask_cors import CORS
from database import create_tables, get_connection
import sqlite3
from datetime import date
import re

app = Flask(__name__)
CORS(app)

# Create database tables when the application starts
create_tables()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return "Library Management System is Running!"


# =========================================================
# DASHBOARD
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) AS total_books FROM books")
    total_books = cursor.fetchone()["total_books"]

    cursor.execute("""
        SELECT COUNT(*) AS available_books
        FROM books
        WHERE available = 1
    """)
    available_books = cursor.fetchone()["available_books"]

    cursor.execute("""
        SELECT COUNT(*) AS issued_books
        FROM books
        WHERE available = 0
    """)
    issued_books = cursor.fetchone()["issued_books"]

    cursor.execute("SELECT COUNT(*) AS total_members FROM members")
    total_members = cursor.fetchone()["total_members"]

    connection.close()

    return jsonify({
        "total_books": total_books,
        "available_books": available_books,
        "issued_books": issued_books,
        "total_members": total_members
    })


# =========================================================
# BOOKS - GET ALL BOOKS
# =========================================================

@app.route("/api/books", methods=["GET"])
def get_books():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM books
        ORDER BY id DESC
    """)

    books = cursor.fetchall()

    connection.close()

    return jsonify([dict(book) for book in books])


# =========================================================
# BOOKS - ADD BOOK
# =========================================================

@app.route("/api/books", methods=["POST"])
def add_book():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data received"
        }), 400

    title = data.get("title", "").strip()
    author = data.get("author", "").strip()
    isbn = data.get("isbn", "").strip()
    category = data.get("category", "").strip()

    # Check empty fields
    if not title or not author or not isbn or not category:
        return jsonify({
            "error": "All book fields are required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute("""
            INSERT INTO books
            (title, author, isbn, category, available)
            VALUES (?, ?, ?, ?, 1)
        """, (
            title,
            author,
            isbn,
            category
        ))

        connection.commit()

        book_id = cursor.lastrowid

        connection.close()

        return jsonify({
            "message": "Book added successfully",
            "id": book_id
        }), 201

    except sqlite3.IntegrityError:

        connection.close()

        return jsonify({
            "error": "ISBN already exists"
        }), 400


# =========================================================
# BOOKS - SEARCH
# =========================================================

@app.route("/api/books/search", methods=["GET"])
def search_books():

    query = request.args.get("q", "").strip()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM books
        WHERE title LIKE ?
           OR author LIKE ?
           OR isbn LIKE ?
        ORDER BY id DESC
    """, (
        f"%{query}%",
        f"%{query}%",
        f"%{query}%"
    ))

    books = cursor.fetchall()

    connection.close()

    return jsonify([dict(book) for book in books])


# =========================================================
# BOOKS - DELETE
# =========================================================

@app.route("/api/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):

    connection = get_connection()
    cursor = connection.cursor()

    # Check whether book exists
    cursor.execute("""
        SELECT *
        FROM books
        WHERE id = ?
    """, (book_id,))

    book = cursor.fetchone()

    if not book:
        connection.close()

        return jsonify({
            "error": "Book not found"
        }), 404

    # Check whether book is currently issued
    cursor.execute("""
        SELECT *
        FROM issued_books
        WHERE book_id = ?
        AND return_date IS NULL
    """, (book_id,))

    active_issue = cursor.fetchone()

    if active_issue:
        connection.close()

        return jsonify({
            "error": "Cannot delete a book that is currently issued"
        }), 400

    cursor.execute("""
        DELETE FROM issued_books
        WHERE book_id = ?
    """, (book_id,))

    cursor.execute("""
        DELETE FROM books
        WHERE id = ?
    """, (book_id,))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Book deleted successfully"
    })


# =========================================================
# MEMBERS - GET ALL MEMBERS
# =========================================================

@app.route("/api/members", methods=["GET"])
def get_members():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM members
        ORDER BY id DESC
    """)

    members = cursor.fetchall()

    connection.close()

    return jsonify([dict(member) for member in members])


# =========================================================
# MEMBERS - ADD MEMBER
# =========================================================

@app.route("/api/members", methods=["POST"])
def add_member():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No data received"
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()

    # Check empty fields
    if not name or not email or not phone:
        return jsonify({
            "error": "All member fields are required"
        }), 400

    # Basic email validation
    email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    if not re.match(email_pattern, email):
        return jsonify({
            "error": "Please enter a valid email address"
        }), 400

    # Basic phone validation
    if not phone.isdigit() or len(phone) != 10:
        return jsonify({
            "error": "Phone number must contain exactly 10 digits"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute("""
            INSERT INTO members
            (name, email, phone)
            VALUES (?, ?, ?)
        """, (
            name,
            email,
            phone
        ))

        connection.commit()

        member_id = cursor.lastrowid

        connection.close()

        return jsonify({
            "message": "Member added successfully",
            "id": member_id
        }), 201

    except sqlite3.IntegrityError:

        connection.close()

        return jsonify({
            "error": "Email already exists"
        }), 400


# =========================================================
# MEMBERS - DELETE
# =========================================================

@app.route("/api/members/<int:member_id>", methods=["DELETE"])
def delete_member(member_id):

    connection = get_connection()
    cursor = connection.cursor()

    # Check whether member exists
    cursor.execute("""
        SELECT *
        FROM members
        WHERE id = ?
    """, (member_id,))

    member = cursor.fetchone()

    if not member:
        connection.close()

        return jsonify({
            "error": "Member not found"
        }), 404

    # Check active issued book
    cursor.execute("""
        SELECT *
        FROM issued_books
        WHERE member_id = ?
        AND return_date IS NULL
    """, (member_id,))

    active_issue = cursor.fetchone()

    if active_issue:
        connection.close()

        return jsonify({
            "error": "Cannot delete a member who currently has an issued book"
        }), 400

    cursor.execute("""
        DELETE FROM issued_books
        WHERE member_id = ?
    """, (member_id,))

    cursor.execute("""
        DELETE FROM members
        WHERE id = ?
    """, (member_id,))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Member deleted successfully"
    })


# =========================================================
# ISSUE BOOK
# =========================================================

@app.route("/api/books/<int:book_id>/issue", methods=["POST"])
def issue_book(book_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Member ID is required"
        }), 400

    member_id = data.get("member_id")

    if not member_id:
        return jsonify({
            "error": "Member ID is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    # Check book
    cursor.execute("""
        SELECT *
        FROM books
        WHERE id = ?
    """, (book_id,))

    book = cursor.fetchone()

    if not book:
        connection.close()

        return jsonify({
            "error": "Book not found"
        }), 404

    # Check whether book is available
    if book["available"] == 0:
        connection.close()

        return jsonify({
            "error": "Book is already issued"
        }), 400

    # Check member
    cursor.execute("""
        SELECT *
        FROM members
        WHERE id = ?
    """, (member_id,))

    member = cursor.fetchone()

    if not member:
        connection.close()

        return jsonify({
            "error": "Member not found"
        }), 404

    # Issue book
    issue_date = date.today().isoformat()

    cursor.execute("""
        INSERT INTO issued_books
        (book_id, member_id, issue_date, return_date)
        VALUES (?, ?, ?, NULL)
    """, (
        book_id,
        member_id,
        issue_date
    ))

    # Change book availability
    cursor.execute("""
        UPDATE books
        SET available = 0
        WHERE id = ?
    """, (book_id,))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Book issued successfully"
    })


# =========================================================
# RETURN BOOK
# =========================================================

@app.route("/api/books/<int:book_id>/return", methods=["POST"])
def return_book(book_id):

    connection = get_connection()
    cursor = connection.cursor()

    # Check book
    cursor.execute("""
        SELECT *
        FROM books
        WHERE id = ?
    """, (book_id,))

    book = cursor.fetchone()

    if not book:
        connection.close()

        return jsonify({
            "error": "Book not found"
        }), 404

    # Check active issue
    cursor.execute("""
        SELECT *
        FROM issued_books
        WHERE book_id = ?
        AND return_date IS NULL
    """, (book_id,))

    issue = cursor.fetchone()

    if not issue:
        connection.close()

        return jsonify({
            "error": "This book is not currently issued"
        }), 400

    # Set return date
    return_date = date.today().isoformat()

    cursor.execute("""
        UPDATE issued_books
        SET return_date = ?
        WHERE id = ?
    """, (
        return_date,
        issue["id"]
    ))

    # Make book available
    cursor.execute("""
        UPDATE books
        SET available = 1
        WHERE id = ?
    """, (book_id,))

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Book returned successfully"
    })


# =========================================================
# RUN APPLICATION
# =========================================================

if __name__ == "__main__":
    app.run(debug=True)