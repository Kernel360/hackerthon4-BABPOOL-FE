import React from "react";
import { ReviewCard } from "./ReviewCard";

export const ReviewList = ({ reviews, onReviewSelect }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="no-reviews">작성된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="review-list">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} onClick={() => onReviewSelect(review.id)} />
      ))}
    </div>
  );
};