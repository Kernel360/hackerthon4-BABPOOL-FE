import React, { useState, useEffect } from "react";
import { ReviewList } from "./ReviewList";
import { ReviewDetailPage } from "./ReviewDetailPage";
import { getAccessToken } from "../login/authService";

const API_BASE_URL = "http://3.38.71.28:8080/api";

export const ReviewPage = ({onReviewSelect, reviews, setReviews}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        console.log(localStorage.getItem("token"))
        const response = await fetch("http://localhost:8080/api/review", {
          headers: {
            Authorization: getAccessToken()
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data);

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

  const handleReviewUpdate = (updatedReview) => {
    setReviews(reviews.map(review => 
      review.id === updatedReview.id ? updatedReview : review
    ));
  };

  const handleReviewCreated = (newReview) => {
    setReviews([...reviews, newReview]);
  };

  const handleReviewDelete = (reviewId) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
  };

  return (
    <div id="review-root">
      <h1 className="page-title">리뷰 게시판</h1>
      
      {loading ? (
        <p className="loading">리뷰를 불러오는 중...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ReviewList reviews={reviews} onReviewSelect={handleReviewSelect} />
      )}
      
      {selectedReviewId && (
        <ReviewDetailPage 
        reviewId={selectedReviewId} 
        onClose={handleCloseReview} 
        onReviewUpdate={handleReviewUpdate}
        onReviewDelete={handleReviewDelete}
        />
      )}
    </div>
  );
};