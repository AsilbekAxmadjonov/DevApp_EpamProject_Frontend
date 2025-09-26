// src/hooks/useFetch.js
import { useState, useCallback } from 'react';

export function useFetch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const request = useCallback(
    async (url, method = 'GET', body = null, customHeaders = {}) => {
      setLoading(true);
      try {
        // Normalize URL:
        // if front call starts with "/api" -> call backend at http://localhost:8080/api/v1/...
        let fullUrl = url;
        if (url.startsWith('/api')) {
          fullUrl = `http://localhost:8080/api/v1${url.slice(4)}`; // '/api/posts' => '/api/v1/posts'
        } else {
          fullUrl = url;
        }

        // Attach token if exists
        const token = localStorage.getItem('token');
        const headers = { ...customHeaders };
        if (token) headers.Authorization = `Bearer ${token}`;

        const options = { method, headers };

        if (body) {
          if (body instanceof FormData) {
            // Leave as-is so browser sets multipart boundary
            options.body = body;
          } else {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
          }
        }

        const res = await fetch(fullUrl, options);

        // Try parse JSON if available
        const contentType = res.headers.get('content-type') || '';
        let data = null;
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else if (res.status !== 204) {
          data = await res.text();
        }

        if (!res.ok) {
          const message = (data && data.message) || res.statusText || 'Request failed';
          throw new Error(message);
        }

        setLoading(false);
        return data;
      } catch (err) {
        setLoading(false);
        setError(err.message || 'Something went wrong');
        throw err;
      }
    },
    []
  );

  return { request, loading, error, clearError };
}
