# Student Management System

A complete Student Management System built with Node.js, Express, PostgreSQL, and Vanilla JavaScript.

## Features
- **User Authentication** (Signup/Login with Password Hashing)
- **Student Management** (Add, List, Update, Delete Students)
- **JWT Authorization** (Secure access to dashboard)
- **Dashboard** (Manage students)
- **RESTful API** structure

## Prerequisites
- Node.js installed
- PostgreSQL installed and running locally

## Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Ensure you have a `.env` file in the root directory with the following content:
    ```
    PORT=5000
    POSTGRES_URI=postgres://user:password@localhost:5432/student_db
    JWT_SECRET=supersecretkey123
    ```

## Running the Application

1.  **Start PostgreSQL**
    Make sure your local PostgreSQL service is running and the database exists.

2.  **Start the Server**
    ```bash
    npm start
    ```
    You should see:
    ```
    Server running on port 5000
    PostgreSQL Connected via Sequelize
    Models Synced
    ```

3.  **Access the App**
    Open your browser and visit: `http://localhost:5000`

## API Endpoints (Testing with Postman)

### 1. Register User
- **URL**: `POST http://localhost:5000/api/auth/register`
- **Body** (JSON):
    ```json
    {
      "username": "admin",
      "email": "admin@example.com",
      "password": "password123"
    }
    ```

### 2. Login User
- **URL**: `POST http://localhost:5000/api/auth/login`
- **Body** (JSON):
    ```json
    {
      "email": "admin@example.com",
      "password": "password123"
    }
    ```
- **Response**: You will receive a `token`.

### 3. Add Student (Protected)
- **URL**: `POST http://localhost:5000/api/students`
- **Headers**: `Authorization`: `Bearer <TOKEN>`
- **Body** (JSON):
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "1234567890",
      "registrationNumber": "REG001"
    }
    ```

### 4. Get Students (Protected)
- **URL**: `GET http://localhost:5000/api/students`
- **Headers**: `Authorization`: `Bearer <TOKEN>`

## Project Structure
- `server.js`: Entry point.
- `config/`: Database configuration (Sequelize).
- `models/`: Database schemas (Sequelize - User, Student).
- `routes/`: API routes.
- `controllers/`: Request logic.
- `middleware/`: Auth middleware.
- `public/`: Frontend files.
