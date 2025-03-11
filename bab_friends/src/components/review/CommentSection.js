import React, { useState, useEffect } from "react";

export const CommentSection = ({ reviewId }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const [userId, setuserId] = useState(null)

  useEffect(() => {
    let a = localStorage.getItem("userId")
    setuserId(a)
  })

  useEffect(() => {
    const fetchComments = async () => {
      if (!reviewId) return;
      
      try {
        setLoading(true);
      let token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8080/api/review/${reviewId}/comment`,
          {headers: {
            "Authorization": token
          }}
        );
        const data = await response.json();
        
        if (response.ok) {
          setComments(data);
        } else {
          setError("댓글을 불러오는데 실패했습니다.");
          console.error("댓글 로딩 실패:", data.message);
        }
      } catch (error) {
        setError("서버 연결에 실패했습니다.");
        console.error("댓글 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [reviewId]);

  const handleCommentSubmit = async () => {
    if (comment.trim() === "") return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/review/${reviewId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId, // 실제 로그인된 사용자 ID로 변경 필요
          content: comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 서버에서 반환한 새 댓글 객체 사용
        setComments([...comments, data]);
        setComment("");
      } else {
        alert(data.message || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      // 서버 연결 실패 시 임시 댓글 추가
      const tempComment = {
        id: Date.now(),
        userId,
        username: "현재 사용자", // 실제 사용자 이름으로 변경 필요
        content: comment,
        text: comment,
        createdAt: new Date().toISOString()
      };
      setComments([...comments, tempComment]);
      setComment("");
      alert("서버 연결에 실패했지만 UI에 댓글이 추가되었습니다.");
    }
  };

  const handleEditClick = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const handleEditSubmit = async (commentId) => {
    if (editedCommentText.trim() === "") return;

    try {
      const response = await fetch(`http://localhost:8080/api/review/${reviewId}/comment/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          content: editedCommentText,
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(comments.map(c => c.id === commentId ? updatedComment : c));
        setEditingCommentId(null);
        setEditedCommentText("");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 수정 오류:", error);
      // 서버 연결 실패 시에도 UI에서 수정
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return { 
            ...c, 
            content: editedCommentText,
            text: editedCommentText 
          };
        }
        return c;
      }));
      setEditingCommentId(null);
      setEditedCommentText("");
      alert("서버 연결에 실패했지만 UI에서 댓글이 수정되었습니다.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/review/${reviewId}/comment/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        const errorData = await response.json();
        alert(errorData.message || "댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      // 서버 연결 실패 시에도 UI에서 삭제
      setComments(comments.filter(c => c.id !== commentId));
      alert("서버 연결에 실패했지만 UI에서 댓글이 삭제되었습니다.");
    }
  };

  return (
    <div className="comments-section">
      <h4>댓글</h4>
      
      {loading ? (
        <p>댓글을 불러오는 중...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="comments-list">
          {comments.length === 0 ? (
            <p>작성된 댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                {editingCommentId === comment.id ? (
                  <div className="edit-comment-form">
                    <textarea
                      value={editedCommentText}
                      onChange={(e) => setEditedCommentText(e.target.value)}
                      className="edit-comment-textarea"
                    />
                    <div className="edit-comment-buttons">
                      <button onClick={() => handleEditSubmit(comment.id)}>저장</button>
                      <button onClick={handleEditCancel}>취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-content">
                      <strong>{comment.nickname}:</strong>{" "}
                      {comment.content}
                    </div>
                    <div className="comment-actions">
                      <button 
                        className="edit-comment-button"
                        onClick={() => handleEditClick(comment.id, comment.text || comment.content)}
                      >
                        수정
                      </button>
                      <button 
                        className="delete-comment-button"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
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
  );
};