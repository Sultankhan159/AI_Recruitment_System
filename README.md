# AI Recruitment Management System

An intelligent, full-stack recruitment platform designed to streamline the hiring process using a modern web interface and a robust backend service.

## 🚀 Architecture & Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS, Lucide React
- **API Client**: Axios (configured to connect to `http://localhost:8080/api`)
- **Port**: `http://localhost:5173/`

### Backend
- **Framework**: Spring Boot 3.3.0
- **Language**: Java 21+
- **Database**: MySQL 8.0 (Schema: `recruitment_db`)
- **Security**: Spring Security + JWT Authentication
- **Port**: `http://localhost:8080/`

---

## 🛠️ How to Run Locally

### 1. Prerequisites
- **Node.js** (v22+)
- **Java JDK** (21+)
- **MySQL** running locally on port `3306` with username `root` and password `1234` (or configured differently in `application.yml`).

### 2. Start the Backend
Navigate to the `ai_job` directory and run:
```bash
./mvnw spring-boot:run
```

### 3. Start the Frontend
Navigate to the `frontend` directory and run:
```bash
cd frontend
npm run dev
```

---

## 📂 Project Structure

```text
ai_job/                       # Backend Spring Boot Project
├── README.md                 # Project documentation
├── src/                      # Java source files
├── pom.xml                   # Maven configuration
├── application.yml           # App properties & db settings
└── frontend/                 # Frontend React Project
    ├── src/                  # React components & pages
    ├── package.json          # Node dependencies
    └── vite.config.js        # Vite configuration
```
