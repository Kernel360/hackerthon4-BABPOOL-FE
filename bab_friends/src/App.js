// src/App.js
import "./App.css";
import React, { useEffect, useState } from "react";
import MeetingList from "./components/meeting/MeetingList";
import { Navigation } from "./components/login/login.js";
import CreateMeetingModal from "./components/meeting/CreateMeetingModal";
import { SettingsPage } from "./components/login/SettingsPage.js";
import SetPassword from "./components/login/SetPassword.js";

import { ReviewPage } from "./components/review/ReviewPage.js";
import { CreateReviewModal } from "./components/review/CreateReviewModal.js";
import {
  getAccessToken,
  isAuthenticated,
} from "./components/login/authService.js";

const API_BASE_URL = "http://3.38.71.28:8080/api";


const App = () => {
  const [meetings, setMeetings] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentPage, setCurrentPage] = React.useState("meetings");
  const [isCreateMeetingVisible, setIsCreateMeetingVisible] =
    React.useState(false);
  const [isCreateReviewVisible, setIsCreateReviewVisible] =
    React.useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = React.useState(null);
  const [selectedReviewId, setSelectedReviewId] = React.useState(null);

  // 초기 로딩 시 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);
    return loggedIn;
  };

  useEffect(() => {
    if (currentPage === "meetings") {
      // 페이지 변경 시 상태 초기화
      setMeetings([]);
      setPage(0);
      setHasMore(true);
      fetchMeetings(0, true);
    }
  }, [currentPage]);

  // Add event listener for meeting deletion
  useEffect(() => {
    const handleMeetingDeleted = () => {
      // 모임 삭제 후 목록 새로고침
      if (currentPage === "meetings") {
        setMeetings([]);
        setPage(0);
        setHasMore(true);
        fetchMeetings(0, true);
        setSelectedMeetingId(null); // Close any open meeting detail
      }
    };

    window.addEventListener("meetingDeleted", handleMeetingDeleted);

    return () => {
      window.removeEventListener("meetingDeleted", handleMeetingDeleted);
    };
  }, [currentPage]);

  // 로그인 상태 변경 이벤트 리스너
  useEffect(() => {
    const handleLoginStateChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("loginStateChanged", handleLoginStateChange);

    return () => {
      window.removeEventListener("loginStateChanged", handleLoginStateChange);
    };
  }, []);

  const fetchMeetings = async (pageToFetch = page, isReset = false) => {
    if (loading || (!hasMore && !isReset)) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = token;
      }

      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts?page=${pageToFetch}&size=10`,
        {
          headers: headers,
        }
      );
      const data = await response.json();
      console.log(data);

      if (data.result && data.result.length > 0) {
        // 받아온 데이터를 프론트엔드 형식에 맞게 변환
        const formattedMeetings = data.result.map((meeting) => ({
          id: meeting.postId,
          title: meeting.title,
          location: meeting.location || meeting.restaurantLink, // location이 null일 경우 restaurantLink 사용
          restaurantLink: meeting.restaurantLink,
          date: meeting.meetingDate,
          time: meeting.meetingTime,
          attendees: meeting.currentParticipants,
          limit: meeting.maxParticipants,
          participants: [], // 참여자 목록은 상세 조회에서 가져올 예정
        }));

        // 기존 데이터에 추가 또는 리셋
        setMeetings((prev) =>
          isReset ? formattedMeetings : [...prev, ...formattedMeetings]
        );
        setPage((prevPage) => pageToFetch + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSelect = (reviewId) => {
    setSelectedReviewId(reviewId);
  };

  const handleMeetingSelect = (meetingId) => {
    setSelectedMeetingId(meetingId);
  };

  const handleReviewDetailClose = () => {
    setSelectedReviewId(null);
  };

  const handleMeetingDetailClose = () => {
    setSelectedMeetingId(null);
  };

  const handleReviewCreated = (newReview) => {
    setReviews((prev) => [...prev, newReview]);
  };

  const handleMeetingCreated = (newMeeting) => {
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  // Add handler for meeting updated
  const handleMeetingUpdated = (updatedMeeting) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === updatedMeeting.id ? updatedMeeting : meeting
      )
    );
  };

  const handleCreateMeetingOpen = () => {
    // 로그인 상태 확인 후 모달 열기
    if (checkLoginStatus()) {
      setIsCreateMeetingVisible(true);
    } else {
      alert("로그인이 필요한 서비스입니다.");
      setCurrentPage("login"); // 로그인 페이지로 이동
    }
  };

  const handleCreateMeetingClose = () => {
    setIsCreateMeetingVisible(false);
  };

  const handleCreateReviewOpen = () => {
    // 로그인 상태 확인 후 모달 열기
    if (checkLoginStatus()) {
      setIsCreateReviewVisible(true);
    } else {
      alert("로그인이 필요한 서비스입니다.");
      setCurrentPage("login"); // 로그인 페이지로 이동
    }
  };

  const handleCreateReviewClose = () => {
    setIsCreateReviewVisible(false);
  };

  const handleFloatingButtonClick = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      setCurrentPage("login");
      return;
    }

    if (currentPage === "meetings") {
      handleCreateMeetingOpen();
    } else if (currentPage === "reviews") {
      handleCreateReviewOpen();
    }
  };

  const renderPage = () => {
    if (currentPage === "meetings") {
      return (
        <div>
          <h1 style={{ textAlign: "center" }}>밥 친구 모임</h1>
          <MeetingList
            meetings={meetings}
            onMeetingSelect={handleMeetingSelect}
            onLoadMore={() => fetchMeetings()}
            hasMore={hasMore}
            loading={loading}
            isLoggedIn={isLoggedIn}
          />
        </div>
      );
    } else if (currentPage === "reviews") {
      return (
        <ReviewPage
          onReviewSelect={handleReviewSelect}
          reviews={reviews}
          setReviews={setReviews}
          isLoggedIn={isLoggedIn}
        />
      );
    } else if (currentPage === "settings") {
      // 설정 페이지는 로그인 필요
      return isLoggedIn ? (
        <SettingsPage />
      ) : (
        <div className="login-required-message">
          <h2>로그인이 필요한 서비스입니다.</h2>
          <button onClick={() => setCurrentPage("login")}>로그인 하기</button>
        </div>
      );
    } else if (currentPage === "password") {
      // 비밀번호 설정 페이지는 로그인 필요
      return isLoggedIn ? (
        <SetPassword />
      ) : (
        <div className="login-required-message">
          <h2>로그인이 필요한 서비스입니다.</h2>
          <button onClick={() => setCurrentPage("login")}>로그인 하기</button>
        </div>
      );
    } else if (currentPage === "login") {
      // 여기에 로그인 컴포넌트를 렌더링하는 코드 추가
      // Navigation 컴포넌트에 로그인 기능이 있다면 해당 컴포넌트에 적절한 prop을 전달하여 로그인 화면을 표시
      return (
        <div className="login-page">
          <h1>로그인</h1>
          {/* 여기에 로그인 폼이나 관련 컴포넌트를 추가 */}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Navigation
        setPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        onLoginStateChange={checkLoginStatus}
      />
      {renderPage()}
      <button className="floating-button" onClick={handleFloatingButtonClick}>
        +
      </button>

      {isCreateMeetingVisible && (
        <CreateMeetingModal
          onClose={handleCreateMeetingClose}
          onMeetingCreated={handleMeetingCreated}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {isCreateReviewVisible && (
        <CreateReviewModal
          onClose={handleCreateReviewClose}
          onReviewCreated={handleReviewCreated}
        />
      )}
    </div>
  );
};

export default App;
