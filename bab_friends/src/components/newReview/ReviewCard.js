import React from "react";

export const ReviewCard = ({ review, onClick }) => {
  return (
    <div className="review-card" onClick={onClick}>
      <img src={review.image} alt={review.title} className="review-card-image" />
      <div className="review-card-body">
        <h3>{review.title}</h3>
      </div>
      <div className="review-card-footer">
        작성자: {review.nickname}
      </div>
    </div>
  );
};