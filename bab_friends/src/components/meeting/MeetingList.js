// src/components/meeting/MeetingList.js
import React, { useRef, useState, useCallback } from "react";
import MeetingCard from "./MeetingCard";
import MeetingDetail from "./MeetingDetail";

const MeetingList = ({
  meetings,
  onMeetingSelect,
  onLoadMore,
  hasMore,
  loading,
}) => {
  const observer = useRef();
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  const lastMeetingElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, onLoadMore]
  );

  const handleOpenMeeting = (meetingId) => {
    setSelectedMeetingId(meetingId);
    if (onMeetingSelect) onMeetingSelect(meetingId);
  };

  const handleCloseMeeting = () => {
    setSelectedMeetingId(null);
    if (onMeetingSelect) onMeetingSelect(null);
  };

  return (
    <div className="meeting-list">
      {meetings.map((meeting, index) => {
        if (meetings.length === index + 1) {
          return (
            <div ref={lastMeetingElementRef} key={meeting.id}>
              <MeetingCard meeting={meeting} onOpen={handleOpenMeeting} />
            </div>
          );
        } else {
          return (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onOpen={handleOpenMeeting}
            />
          );
        }
      })}
      {loading && <p className="loading-indicator">Loading...</p>}
      {selectedMeetingId && (
        <MeetingDetail
          meetingId={selectedMeetingId}
          onClose={handleCloseMeeting}
        />
      )}
    </div>
  );
};

export default MeetingList;
