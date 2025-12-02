export async function apiFetch(url, options = {}) {
  const token = JSON.parse(localStorage.getItem("token") || "null");

  // Attach headers
  const customHeaders = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    customHeaders["Authorization"] = `Bearer ${token}`;
  }

  const finalOptions = {
    ...options,
    headers: customHeaders,
  };

  let response;

  try {
    response = await fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL + url,
      finalOptions
    );
  } catch (err) {
    console.error("Network Error:", err);
    throw err;
  }

  // If response is not JSON (backend down or HTML error page)
  let data;
  try {
    data = await response.json();
  } catch {
    console.warn("Non-JSON response from backend");
    throw new Error("Invalid server response");
  }

  // 🔥 Intercept errors exactly like Axios interceptor
  handleAuthErrors(response.status, data);

  return data;
}

function handleAuthErrors(status, data) {
  const code = data?.code;

  if (code === "AUTH_TOKEN_EXPIRED") {
    logout("Session expired. Login again.");
  }

  if (code === "AUTH_TOKEN_INVALID") {
    logout("Invalid token. Please login again.");
  }

  if (code === "TOKEN_INVALIDATED") {
    logout("Your session is invalid. Login again.");
  }

  if (code === "USER_BANNED") {
    logout("Your account is banned.");
  }
}

function logout(msg) {
  console.warn(msg);
  localStorage.removeItem("token");
  window.location.href = "/login";
}
