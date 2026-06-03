const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side call uses public mapping
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  }
  // Server-side docker-to-docker call uses service name
  return "http://backend:8080";
};

export async function apiRequest(path: string, options: RequestInit = {}, token?: string) {
  const url = `${getBaseUrl()}${path}`;
  const headers = new Headers(options.headers || {});

  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    const match = document.cookie.match(/(^|;)\s*auth_token\s*=\s*([^;]+)/);
    authToken = match ? match[2] : "";
  }

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // JSON parse failed, use fallback status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
