import { useState, useCallback } from "react";

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      try {
        setLoading(true);

        // Auto add Authorization from localStorage (if present)
        const authData = JSON.parse(localStorage.getItem("authData") || "{}");
        if (authData.token && !headers.Authorization) {
          headers.Authorization = `Bearer ${authData.token}`;
        }
        if (!headers.Accept) headers.Accept = "application/json";

        let payload = body;
        if (payload && !(payload instanceof FormData)) {
          payload = JSON.stringify(payload);
          headers["Content-Type"] = "application/json";
        }

        const res = await fetch(url, {
          method,
          body: payload,
          headers,
          // credentials: 'include' // enable if you switch to cookie auth
        });

        let data = null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json().catch(() => null);
        } else if (res.status !== 204) {
          data = await res.text().catch(() => null);
        }

        if (!res.ok) {
          const message =
            (data && data.message) ||
            (typeof data === "string" && data) ||
            `Request failed with status ${res.status}`;
          throw new Error(message);
        }

        return data;
      } catch (err) {
        setError(err.message || "Unexpected error");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = () => setError(null);

  return { request, loading, error, clearError };
};
