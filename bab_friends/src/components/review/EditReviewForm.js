import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";

export const EditReviewForm = ({ review, onCancel, onSuccess }) => {
  const [title, setTitle] = useState(review.title || "");
  const [content, setContent] = useState(review.content || "");
  const [category, setCategory] = useState(review.category || "");
  const [rating, setRating] = useState(review.rating || 5);
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState(review.images || []);
  const [submitting, setSubmitting] = useState(false);

  const [userId, setuserId] = useState(null)
  
    useEffect(() => {
      let a = localStorage.getItem("userId")
      setuserId(a)
    })

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    
    setSubmitting(true);

    try {
      let token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8080/api/review/${review.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": token
        },
        body: JSON.stringify({
          userId,
          title,
          content,
          category,
          rating
        }),
      });

      if (response.ok) {
        const updatedReview = await response.json();
        alert("리뷰가 성공적으로 수정되었습니다!");
        
        // 이미지가 있으면 업로드 (실제 구현은 서버 API에 맞게 조정 필요)
        if (images.length > 0) {
          const formData = new FormData();
          images.forEach(image => {
            formData.append("images", image);
          });
          
          // await fetch(`http://localhost:8080/api/review/${review.id}/images`, {
          //   method: "POST",
          //   body: formData,
          // });
        }
        
        // 서버에서 응답이 없는 경우를 대비해 임시 객체 생성
        const reviewToUpdate = updatedReview || {
          ...review,
          title,
          content,
          category,
          rating,
          updatedAt: new Date().toISOString(),
          // 이미지 처리
          images: [
            ...currentImages,
            ...images.map(img => URL.createObjectURL(img))
          ]
        };
        
        onSuccess(reviewToUpdate);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "리뷰 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 수정 오류:", error);
      // 서버 연결 실패 시에도 UI 업데이트
      const tempUpdatedReview = {
        ...review,
        title,
        content,
        category,
        rating,
        updatedAt: new Date().toISOString(),
        images: [
          ...currentImages,
          ...images.map(img => URL.createObjectURL(img))
        ]
      };
      
      alert("서버 연결에 실패했지만 UI에서 리뷰가 수정되었습니다.");
      onSuccess(tempUpdatedReview);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleRemoveCurrentImage = (index) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  return (
    <Modal title="리뷰 수정" onClose={onCancel}>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="title">제목:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">내용:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">카테고리:</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="rating">평점:</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
        
        {currentImages.length > 0 && (
          <div className="form-group">
            <label>현재 이미지:</label>
            <div style={{ display: "flex", overflowX: "auto", marginTop: "10px" }}>
              {currentImages.map((image, index) => (
                <div key={index} className="image-container" style={{ position: "relative", marginRight: "10px" }}>
                  <img 
                    src={image} 
                    alt={`Current Image ${index + 1}`} 
                    style={{ width: "100px", height: "100px", objectFit: "cover" }} 
                  />
                  <button 
                    type="button" 
                    className="remove-image-button" 
                    onClick={() => handleRemoveCurrentImage(index)}
                    style={{ 
                      position: "absolute", 
                      top: "5px", 
                      right: "5px",
                      background: "rgba(255, 0, 0, 0.7)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer"
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="images">새 사진 추가:</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          
          {images.length > 0 && (
            <div style={{ display: "flex", overflowX: "auto", marginTop: "10px" }}>
              {images.map((image, index) => (
                <img 
                  key={index} 
                  src={URL.createObjectURL(image)} 
                  alt={`New Preview ${index + 1}`} 
                  style={{ width: "100px", marginRight: "10px" }} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="button-group">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
          >
            취소
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={submitting}
          >
            {submitting ? "처리 중..." : "리뷰 수정"}
          </button>
        </div>
      </form>
    </Modal>
  );
};