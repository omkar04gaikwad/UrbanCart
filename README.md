# UrbanCart - Secure Shopping Web Application

## Overview
UrbanCart is a **secure e-commerce web application** designed to simulate real-world online shopping platforms while focusing on security best practices. The project integrates multiple modern web development technologies while implementing robust security measures like **JWT authentication, CSRF protection, secure payments, Docker containerization, and Nginx as a reverse proxy for HTTPS**.

## Tech Stack
- **Frontend**: React.js (Component-based architecture)
- **Backend**: Flask (Lightweight and flexible Python web framework, containerized with Docker)
- **Database**: PostgreSQL (Hosted on AWS RDS)
- **Authentication**: JWT-based authentication with Firebase OTP verification
- **Payments**: Stripe API for secure transactions
- **Containerization**: Docker for backend services and Nginx for reverse proxy and HTTPS termination
- **Reverse Proxy**: Nginx for secure and optimized API handling
- **Hosting**: AWS EC2 for backend services, NGROK for HTTPS tunneling

## System Architecture (Low-Level Design)
```
+--------------------+       +---------------------+       +----------------+
|   Frontend (React)| ----> | Backend (Flask API)| ----> |  Database (RDS)|
+--------------------+       +---------------------+       +----------------+
          |                           |                         |
+--------------------+       +---------------------+       +----------------+
| Firebase OTP Auth |       | Stripe Payment API |       | Dockerized App |
+--------------------+       +---------------------+       +----------------+
          |
+----------------+
| Nginx Reverse Proxy |
+----------------+
```

### **Component Breakdown**
1. **Frontend (React.js)**: Handles user interactions, dynamic UI updates, cart management, and secure API requests.
2. **Backend (Flask API in Docker)**: Processes user requests, authentication, payments, and serves data securely.
3. **Database (PostgreSQL - AWS RDS)**: Stores users, products, orders, and transactions securely.
4. **Authentication (Firebase & JWT)**: Manages user login and phone authentication.
5. **Payment System (Stripe API)**: Handles secure payment processing with webhook integration.
6. **Reverse Proxy (Nginx)**: Acts as a gateway for HTTPS, load balancing, and request forwarding.
7. **Deployment (Docker & AWS)**: Ensures consistent environment with containerization.

---
## **Database Schema**
```
+----------------+        +----------------+        +----------------+        +----------------+
| Users         |        | Products       |        | Orders        |        | Payments      |
+----------------+        +----------------+        +----------------+        +----------------+
| id (PK)       |        | id (PK)        |        | id (PK)        |        | id (PK)       |
| name          |        | name           |        | user_id (FK)   |        | order_id (FK) |
| email (Unique)|        | description    |        | total_amount   |        | payment_status|
| password      |        | price          |        | status         |        | payment_method|
+----------------+        +----------------+        +----------------+        +----------------+
```

## **Key Features & Security Enhancements**
### **1️⃣ Authentication & Security**
- **JWT Authentication**: Secure user authentication using access tokens.
- **Firebase OTP Verification**: Phone-based authentication for user validation.
- **CSRF Protection**: Tokens included in all requests to prevent unauthorized actions.
- **Secure Cookies**: HTTP-only cookies to prevent XSS token theft.

### **2️⃣ Payment System (Stripe Integration)**
- **Payment Intent Workflow**: Backend creates a Payment Intent, and Stripe handles transactions securely.
- **Webhook Integration**: Stripe notifies the backend upon payment success, updating the database.
- **SSL/TLS Encryption**: Secure communication between client and server.

### **3️⃣ Docker Containerization & Nginx Reverse Proxy**
- **Backend in Docker**: Flask API is containerized for consistency.
- **Nginx Reverse Proxy**: Handles HTTPS termination, load balancing, and request routing.
- **Multi-Container Setup**: Backend, database, and proxy run as separate containers in a **Docker Compose** network.
- **Security Enhancements**: Uses Nginx to restrict direct backend access and prevent malicious attacks.

---
## **Endpoints Documentation**

### **User Authentication**
- **POST `/users/register`** - Register a new user with OTP verification.
- **POST `/users/login`** - Authenticate user and return JWT.

### **Product Management**
- **GET `/products/`** - Retrieve all available products.
- **GET `/products/{id}`** - Fetch details of a specific product.

### **Cart & Orders**
- **POST `/cart/add`** - Add an item to the cart.
- **POST `/checkout/`** - Proceed to checkout and create an order.
- **GET `/orders/{user_id}`** - Retrieve order history of a user.

### **Payment System**
- **POST `/payments/`** - Process payment for an order.
- **Webhook `/payments/webhook`** - Handles Stripe payment confirmation.

---
## **Deployment Using Docker & Nginx**

### **1️⃣ Docker Setup**
Ensure Docker and Docker Compose are installed.

#### **Step 1: Build and Start Services**
```bash
docker-compose up --build -d
```
This will start:
- Flask Backend (`backend` container)
- PostgreSQL Database (`db` container)
- Nginx Reverse Proxy (`nginx` container)

#### **Step 2: Check Running Containers**
```bash
docker ps
```

### **2️⃣ Nginx Configuration (Reverse Proxy)**
Nginx acts as a gateway for API requests and secures connections via HTTPS.

Example **nginx.conf**:
```nginx
server {
    listen 80;
    server_name example.com;

    location /api/ {
        proxy_pass http://backend:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

To apply Nginx config in the Docker container:
```bash
docker exec -it nginx nginx -s reload
```

---
## **Testing & Security Analysis**
- **SQL Injection Prevention**: Tested using SQLMap to ensure secure query handling.
- **XSS Protection**: Input sanitization and CSP policies implemented.
- **CSRF Testing**: Validates CSRF tokens for all critical requests.
- **Load Testing**: Simulated high traffic scenarios to evaluate system performance.

---
## **Setup & Run the Project Locally**
### **1️⃣ Install Dependencies**
```bash
pip install -r requirements.txt
```
### **2️⃣ Initialize Database**
```bash
python models/model.py  # Creates tables
```
### **3️⃣ Run Flask Backend**
```bash
flask -app main run
```
### **4️⃣ Start React Frontend**
```bash
cd frontend && npm install && npm start
```
### **5️⃣ Run Tests**
```bash
pytest
```

---
## **Future Enhancements**
- **AI-Based Fraud Detection**: Implement machine learning models to detect fraudulent transactions.
- **Multi-Factor Authentication (MFA)**: Add email verification in addition to OTP-based login.
- **Kubernetes for Deployment**: Improve scalability with container orchestration.

---
