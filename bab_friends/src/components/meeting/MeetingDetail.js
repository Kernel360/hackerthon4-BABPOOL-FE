// src/components/meeting/MeetingDetail.js
import React, { useEffect, useState } from "react";
import { getAccessToken } from "../login/authService.js";
import EditMeetingModal from "./EditMeetingModal";

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCommentEditModalVisible, setIsCommentEditModalVisible] =
    useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

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
          isAuthor: comment.isAuthor,
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
        return;
      }

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

  // New function to handle comment edit
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditedCommentText(comment.text);
    setIsCommentEditModalVisible(true);
  };

  // New function to submit edited comment
  const handleCommentEditSubmit = async () => {
    if (editedCommentText.trim() === "") {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts/${meetingId}/comments/${editingComment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            content: editedCommentText,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update the comment in the local state
        setComments(
          comments.map((c) =>
            c.id === editingComment.id ? { ...c, text: editedCommentText } : c
          )
        );
        setIsCommentEditModalVisible(false);
      } else {
        alert(data.message || "댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Comment edit error:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  // New function to delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts/${meetingId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        // Remove the comment from the local state
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        const data = await response.json();
        alert(data.message || "댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Comment deletion error:", error);
      alert("서버 연결에 실패했습니다.");
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

  const handleDelete = async () => {
    if (!window.confirm("모임을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/recruitment-posts/${meetingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        alert("모임이 삭제되었습니다.");
        onClose();
        window.dispatchEvent(new CustomEvent("meetingDeleted"));
      } else {
        const data = await response.json();
        alert(data.message || "모임 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Meeting deletion error:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
  };

  const handleMeetingUpdated = (updatedMeeting) => {
    setMeeting({
      ...meeting,
      ...updatedMeeting,
    });
    setIsEditModalVisible(false);
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
          <div className="header-actions">
            {/* 모임 작성자일 때만 수정/삭제 버튼 표시 */}
            {meeting.isAuthor && (
              <>
                <button
                  onClick={handleOpenEditModal}
                  className="header-action-button edit-meeting-button"
                  title="모임 수정"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="header-action-button delete-meeting-button"
                  title="모임 삭제"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </>
            )}
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
              {!meeting.isAuthor && (
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
                  <div className="comment-content">
                    <strong>
                      {comment.user}
                      {comment.isAuthor && (
                        <span className="author-badge"> (작성자)</span>
                      )}
                      :
                    </strong>{" "}
                    {comment.text}
                  </div>
                  <div className="comment-actions">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="edit-comment-button"
                      title="수정"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-comment-button"
                      title="삭제"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
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

      {/* 모임 수정 모달 */}
      {isEditModalVisible && (
        <EditMeetingModal
          meeting={meeting}
          onClose={handleCloseEditModal}
          onMeetingUpdated={handleMeetingUpdated}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {/* 댓글 수정 모달 */}
      {isCommentEditModalVisible && (
        <div
          className="comment-edit-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCommentEditModalVisible(false);
            }
          }}
        >
          <div className="comment-edit-modal">
            <div className="comment-edit-modal-header">
              <h3>댓글 수정</h3>
              <button
                className="close-button"
                onClick={() => setIsCommentEditModalVisible(false)}
              >
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
            <div className="comment-edit-modal-body">
              <textarea
                value={editedCommentText}
                onChange={(e) => setEditedCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
              />
              <div className="comment-edit-modal-actions">
                <button
                  onClick={() => setIsCommentEditModalVisible(false)}
                  className="cancel-button"
                >
                  취소
                </button>
                <button
                  onClick={handleCommentEditSubmit}
                  className="save-button"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingDetail;
