import React from "react";
import { CommentSection } from "./CommentSection";
import { Modal } from "./Modal";

export const ReviewDetail = ({ review, onClose }) => {
  if (!review) return null;

  return (
    <Modal title={review.title} onClose={onClose}>
      <div className="review-content">
        <p><strong>작성자:</strong> {review.author}</p>
        <p><strong>내용:</strong> {review.content}</p>
        <p><strong>평점:</strong> {review.rating}</p>
        
        {review.images && review.images.length > 0 && (
          <div className="review-images">
            <strong>사진:</strong>
            <div style={{ display: "flex", overflowX: "auto" }}>
              {review.images.map((image, index) => (
                <img 
                  key={index} 
                  src={image} 
                  alt={`Review Image ${index + 1}`} 
                  style={{ maxWidth: "200px", maxHeight: "200px", marginRight: "10px" }} 
                />
              ))}
            </div>
          </div>
        )}
        
        <p><strong>작성일시:</strong> {review.createdAt}</p>
        <p><strong>수정일시:</strong> {review.updatedAt}</p>
        
        {review.restaurantLink && (
          <p>
            <strong>식당 링크:</strong>{" "}
            <a href={review.restaurantLink} target="_blank" rel="noopener noreferrer">
              바로가기
            </a>
          </p>
        )}
      </div>
      
      <CommentSection reviewId={review.id} />
    </Modal>
  );
};