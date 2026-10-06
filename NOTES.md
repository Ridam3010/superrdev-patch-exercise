# Engineering Notes & Tradeoffs

## Summary of Changes
1. **SQL Precedence Fix (`TaskRepository.java`, `search_tasks.sql`, `task_search_package.sql`)**: Enclosed title and description `LIKE` conditions in parentheses. Previously, `AND` precedence leaked archived records and ignored status filters.
2. **Removed Artificial Latency (`TaskController.java`)**: Removed `Thread.sleep` blocking Tomcat threads based on query length.
3. **Safe Status Parsing (`TaskController.java`)**: Wrapped enum parsing with validation, returning HTTP 400 instead of unhandled 500 exceptions on invalid status input.
4. **Pagination Bounds (`TaskController.java`)**: Clamped `page >= 1` and `pageSize` to prevent negative slice indexing and server errors.
5. **Race Condition & Lifecycle Handling (`useTasks.js`)**: Implemented `AbortController` cleanup to cancel stale in-flight requests on fast typing and ensured `loading: false` in error states.
6. **Debouncing & Filter Reset (`App.jsx`)**: Added 300ms debounce on search input and reset pagination to page 1 on query/status change.

## What I Chose Not to Change & Why
- **In-Memory Pagination in Backend**: Left pagination as `List.subList` rather than database-level `LIMIT`/`OFFSET` or Spring Data `Pageable`. For an in-memory H2 dataset of ~40 rows, keeping the focused diff small was preferred over adding database dialect abstraction.
- **Styling Architecture**: Retained plain vanilla CSS without introducing Tailwind or UI component libraries to keep dependencies minimal and changes focused.

## Biggest Remaining Risk
- **Unbounded Database Queries Under Scale**: The backend currently queries all matching rows into Java heap memory before slicing. If the dataset grows to tens of thousands of rows, this will cause memory pressure and latency. Future work should transition to Spring Data `Pageable` with database indexing on `(archived, status, created_at)`.

## Tools & AI Used
- Used Gemini for initial static code inspection and tracing SQL precedence pitfalls. Refined the `AbortController` cleanup logic and debounce delay manually to ensure zero race conditions.
