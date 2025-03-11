import React from "react";
import { CommentSection } from "./CommentSection";
import { Modal } from "./Modal";
import { EditReviewForm } from "./EditReviewForm";
import { ChatPage } from "../chat/ChatPage";

export const ReviewDetail = ({ review, onClose, onReviewUpdate, onReviewDelete }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!review) return null;

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const handleConfirmDelete = async () => {
    try {
      let token = localStorage.getItem("token")

      const response = await fetch(`http://localhost:8080/api/review/${review.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": token
        }
      });

      if (response.ok) {
        alert("리뷰가 삭제되었습니다.");
        onReviewDelete(review.id);
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "리뷰 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      // 서버 연결 실패 시에도 UI에서 삭제 처리
      alert("서버 연결에 실패했지만 UI에서 리뷰가 삭제되었습니다.");
      onReviewDelete(review.id);
      onClose();
    }
  };

  if (isEditing) {
    return (
      <EditReviewForm 
        review={review} 
        onCancel={handleCancelEdit} 
        onSuccess={(updatedReview) => {
          onReviewUpdate(updatedReview);
          setIsEditing(false);
        }} 
      />
    );
  }

  if (confirmDelete) {
    return (
      <Modal title="리뷰 삭제 확인" onClose={handleCancelDelete}>
        <div className="confirm-delete">
          <p>정말로 이 리뷰를 삭제하시겠습니까?</p>
          <p>이 작업은 되돌릴 수 없습니다.</p>
          <div className="button-group">
            <button className="cancel-button" onClick={handleCancelDelete}>취소</button>
            <button className="delete-button" onClick={handleConfirmDelete}>삭제</button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={review.title} onClose={onClose}>
      <div className="review-content">
        <div className="review-header">
          <p><strong>작성자:</strong> {review.nickname}</p>
          <div className="review-actions">
            <button className="edit-button" onClick={handleEditClick}>수정</button>
            <button className="delete-button" onClick={handleDeleteClick}>삭제</button>
          </div>
        </div>
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