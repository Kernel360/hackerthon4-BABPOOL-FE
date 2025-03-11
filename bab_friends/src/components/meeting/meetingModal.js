import React, { useState } from "react";
import { getAccessToken } from "../login/authService.js";

export const CreateMeetingModal = ({
  onClose,
  onMeetingCreated,
  apiBaseUrl,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    location: "",
    restaurantLink: "",
    maxParticipants: 10,
    meetingDate: "",
    meetingTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "maxParticipants" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiBaseUrl}/recruitment-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // API 응답에서 생성된 모임 ID 가져오기
        const createdPostId = data.result?.postId || Date.now(); // API 응답에 postId가 없으면 임시 ID 사용

        // 프론트엔드에서 사용할 형식으로 데이터 변환
        const newMeeting = {
          id: createdPostId,
          title: formData.title,
          location: formData.location || formData.restaurantLink,
          restaurantLink: formData.restaurantLink,
          date: formData.meetingDate,
          time: formData.meetingTime,
          limit: formData.maxParticipants,
          attendees: 1, // 모임 생성자는 기본적으로 참여
          content: formData.content,
          category: formData.category,
          isAuthor: true, // 본인이 작성한 모임이므로 isAuthor = true
          leaderNickname: "CurrentUser", // 실제로는 서버에서 닉네임 정보를 받아와야 함
        };

        if (onMeetingCreated) {
          onMeetingCreated(newMeeting);
        }
        onClose();
      } else {
        setError(data.message || "모임 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Meeting creation error:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="meeting-detail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="meeting-detail">
        <div className="meeting-detail-header">
          <h2>모임 만들기</h2>
          <button className="close-button" onClick={onClose} disabled={loading}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="meeting-detail-body">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label htmlFor="title">제목:</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">내용:</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">카테고리:</label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">장소:</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="restaurantLink">식당 링크:</label>
              <input
                type="text"
                id="restaurantLink"
                value={formData.restaurantLink}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="meetingDate">날짜:</label>
              <input
                type="date"
                id="meetingDate"
                value={formData.meetingDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="meetingTime">시간:</label>
              <input
                type="time"
                id="meetingTime"
                value={formData.meetingTime}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxParticipants">제한 인원:</label>
              <input
                type="number"
                id="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                required
                min="2"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="login-button-form"
              disabled={loading}
            >
              {loading ? "생성 중..." : "만들기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
