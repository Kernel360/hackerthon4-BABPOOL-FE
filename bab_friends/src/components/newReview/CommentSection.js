import React, { useState, useEffect } from "react";

export const CommentSection = ({ reviewId }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!reviewId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/review/${reviewId}/comment`);
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
          userId: 1, // 실제 로그인된 사용자 ID로 변경 필요
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
      alert("서버 연결에 실패했습니다.");
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
                <strong>{comment.nickname}:</strong>{" "}
                {comment.content}
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
