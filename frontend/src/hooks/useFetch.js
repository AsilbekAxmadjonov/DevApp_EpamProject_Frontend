import { useState, useCallback } from "react";

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setLoading(true);
      try {
        // Read token safely
        let token = null;
        try {
          const raw = localStorage.getItem("authData");
          if (raw) {
            const parsed = JSON.parse(raw);
            token = parsed?.token ?? null;
          }
        } catch {
          /* ignore bad JSON */
        }

        // Build headers
        const reqHeaders = { Accept: "application/json", ...headers };
        if (token && !reqHeaders.Authorization) {
          reqHeaders.Authorization = `Bearer ${token}`;
        }

        // Prepare body & content-type
        let payload = body;
        if (
          payload &&
          !(payload instanceof FormData) &&
          !(payload instanceof URLSearchParams)
        ) {
          if (!reqHeaders["Content-Type"])
            reqHeaders["Content-Type"] = "application/json";
          payload = JSON.stringify(payload);
        }

        const res = await fetch(url, {
          method,
          headers: reqHeaders,
          body: payload,
        });

        console.log(res);
        const ct = res.headers.get("content-type") || "";
        let data = null;
        if (ct.includes("application/json"))
          data = await res.json().catch(() => null);
        else if (res.status !== 204) data = await res.text().catch(() => null);

        if (!res.ok) {
          const message =
            (data && (data.message || data.error || data.detail)) ||
            (typeof data === "string" && data) ||
            `Request failed with status ${res.status}`;
          const err = new Error(message);
          err.status = res.status;
          err.data = data;
          throw err;
        }

        // just before `return data;`
        if (res.ok && data && typeof data === "object" && "data" in data) {
          // unwrap common envelope shape
          // @ts-ignore
          return data.data;
        }

        console.log(data);
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
