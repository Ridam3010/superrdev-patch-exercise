# Task Tracker — Technical Patch Submission

A full-stack task tracking application built with **React 18 (Vite)**, **Spring Boot 3.2 (Java 17)**, and **H2 In-Memory Database**.

---

## 📁 Repository Structure
```
├── backend/                  # Spring Boot 3.2 application
│   ├── src/main/java/...     # Controllers, Repositories, Entities
│   └── src/main/resources/   # schema.sql, data.sql, application.properties
├── frontend/                 # React 18 + Vite client
│   ├── src/                  # Components, Hooks, API client, Styles
│   └── package.json
├── db/                       # SQL and Oracle PL/SQL reference artifacts
│   ├── queries/search_tasks.sql
│   └── oracle/task_search_package.sql
├── handwritten/              # Scans & photos of handwritten bug analyses
├── NOTES.md                  # Concise engineering decisions & tradeoffs (<300 words)
└── README.md
```

---

## 🛠️ Summary of Applied Patches & Fixes

1. **SQL Operator Precedence (Backend & DB)**:
   - Fixed `WHERE` clause grouping in `TaskRepository.java`, `search_tasks.sql`, and `task_search_package.sql`.
   - Prevented archived tasks from leaking into search results and ensured the status filter is strictly honored.

2. **Removed Artificial Latency (Backend)**:
   - Removed `Thread.sleep()` artificial delay from `TaskController.java` to prevent servlet thread blocking and optimize response times.

3. **Defensive Status Enum Validation (Backend)**:
   - Added `try-catch` validation around status parsing in `TaskController.java` to return HTTP `400 Bad Request` instead of crashing with an unhandled HTTP `500 Internal Server Error`.

4. **Safe Pagination Indexing (Backend)**:
   - Guarded against negative/out-of-bounds page parameters (`page < 1`) to eliminate `IndexOutOfBoundsException`.

5. **Race Condition Prevention & Error Recovery (Frontend)**:
   - Introduced `AbortController` in `useTasks.js` cleanup to cancel stale in-flight requests during rapid typing.
   - Fixed permanent `"Loading tasks..."` hanging state on errors by ensuring `setLoading(false)` always executes.

6. **Debouncing & UX Enhancements (Frontend)**:
   - Added a 300ms debounce on search inputs in `App.jsx` to eliminate excessive network requests.
   - Automatically reset pagination to `Page 1` when filters or search queries change.

---

## 🚀 Running Locally

### Backend (Spring Boot):
```bash
cd backend
.\mvnw.cmd spring-boot:run     # Windows PowerShell
# or ./mvnw spring-boot:run     # macOS/Linux
```
API running on `http://localhost:8080` (H2 Console at `/h2-console`).

### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
UI running on `http://localhost:5173`.

---

## ✍️ Handwritten Notes
Detailed, handwritten explanations of root causes and architectural decisions are documented as photos in the [`handwritten/`](./handwritten/) folder.
