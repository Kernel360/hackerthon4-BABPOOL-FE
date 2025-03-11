const API_BASE_URL = "http://localhost:8080/api";

// 로그인 후 토큰 저장
export const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", `Bearer ${accessToken}`);
  localStorage.setItem("refreshToken", `Bearer ${refreshToken}`);
};

// 저장된 Access Token 가져오기
export const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// 저장된 Refresh Token 가져오기
export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

// Access Token 만료 시 Refresh Token으로 재발급
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.error("No refresh token found.");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const data = await response.json();
    storeTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    logout();
    return null;
  }
};

// 로그아웃 시 토큰 삭제
export const logout = async () => {
  try {
    const accessToken = getAccessToken();
    if (accessToken) {
      await fetch(`${API_BASE_URL}/users/logout`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.reload();
  }
};
