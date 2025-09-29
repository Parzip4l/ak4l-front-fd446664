// src/lib/api.ts
export const apiFetch = async (
  url: string,
  token: string,
  options: RequestInit = {}
) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Fetch failed:", errorText);
    throw new Error(`API request failed: ${res.status}`);
  }

  return res.json();
};
