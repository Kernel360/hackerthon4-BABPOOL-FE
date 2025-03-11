import React from "react";

export const Navigation = ({ setPage }) => {
  // 로그인 상태를 관리하는 state
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const [loginModalVisible, setLoginModalVisible] = React.useState(false);
  const [signupModalVisible, setSignupModalVisible] = React.useState(false);

  const handleLoginClick = () => {
    setLoginModalVisible(true);
  };

  const handleCloseLoginModal = () => {
    setLoginModalVisible(false);
  };

  const handleCloseSignupModal = () => {
    setSignupModalVisible(false);
  };

  const handleUserButtonClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setDropdownVisible(false);
  };

  return (
    <nav className="navbar">
      <span className="site-title">밥친구</span>
      <div className="nav-links">
        <a href="#" onClick={() => setPage('meetings')}>모임 게시판</a>
        <a href="#" onClick={() => setPage('reviews')}>리뷰 게시판</a>
      </div>
      {isLoggedIn ? (
        <div className="user-menu">
          <button className="user-button" onClick={handleUserButtonClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4ZM12 14C9.32686 14 4 15.3431 4 18V20H20V18C20 15.3431 14.6731 14 12 14Z" fill="currentColor" />
            </svg>
          </button>
          {dropdownVisible && (
            <div className="dropdown-menu">
              <a href="#" onClick={() => setPage('settings')}>설정</a>
              <a href="#" onClick={handleLogout}>로그아웃</a>
              <a href="#">탈퇴</a>
            </div>
          )}
        </div>
      ) : (
        <React.Fragment>
          <button className="login-button" onClick={handleLoginClick}>로그인</button>
          {loginModalVisible && (
            <LoginModal onClose={handleCloseLoginModal} setIsLoggedIn={setIsLoggedIn} setSignupModalVisible={setSignupModalVisible} />
          )}
          {signupModalVisible && (
            <SignupModal onClose={handleCloseSignupModal} setLoginModalVisible={setLoginModalVisible} />
          )}
        </React.Fragment>
      )}
    </nav>
  );
};

const LoginModal = ({ onClose, setIsLoggedIn, setSignupModalVisible }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        onClose();
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to connect to the server.');
    }
  };

  const handleSignupClick = () => {
    setSignupModalVisible(true);
    onClose();
  };

  return (
    <div className="login-modal" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="login-modal-content">
        <button className="close-button-login" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
          </svg>
        </button>
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">아이디:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button-form">로그인</button>
        </form>
        <a
          href="#"
          className="auth-toggle-link"
          onClick={() => {
            setSignupModalVisible(true);
            onClose();
          }}
        >
          회원가입
        </a>
      </div>
    </div>
  );
};

const SignupModal = ({ onClose, setLoginModalVisible }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('회원가입 성공!');
        onClose();
      } else {
        alert(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to connect to the server.');
    }
  };

  const handleLoginClick = () => {
    setLoginModalVisible(true);
    onClose();
  };

  return (
    <div className="signup-modal" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="signup-modal-content">
        <button className="close-button-login" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
          </svg>
        </button>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username">아이디:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button-form">가입하기</button>
        </form>
        <a
          href="#"
          className="auth-toggle-link"
          onClick={handleLoginClick}
        >
          로그인
        </a>
      </div>
    </div>
  );
};
