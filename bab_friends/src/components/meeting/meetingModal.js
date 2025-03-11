import React from "react";

export const CreateMeetingModal = ({ onClose, setMeetings, meetings }) => {
    const [location, setLocation] = React.useState('');
    const [date, setDate] = React.useState('');
    const [time, setTime] = React.useState('');
    const [limit, setLimit] = React.useState('');
    const [title, setTitle] = React.useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const newMeeting = {
        user: 'CurrentUser', 
        location: location,
        date: date,
        time: time,
        participants: [],
        attendees: 0,
        limit: parseInt(limit),
        title: title
      };
  
      try {
        const response = await fetch('/api/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMeeting),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setMeetings([...meetings, data]);
          onClose();
        } else {
          alert(data.message || '모임 생성에 실패했습니다.');
        }
      } catch (error) {
        console.error('Meeting creation error:', error);
        alert('Failed to connect to the server.');
      }
    };
  
    return (
      <div className="meeting-detail-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
        <div className="meeting-detail">
          <div className="meeting-detail-header">
            <h2>모임 만들기</h2>
            <button className="close-button" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <div className="meeting-detail-body">
            <form onSubmit={handleSubmit} className="signup-form">
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
                <label htmlFor="location">장소:</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">날짜:</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">시간:</label>
                <input
                  type="time"
                  id="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="limit">제한 인원:</label>
                <input
                  type="number"
                  id="limit"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button-form">만들기</button>
            </form>
          </div>
        </div>
      </div>
    );
  };