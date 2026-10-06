# Guide for Handwritten Notes

Write these 4 core bug explanations by hand on paper, take photos, and save them in this `handwritten/` directory (e.g. `handwritten/notes_p1.jpg`, `handwritten/notes_p2.jpg`).

---

### Bug 1: SQL Operator Precedence in Search Query
- **Location**: `backend/src/main/java/com/internal/tasktracker/TaskRepository.java` (Line 15), `db/queries/search_tasks.sql`, `db/oracle/task_search_package.sql`
- **How Discovered**: Testing search term 'api' returned archived records ('Legacy API cleanup'). Also, filtering by status 'DONE' while typing a query still returned 'OPEN' tasks.
- **Root Cause**: In SQL, `AND` has higher precedence than `OR`. The clause:
  `WHERE archived = FALSE AND LOWER(title) LIKE :term OR LOWER(description) LIKE :term AND (:status IS NULL OR status = :status)`
  evaluates as:
  `(archived = FALSE AND title MATCH) OR (desc MATCH AND status MATCH)`.
  Any archived item whose description matched `:term` was returned, and any active item whose title matched bypassed the status filter.
- **How Fixed & Why**: Added explicit parentheses:
  `WHERE archived = FALSE AND (LOWER(title) LIKE :term OR LOWER(description) LIKE :term) AND (:status IS NULL OR status = :status)`
  This enforces both `archived = FALSE` and status filtering unconditionally across both title and description matches.

---

### Bug 2: Artificial Request Latency in Controller
- **Location**: `backend/src/main/java/com/internal/tasktracker/TaskController.java` (Lines 37-45)
- **How Discovered**: Observed 1000ms response latency on empty and single-character searches in network tab.
- **Root Cause**: Code contained `int complexityScore = Math.max(0, 10 - query.length());` followed by `Thread.sleep(complexityScore * 100L);`. This artificially blocked backend Tomcat servlet worker threads.
- **How Fixed & Why**: Removed `Thread.sleep` and complexity calculation entirely. Controller methods should respond immediately without blocking threads.

---

### Bug 3: Status Enum Parsing & Unhandled 500 Error
- **Location**: `backend/src/main/java/com/internal/tasktracker/TaskController.java` (Line 30)
- **How Discovered**: Calling `/api/tasks?status=INVALID` caused an unhandled `IllegalArgumentException` resulting in HTTP 500 Internal Server Error.
- **Root Cause**: `TaskStatus.valueOf(status.toUpperCase())` throws unchecked `IllegalArgumentException` if the string does not exactly match an enum constant.
- **How Fixed & Why**: Wrapped enum conversion in a `try-catch` block returning `ResponseEntity.badRequest()` (HTTP 400). Validates user input defensively at the API boundary.

---

### Bug 4: Race Condition & Stuck Loading in Frontend Hook
- **Location**: `frontend/src/hooks/useTasks.js` (Lines 11-25)
- **How Discovered**: Rapid typing caused older, slower responses to overwrite newer search results. Network failure left "Loading tasks..." permanently on screen.
- **Root Cause**: `fetchTasks` promises had no cancellation cleanup (`AbortController`). Also, `setLoading(false)` was absent in `.catch()`.
- **How Fixed & Why**: Used `AbortController` in `useEffect` cleanup to cancel previous requests on new keystrokes. Ensured `setLoading(false)` and `setError(null)` execute on errors and new fetches. Added 300ms debounce in `App.jsx`.
