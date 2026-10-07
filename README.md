# Library Management System

## Project Description

The Library Management System is a web-based application developed to simplify and organize common library management activities. The application allows users to manage books and library members, search for books, issue books to members, and process book returns through a user-friendly web interface.

The system also provides validation to prevent duplicate ISBN entries, issuing an already issued book, and returning a book that is not currently issued.

## Features

- Add new books
- View all books
- Search books by title, author, or ISBN
- Delete books
- Register library members
- View registered members
- Delete members
- Issue books to members
- Return books
- Prevent duplicate ISBN entries
- Prevent issuing an already issued book
- Prevent returning a book that is not currently issued
- Validate member email addresses
- Validate 10-digit phone numbers
- Dashboard displaying total books, available books, issued books, and members

## Technologies and Tools Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Backend
- Python
- Flask
- Flask-CORS

### Database
- SQLite

### Development Tools
- Visual Studio Code
- Python
- Node.js and npm
- Git and GitHub

## Project Structure

```text
Library-Management-System/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   └── library.db
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── screenshots/
│   ├── 01_dashboard.png
│   ├── 02_book_management.png
│   ├── 03_duplicate_isbn_validation.png
│   ├── 04_member_management.png
│   ├── 05_issue_book.png
│   ├── 06_duplicate_issue_validation.png
│   ├── 07_return_book.png
│   └── 08_invalid_return.png
│
├── package.json
├── requirements.txt
└── README.md

Requirements :

Before running the project, make sure the following are installed:

Python 3
A web browser such as Google Chrome
Visual Studio Code (recommended)
Python packages listed in requirements.txt
How to Run the Project
1. Open the Project

Open the Library-Management-System folder in Visual Studio Code.

2. Install Backend Dependencies

Open a terminal in Visual Studio Code and navigate to the backend folder:

cd backend

If a virtual environment is being used, activate it:

..\venv\Scripts\Activate.ps1

Install the required Python packages:
python -m pip install -r ..\requirements.txt

3. Start the Backend Server

From the backend folder, run:

python app.py

The Flask backend will run at:

http://127.0.0.1:5000

Keep this terminal running.

4. Start the Frontend Server

Open a second terminal in Visual Studio Code.

Navigate to the frontend folder:

cd frontend

Start the built-in Python HTTP server:

python -m http.server 5500

The frontend will run at:

http://127.0.0.1:5500

Open this address in a web browser to use the application.

Database

The application uses SQLite as its database.

The database contains the following main tables:

books — stores book information
members — stores library member information
issued_books — stores book issue and return records

The SQLite database file is:

backend/library.db
Validation and Error Handling

The application includes the following validations:

All required book fields must be entered.
ISBN values must be unique.
Member email addresses must be valid.
Member email addresses must be unique.
Phone numbers must contain exactly 10 digits.
Only available books can be issued.
An already issued book cannot be issued again.
Only currently issued books can be returned.
Currently issued books cannot be deleted.
Members with currently issued books cannot be deleted.

Conclusion

The Library Management System provides a simple and efficient solution for managing library books, members, and borrowing transactions. The project demonstrates the integration of a frontend interface, Flask backend APIs, and an SQLite database to create a functional full-stack web application.

Future Scope

The project can be further enhanced by adding:

User authentication and login
Admin and librarian roles
Due-date management
Fine calculation for late returns
Advanced search and filtering
Reports and analytics
Book cover images
Cloud database integration 