const BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/sales"
).replace(/\/$/, "");

export const token = () => {
  return (
    localStorage.getItem("salesAccessToken") ||
    sessionStorage.getItem("salesAccessToken") ||
    ""
  );
};

async function req(path, options = {}) {
  const accessToken = token();

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  let data;

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const responseText = await response.text();
      data = {
        message: responseText || "The server returned an invalid response.",
      };
    }
  } catch (parseError) {
    console.error("Unable to parse API response:", parseError);
    data = { message: "The server returned an invalid response." };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("salesAccessToken");
      localStorage.removeItem("salesUser");
      sessionStorage.removeItem("salesAccessToken");
      sessionStorage.removeItem("salesUser");
    }

    throw new Error(
      data?.message || `API request failed with status ${response.status}.`
    );
  }

  return data;
}

export const login = (email, password) => {
  return req("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const dashboard = () => req("/dashboard");

export const vendors = (query = "") => {
  const queryString = query ? `?${query}` : "";
  return req(`/vendors${queryString}`);
};

export const leads = (query = "") => {
  const queryString = query ? `?${query}` : "";
  return req(`/leads${queryString}`);
};

export const withdrawal = () => req("/withdrawals/summary");

export const withdraw = (amount) => {
  return req("/withdrawals", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
};

export const getProfile = () => req("/profile");

export const commissions = (query = "") => {
  const queryString = query ? `?${query}` : "";
  return req(`/commissions${queryString}`);
};

export const getAccountSettings = () => {
  return req("/account-settings");
};

export const updateAccountSettings = (payload) => {
  return req("/account-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const changeSalesPassword = (payload) => {
  return req("/account-settings/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const getVendorRegistrationCategories = () => {
  return req("/vendor-registration/categories");
};

export const completeSalesVendorRegistration = (formData) => {
  const accessToken = token();
  return fetch(`${BASE}/vendor-registration`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  }).then(async (response) => {
    const result = await response.json().catch(() => ({ message: "Invalid server response." }));
    if (!response.ok) throw new Error(result?.message || "Vendor registration failed.");
    return result;
  });
};

