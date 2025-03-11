import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8080/api";

export const SettingsPage = () => {
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    // 기존 유저 정보 불러오기
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username);
          setNickname(data.nickname);
        } else {
          console.error("사용자 정보 불러오기 실패");
        }
      } catch (error) {
        console.error("사용자 정보 요청 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, nickname }),
      });

      const data = await response.json();
      console.log("백엔드 응답:", data);

      if (response.ok) {
        alert("회원 정보가 성공적으로 수정되었습니다!");
      } else {
        alert(`회원 정보 수정 실패: ${data.message || "오류 발생"}`);
      }
    } catch (error) {
      console.error("회원 정보 수정 오류:", error);
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="settings-page">
      <h1>설정</h1>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="username">아이디:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="nickname">닉네임:</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <button type="submit" className="login-button-form">
          저장
        </button>
      </form>
    </div>
  );
};
