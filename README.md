
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

| **Frontend** | React 19, Vite, Tailwind | User Interface |
| **Backend** | Java 17, Spring Boot 3.2 | REST API, Business Logic |
| **Database** | H2 / MySQL | Data Persistence |
| **Analytics** | Python 3.8+, Pandas, Flask | Data Analysis, ML Insights |
| **Performance** | C++17, CMake | High-speed Calculations |
| **Security** | Spring Security, JWT | Authentication |

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


## 🔐 Demo Credentials

```
Username: demo
Password: demo123
```


