import React, { useEffect, useState } from "react";
import { ReviewDetail } from "./ReviewDetail";

export const ReviewDetailPage = ({ reviewId, onClose, onReviewUpdate, onReviewDelete }) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      if (!reviewId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/review/${reviewId}`);
        
        if (response.ok) {
          const data = await response.json();
          setReview(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "리뷰를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        setError("서버 연결에 실패했습니다.");
        console.error("리뷰 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  const handleReviewUpdate = (updatedReview) => {
    setReview(updatedReview);
    if (onReviewUpdate) {
      onReviewUpdate(updatedReview);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-body">
            <p className="loading">리뷰를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>오류</h2>
            <button className="close-button" onClick={onClose}>X</button>
          </div>
          <div className="modal-body">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return <ReviewDetail 
  review={review} 
  onClose={onClose} 
  onReviewUpdate={handleReviewUpdate}
  onReviewDelete={onReviewDelete}
  />;
};