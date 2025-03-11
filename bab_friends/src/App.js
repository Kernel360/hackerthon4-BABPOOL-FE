import "./App.css";
import React, { useEffect } from "react";
import { MeetingList } from "./components/meeting/meeting.js";
import { Navigation } from "./components/login/login.js";
import { CreateMeetingModal } from "./components/meeting/meetingModal.js";
import { SettingsPage } from "./components/login/SettingsPage.js";

import { ReviewPage } from "./components/review/ReviewPage.js";
import { CreateReviewModal } from "./components/review/CreateReviewModal.js";
import { getAccessToken } from "./components/login/authService.js";

const API_BASE_URL = "http://localhost:8080/api";

const App = () => {
  const [meetings, setMeetings] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(0);

  const [currentPage, setCurrentPage] = React.useState("meetings");
  const [isCreateMeetingVisible, setIsCreateMeetingVisible] =
    React.useState(false);
  const [isCreateReviewVisible, setIsCreateReviewVisible] =
    React.useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = React.useState(null);
  const [selectedReviewId, setSelectedReviewId] = React.useState(null);

  useEffect(() => {
    if (currentPage === "meetings") {
      // 페이지 변경 시 상태 초기화
      setMeetings([]);
      setPage(0);
      setHasMore(true);
      fetchMeetings(0, true);
    }
  }, [currentPage]);

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
          location: meeting.location,
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

  const handleCreateMeetingOpen = () => {
    setIsCreateMeetingVisible(true);
  };

  const handleCreateMeetingClose = () => {
    setIsCreateMeetingVisible(false);
  };

  const handleCreateReviewOpen = () => {
    setIsCreateReviewVisible(true);
  };

  const handleCreateReviewClose = () => {
    setIsCreateReviewVisible(false);
  };

  const handleFloatingButtonClick = () => {
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
          />
        </div>
      );
    } else if (currentPage === "reviews") {
      return (
        <ReviewPage
          onReviewSelect={handleReviewSelect}
          reviews={reviews}
          setReviews={setReviews}
        />
      );
    } else if (currentPage === "settings") {
      return <SettingsPage />;
    }
    return null;
  };

  return (
    <div>
      <Navigation setPage={setCurrentPage} />
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
