// src/components/meeting/MeetingCard.js
import React from "react";

const MeetingCard = ({ meeting, onOpen }) => {
  return (
    <div className="meeting-card">
      <div className="meeting-card-header">{meeting.title}</div>
      <div className="meeting-card-body">
        <p>
          <strong>장소:</strong> {meeting.location || meeting.restaurantLink}
        </p>
        <p>
          <strong>날짜:</strong> {meeting.date}
        </p>
        <p>
          <strong>시간:</strong> {meeting.time}
        </p>
        <p>
          <strong>참석인원:</strong> {meeting.attendees} / {meeting.limit}
        </p>
      </div>
      <div className="meeting-card-footer">
        <button onClick={() => onOpen(meeting.id)}>상세보기</button>
      </div>
    </div>
  );
};

export default MeetingCard;
