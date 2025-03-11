import React from "react";

const MeetingDetail = ({ meeting, onClose }) => {
  const [comment, setComment] = React.useState('');
  const [comments, setComments] = React.useState([
    { id: 1, text: '오늘 저녁 7시 잊지 마세요!', user: 'Alice' },
    { id: 2, text: '저는 30분 정도 늦을 것 같아요.', user: 'Bob' },
    { id: 3, text: '주차 공간이 협소하니 대중교통 이용 부탁드립니다.', user: 'Charlie' }
  ]);
  const [isAttending, setIsAttending] = React.useState(false);

  const handleCommentSubmit = async () => {
    if (comment.trim() !== '') {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meetingId: meeting.id,
            text: comment,
            user: 'CurrentUser', // 실제 사용자 정보 사용
          }),
        });

        const data = await response.json();

        if (response.ok) {
          const newComment = {
            id: comments.length + 1,
            text: comment,
            user: 'CurrentUser'
          };
          setComments([...comments, newComment]);
          setComment('');
        } else {
          alert(data.message || '댓글 작성에 실패했습니다.');
        }
      } catch (error) {
        console.error('Comment submission error:', error);
        alert('Failed to connect to the server.');
      }
    }
  };

  const handleAttendance = async () => {
    const newAttendance = !isAttending;
    try {
      const response = await fetch(`/api/meetings/${meeting.id}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attending: newAttendance }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAttending(newAttendance);
        console.log(`Attendance toggled to: ${newAttendance}`);
      } else {
        alert(data.message || '참석 여부 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Attendance update error:', error);
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
          <h2>{meeting.title}</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div className="meeting-detail-body">
          <div className="meeting-description">
            <p><strong>유저:</strong> {meeting.user}</p>
            <p><strong>장소:</strong> {meeting.location}</p>
            <p><strong>날짜:</strong> {meeting.date}</p>
            <p><strong>시간:</strong> {meeting.time}</p>
          </div>
          <div className="meeting-actions">
            <div className="attendance-info">
              <p><strong>참석인원:</strong> {meeting.attendees} / {meeting.limit}</p>
              {meeting.user !== 'CurrentUser' && (
                <button onClick={handleAttendance}>
                  {isAttending ? 'cancel' : 'Attend'}
                </button>
              )}
            </div>
            <div className="participants-section">
              <h4>참여자:</h4>
              <ul className="participants-list">
                {meeting.participants.map((participant) => (
                  <li key={participant} className="participant-item">
                    <img src={`https://i.pravatar.cc/30?u=${participant}`} alt={participant} />
                    <span>{participant}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="comments-section">
            <h4>댓글</h4>
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <strong>{comment.user}:</strong> {comment.text}
                </div>
              ))}
            </div>
            <div className="comment-input">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button onClick={handleCommentSubmit}>댓글 작성</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetingCard = ({ meeting, onOpen }) => {
  return (
    <div className="meeting-card">
      <div className="meeting-card-header">{meeting.title}</div>
      <div className="meeting-card-body">
        <p><strong>장소:</strong> {meeting.location}</p>
        <p><strong>날짜:</strong> {meeting.date}</p>
        <p><strong>시간:</strong> {meeting.time}</p>
        <p><strong>참석인원:</strong> {meeting.attendees} / {meeting.limit}</p>
      </div>
      <div className="meeting-card-footer">
        <button onClick={() => onOpen(meeting)}>상세보기</button>
      </div>
    </div>
  );
};

export const MeetingList = ({ meetings }) => {
  const [selectedMeeting, setSelectedMeeting] = React.useState(null);

  const handleOpenMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleCloseMeeting = () => {
    setSelectedMeeting(null);
  };

  return (
    <div className="meeting-list">
      {meetings.map(meeting => (
        <MeetingCard key={meeting.id} meeting={meeting} onOpen={handleOpenMeeting} />
      ))}
      {selectedMeeting && (
        <MeetingDetail meeting={selectedMeeting} onClose={handleCloseMeeting} />
      )}
    </div>
  );
};