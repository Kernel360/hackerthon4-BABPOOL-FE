import React from "react";

// Settings Page Component
export const SettingsPage = () => {
    const [nickname, setNickname] = React.useState('기본 닉네임');
    const [password, setPassword] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [profileImage, setProfileImage] = React.useState(null);
    const [previewImage, setPreviewImage] = React.useState(null);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append('nickname', nickname);
      formData.append('email', email);
      if (password) {
        formData.append('password', password);
      }
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
  
      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          body: formData,
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert('개인 정보가 성공적으로 수정되었습니다!');
        } else {
          alert(data.message || '개인 정보 수정에 실패했습니다.');
        }
      } catch (error) {
        console.error('Settings update error:', error);
        alert('Failed to connect to the server.');
      }
    };
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    };
  
    return (
      <div className="settings-page">
        <h1>설정</h1>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="username">사용자 아이디 (수정 불가능):</label>
            <input
              type="text"
              id="username"
              value="CurrentUser" // Example: Replace with actual username
              readOnly
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
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              placeholder="새 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="profileImage">프로필 이미지:</label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="프로필 미리보기"
                style={{ width: '100px', height: '100px', borderRadius: '50%', marginTop: '10px' }}
              />
            )}
          </div>
          <button type="submit" className="login-button-form">
            저장
          </button>
        </form>
      </div>
    );
  };