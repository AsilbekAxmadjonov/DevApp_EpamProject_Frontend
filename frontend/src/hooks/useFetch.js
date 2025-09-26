import { header } from "framer-motion/client";
import { useState, useCallback } from "react";

// Set your backend base URL here
const BASE_URL = "http://localhost:8080";

export const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {token} = localStorage.getItem("AuthData");

  const request = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      try {
        setLoading(true);
 

        // If body is provided and not FormData, convert to JSON
        if (body && !(body instanceof FormData)) {
          body = JSON.stringify(body);
          headers["Content-Type"] = "application/json";
          headers["Authorization"] = `Bearer ${token}`;

        }

        const res = await fetch(`${BASE_URL}${url}`, {
          method,
          body,
          headers,
        });

        // Parse response based on content type
        let data = null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json().catch(() => null);
        } else {
          data = await res.text().catch(() => null);
        }

        if (!res.ok) {
          // Extract message from JSON or fallback to status
          const message =
            (data && data.message) ||
            (typeof data === "string" && data) ||
            `Request failed with status ${res.status}`;
          throw new Error(message);
        }

        console.log("Received response:", data);
        return data;
      } catch (err) {
        setError(err.message || "Unexpected error");
        console.error("Error when request:", err);
        throw err; // allow caller to catch it
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = () => setError(null);

  return { request, loading, error, clearError };
};
