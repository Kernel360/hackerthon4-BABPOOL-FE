import React, { useEffect, useState, useRef, useCallback } from "react";
import { getAccessToken } from "../login/authService.js";

const API_BASE_URL = "http://localhost:8080/api";

const MeetingDetail = ({ meetingId, onClose }) => {
  const [meeting, setMeeting] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isAttending, setIsAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchMeetingDetail();
    fetchComments();
    checkParticipationStatus();
  }, [meetingId]);

  const fetchMeetingDetail = async () => {
    try {
      const token = getAccessToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = token;
      }

      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts/${meetingId}`,
        {
          headers: headers,
        }
      );
      const data = await response.json();
      if (data.statusCode === 201 && data.result) {
        setMeeting(data.result);
      } else {
        console.error("Failed to fetch meeting details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching meeting detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (loadingComments || !hasMoreComments) return;

    setLoadingComments(true);
    try {
      const token = getAccessToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = token;
      }

      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts/${meetingId}/comments?page=${commentsPage}&size=10`,
        {
          headers: headers,
        }
      );
      const data = await response.json();

      if (data.statusCode === 201 && data.result && data.result.content) {
        const newComments = data.result.content.map((comment) => ({
          id: comment.commentId,
          text: comment.content,
          user: comment.nickname,
        }));

        setComments((prev) => [...prev, ...newComments]);
        setCommentsPage((prevPage) => prevPage + 1);
        setHasMoreComments(!data.result.last);
      } else {
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const checkParticipationStatus = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        // 로그인이 되어있지 않으면 참여 상태 확인 불가
        return;
      }

      // 이 API는 예시 명세에는 없지만, 참여 상태를 확인하는 API가 있다고 가정합니다.
      // 실제 구현 시에는 백엔드 API에 맞게 조정해야 합니다.
      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts/${meetingId}/participants/status`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsAttending(data.isParticipating || false);
      }
    } catch (error) {
      console.error("Error checking participation status:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() !== "") {
      try {
        const token = getAccessToken();
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/recruitment-posts/${meetingId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({
              content: comment,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          // 댓글이 성공적으로 작성되면 댓글 목록을 새로고침
          setCommentsPage(0);
          setComments([]);
          setHasMoreComments(true);
          fetchComments();
          setComment("");
        } else {
          alert(data.message || "댓글 작성에 실패했습니다.");
        }
      } catch (error) {
        console.error("Comment submission error:", error);
        alert("Failed to connect to the server.");
      }
    }
  };

  const handleAttendance = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      let response;
      if (!isAttending) {
        // 모임 참가 신청
        response = await fetch(
          `${API_BASE_URL}/recruitment-posts/${meetingId}/participants`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
      } else {
        // 모임 참가 취소
        response = await fetch(
          `${API_BASE_URL}/recruitment-posts/${meetingId}/participants`,
          {
            method: "DELETE",
            headers: {
              Authorization: token,
            },
          }
        );
      }

      if (response.ok) {
        setIsAttending(!isAttending);
        // 미팅 정보 갱신 (참가자 수 변경)
        fetchMeetingDetail();
      } else {
        const data = await response.json();
        alert(data.message || "참석 여부 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Attendance update error:", error);
      alert("Failed to connect to the server.");
    }
  };

  if (loading) {
    return (
      <div className="meeting-detail-overlay">
        <div className="meeting-detail">
          <div className="meeting-detail-body">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="meeting-detail-overlay">
        <div className="meeting-detail">
          <div className="meeting-detail-body">
            <p>Meeting not found.</p>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2>{meeting.title}</h2>
          <button className="close-button" onClick={onClose}>
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
          <div className="meeting-description">
            <p>
              <strong>주최자:</strong> {meeting.leaderNickname}
            </p>
            <p>
              <strong>장소:</strong> {meeting.location || "위치 정보 없음"}
            </p>
            <p>
              <strong>식당 링크:</strong>{" "}
              <a
                href={meeting.restaurantLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {meeting.restaurantLink}
              </a>
            </p>
            <p>
              <strong>카테고리:</strong> {meeting.category}
            </p>
            <p>
              <strong>내용:</strong> {meeting.content}
            </p>
          </div>
          <div className="meeting-actions">
            <div className="attendance-info">
              <p>
                <strong>참석인원:</strong> {meeting.currentParticipants} /{" "}
                {meeting.maxParticipants}
              </p>
              {meeting.leaderNickname !== "CurrentUser" && (
                <button
                  onClick={handleAttendance}
                  className={isAttending ? "cancel-button" : "attend-button"}
                >
                  {isAttending ? "참가 취소" : "참가 신청"}
                </button>
              )}
            </div>
          </div>
          <div className="comments-section">
            <h4>댓글</h4>
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <strong>{comment.user}:</strong> {comment.text}
                </div>
              ))}
              {loadingComments && <p>댓글 로딩 중...</p>}
              {hasMoreComments && !loadingComments && (
                <button onClick={fetchComments} className="load-more-button">
                  댓글 더 보기
                </button>
              )}
            </div>
            <div className="comment-input">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button onClick={handleCommentSubmit}>댓글 작성</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingCard = ({ meeting, onOpen }) => {
  return (
    <div className="meeting-card">
      <div className="meeting-card-header">{meeting.title}</div>
      <div className="meeting-card-body">
        <p>
          <strong>장소:</strong> {meeting.location || meeting.restaurantLink}
        </p>
        <p>
          <strong>날짜:</strong> {meeting.date}
        </p>
        <p>
          <strong>시간:</strong> {meeting.time}
        </p>
        <p>
          <strong>참석인원:</strong> {meeting.attendees} / {meeting.limit}
        </p>
      </div>
      <div className="meeting-card-footer">
        <button onClick={() => onOpen(meeting.id)}>상세보기</button>
      </div>
    </div>
  );
};

export const MeetingList = ({
  meetings,
  onMeetingSelect,
  onLoadMore,
  hasMore,
  loading,
}) => {
  const observer = useRef();
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  const lastMeetingElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  const handleOpenMeeting = (meetingId) => {
    setSelectedMeetingId(meetingId);
    if (onMeetingSelect) onMeetingSelect(meetingId);
  };

  const handleCloseMeeting = () => {
    setSelectedMeetingId(null);
    if (onMeetingSelect) onMeetingSelect(null);
  };

  return (
    <div className="meeting-list">
      {meetings.map((meeting, index) => {
        if (meetings.length === index + 1) {
          return (
            <div ref={lastMeetingElementRef} key={meeting.id}>
              <MeetingCard meeting={meeting} onOpen={handleOpenMeeting} />
            </div>
          );
        } else {
          return (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onOpen={handleOpenMeeting}
            />
          );
        }
      })}
      {loading && <p className="loading-indicator">Loading...</p>}
      {selectedMeetingId && (
        <MeetingDetail
          meetingId={selectedMeetingId}
          onClose={handleCloseMeeting}
        />
      )}
    </div>
  );
};
