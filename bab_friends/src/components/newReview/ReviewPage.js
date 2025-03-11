import React, { useState, useEffect } from "react";
import { ReviewList } from "./ReviewList";
import { ReviewDetailPage } from "./ReviewDetailPage";

export const ReviewPage = ({onReviewSelect, reviews, setReviews}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/review");
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
          console.log(data)
        } else {
          const errorData = await response.json();
          setError(errorData.message || "리뷰를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        setError("서버 연결에 실패했습니다.");
        console.error("리뷰 목록 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  const handleReviewSelect = (reviewId) => {
    setSelectedReviewId(reviewId);
    if(onReviewSelect) {
      onReviewSelect(reviewId)
    }
  };

  const handleCloseReview = () => {
    setSelectedReviewId(null);
  };

  const handleReviewCreated = (newReview) => {
    setReviews([...reviews, newReview]);
  };

  return (
    <div id="review-root">
      <h1>리뷰 게시판</h1>
      
      {loading ? (
        <p className="loading">리뷰를 불러오는 중...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ReviewList reviews={reviews} onReviewSelect={handleReviewSelect} />
      )}
      
      {selectedReviewId && (
        <ReviewDetailPage reviewId={selectedReviewId} onClose={handleCloseReview} />
      )}
    </div>
  );
};