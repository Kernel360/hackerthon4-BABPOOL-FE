import React, { useState } from "react";

const API_BASE_URL = "http://3.38.71.28:8080/api";


const SetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      alert("모든 비밀번호 필드를 입력해주세요.");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
  
    try {
      const token = localStorage.getItem("accessToken");
  
      const response = await fetch(`${API_BASE_URL}/users/password`, {
        method: "PATCH",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          password: newPassword.trim(),
        }),
      });
  
      const data = await response.json();
      console.log("백엔드 응답:", data);
  
      if (response.ok) {
        alert("비밀번호가 성공적으로 변경되었습니다!");
  
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
  
        await fetch(`${API_BASE_URL}/users/logout`, {
          method: "PATCH",
          headers: { "Authorization": token },
        });
  
        window.location.href = "/login"; 
      } else {
        alert(`비밀번호 변경 실패: ${data.message}`);
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      alert("서버 연결 실패");
    }
  };
  
  
  return (
    <div className="settings-page">
      <h1>비밀번호 변경</h1>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="currentPassword">현재 비밀번호:</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">새 비밀번호:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">새 비밀번호 확인:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button-form">
          변경하기
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
