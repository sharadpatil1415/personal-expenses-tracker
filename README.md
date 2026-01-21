# Personal Expense Tracker 💰

A **production-grade, multi-language expense tracking system** demonstrating polyglot architecture with Java, Python, and C++. This project showcases enterprise-level design patterns, clean architecture, and cross-language integration.

## ✨ Key Features

- **User Authentication** - JWT-based secure login/registration
- **Expense Management** - Full CRUD operations with validation
- **Smart Analytics** - AI-powered spending insights and recommendations  
- **Expense Forecasting** - Time-series predictions using statistical models
- **High-Performance Calculations** - C++ powered statistics engine
- **Demo Mode** - Frontend works standalone with mock data
- **Localization** - Full support for Indian Rupee (₹) currency
- **CSV Export** - Export expenses for external analysis
- **RESTful API** - Clean, documented API endpoints

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 19, Vite, Tailwind | User Interface |
| **Backend** | Java 17, Spring Boot 3.2 | REST API, Business Logic |
| **Database** | H2 / MySQL | Data Persistence |
| **Analytics** | Python 3.8+, Pandas, Flask | Data Analysis, ML Insights |
| **Performance** | C++17, CMake | High-speed Calculations |
| **Security** | Spring Security, JWT | Authentication |

## 📁 Project Structure

```
personal-expense-tracker/
├── expense-backend/              # Java Spring Boot API
│   ├── src/main/java/com/tracker/
│   │   ├── controller/          # REST endpoints
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Data access
│   │   ├── model/               # JPA entities
│   │   ├── dto/                 # Data transfer objects
│   │   ├── security/            # JWT authentication
│   │   └── config/              # Configuration
│   └── pom.xml
│
├── analytics-engine/            # Python Analytics Service
│   ├── analytics/
│   │   ├── trends.py           # Spending analysis
│   │   ├── insights.py         # Budget recommendations
│   │   └── forecast.py         # Predictive analytics
│   ├── api.py                  # Flask REST API
│   └── requirements.txt
│
├── calc-engine/                 # C++ Performance Module
│   ├── include/statistics.hpp  # Header declarations
│   ├── src/
│   │   ├── statistics.cpp      # Implementation
│   │   └── main.cpp           # CLI interface
│   ├── jni/StatsBridge.cpp    # Java integration
│   └── CMakeLists.txt
│
├── dashboard/                   # React Frontend (NEW!)
│   ├── src/
│   │   ├── pages/             # Login, Dashboard, Reports
│   │   ├── components/        # Layout, ProtectedRoute
│   │   ├── context/           # AuthContext
│   │   └── services/          # API client
│   └── package.json
│
├── database/
│   └── schema.sql              # MySQL schema
│
└── README.md

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
└─────────────────────────────────────────────────────────────────┘
                               │ REST API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Java Spring Boot Backend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Controllers │──│  Services   │──│     Repositories        │  │
│  └─────────────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│                          │                      │                │
│                     ┌────┴────┐            ┌────┴────┐          │
│                     │ Process │            │   JPA   │          │
│                     │ Builder │            │         │          │
│                     └────┬────┘            └────┬────┘          │
└──────────────────────────┼──────────────────────┼───────────────┘
                           │                      │
           ┌───────────────┴───┐                  ▼
           ▼                   ▼           ┌─────────────┐
┌─────────────────┐  ┌─────────────────┐   │   H2/MySQL  │
│ Python Analytics│  │  C++ Calc Engine│   │   Database  │
│     (Flask)     │  │     (Native)    │   └─────────────┘
└─────────────────┘  └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Python 3.8+
- C++ compiler (MSVC/GCC) + CMake 3.16+

### 1. Start Java Backend

```bash
cd expense-backend
mvn spring-boot:run
```
The API will be available at `http://localhost:8080`

### 2. Start Python Analytics (Optional)

```bash
cd analytics-engine
pip install -r requirements.txt
python api.py --server
```
Analytics API at `http://localhost:5000`

### 3. Build C++ Engine (Optional)

```bash
cd calc-engine
mkdir build && cd build
cmake ..
cmake --build .
```

### 4. Start Frontend Dashboard

```bash
cd dashboard
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

> **Note:** The frontend automatically switches to **Demo Mode** if the backend is not running. You can log in with `demo` / `demo123` to test the UI with mock data.

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/{id}` | Get single expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/month?year=2024&month=1` | Get by month |
| GET | `/api/expenses/summary` | Get analytics summary |
| GET | `/api/expenses/export/csv` | Export to CSV |

### Sample Requests

**Register User:**
```json
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Create Expense:**
```json
POST /api/expenses
Authorization: Bearer <token>

{
  "amount": 45.99,
  "category": "FOOD",
  "description": "Dinner at restaurant",
  "expenseDate": "2024-01-15",
  "merchantName": "Pizza Palace"
}
```

## 🎯 Interview Talking Points

### Java Backend
- **Clean Architecture**: Layered design with Controller → Service → Repository
- **Spring Security**: Stateless JWT authentication with filter chain
- **JPA/Hibernate**: ORM with custom JPQL queries for analytics
- **Validation**: Bean validation with custom error handling

### Python Analytics
- **Pandas**: Efficient data manipulation for large datasets
- **Time-Series Analysis**: Moving averages, trend detection
- **50/30/20 Budget Rule**: Automated budget recommendations
- **Anomaly Detection**: Statistical outlier identification

### C++ Performance
- **Algorithm Optimization**: O(n) complexity where possible
- **JNI Integration**: Native code from Java for performance
- **Memory Efficiency**: RAII and smart resource management
- **Template Metaprogramming**: Type-safe generic calculations

### System Integration
- **ProcessBuilder**: Java subprocess management for Python/C++
- **JSON IPC**: Language-agnostic data exchange
- **Timeout Handling**: Robust inter-process communication

## 📊 Categories

| Category | Display Name |
|----------|-------------|
| FOOD | Food & Dining |
| TRANSPORT | Transportation |
| UTILITIES | Utilities & Bills |
| ENTERTAINMENT | Entertainment |
| SHOPPING | Shopping |
| HEALTHCARE | Healthcare |
| GROCERIES | Groceries |
| SUBSCRIPTIONS | Subscriptions |
| RENT | Rent & Housing |
| SAVINGS | Savings & Investments |

## 🔐 Demo Credentials

```
Username: demo
Password: demo123
```


