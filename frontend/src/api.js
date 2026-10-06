const API_BASE = '/api';

export async function fetchTasks({ query = '', status = '', page = 1, pageSize = 10, signal = null }) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));

  const url = `${API_BASE}/tasks?${params.toString()}`;
  console.log('[api] fetching:', url);

  const response = await fetch(url, { signal });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data && data.error) errorMsg = data.error;
    } catch {
      // fallback to status error message
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
