import React, { useState } from "react";
import { Modal } from "./Modal";
import { getAccessToken } from "../login/authService";

const API_BASE_URL = "http://3.38.71.28:8080/api";

export const CreateReviewModal = ({ onClose, onReviewCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append(
        "dto",
        new Blob(
          [
            JSON.stringify({
              userId: 1,
              title,
              content,
              category,
              rating,
            }),
          ],
          {type : 'application/json'}
        )
      )

      images.forEach((image) => {
        formData.append("file", image)
      })

      const response = await fetch(`http://${API_BASE_URL}/api/review`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: getAccessToken()
        }
      });

      if (response.ok) {
        const newReview = await response.json();
        alert("리뷰가 성공적으로 작성되었습니다!");
        
        if (onReviewCreated) {
          onReviewCreated(newReview);
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "리뷰 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("리뷰 작성 오류:", error);
      alert("서버 연결에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  return (
    <Modal title="리뷰 작성" onClose={onClose}>
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
        
        <div className="form-group">
          <label htmlFor="images">사진:</label>
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
                  alt={`Preview ${index + 1}`} 
                  style={{ width: "100px", marginRight: "10px" }} 
                />
              ))}
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={submitting}
        >
          {submitting ? "처리 중..." : "리뷰 작성"}
        </button>
      </form>
    </Modal>
  );
};