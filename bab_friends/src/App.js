import './App.css';
import React from 'react';
import {MeetingList} from './components/meeting/meeting.js'
import {Navigation} from './components/login/login.js'
import { CreateMeetingModal } from './components/meeting/meetingModal.js';
import { SettingsPage } from './components/login/SettingsPage.js';

import { ReviewPage } from './components/review/ReviewPage.js';
import { CreateReviewModal } from './components/review/CreateReviewModal.js';

const App = () => {
  const [meetings, setMeetings] = React.useState([]);
  const [reviews, setReviews] = React.useState([])

  const [currentPage, setCurrentPage] = React.useState('meetings');
  const [isCreateMeetingVisible, setIsCreateMeetingVisible] = React.useState(false);
  const [isCreateReviewVisible, setIsCreateReviewVisible] = React.useState(false);
  const [selectedReviewId, setSelectedReviewId] = React.useState(null)

  const handleReviewSelect = (reviewId) => {
    setSelectedReviewId(reviewId)
  }

  const handleReviewDetailClose = () => {
    setSelectedReviewId(null)
  }

  const handleReviewCreated = (newReview) => {
    setReviews(prev => [...prev, newReview])
  }



  const handleCreateMeetingOpen = () => {
    setIsCreateMeetingVisible(true);
  };

  const handleCreateMeetingClose = () => {
    setIsCreateMeetingVisible(false);
  };

  const handleCreateReviewOpen = () => {
    setIsCreateReviewVisible(true);
  };

  const handleCreateReviewClose = () => {
    setIsCreateReviewVisible(false);
  };

  const handleFloatingButtonClick = () => {
    if (currentPage === 'meetings') {
      handleCreateMeetingOpen();
    } else if (currentPage === 'reviews') {
      handleCreateReviewOpen();
    }
  };

  const renderPage = () => {
    if (currentPage === 'meetings') {
      return (
        <div>
          <h1 style={{ textAlign: 'center' }}>밥 친구 모임</h1>
          <MeetingList meetings={meetings} />
        </div>
      );
    } else if (currentPage === 'reviews') {
      return <ReviewPage 
      onReviewSelect={handleReviewSelect}
      reviews={reviews}
      setReviews={setReviews}
      />;
    } else if (currentPage === 'settings') {
      return <SettingsPage />;
    }
    return null;
  };

  return (
    <div>
      <Navigation setPage={setCurrentPage} />
      {renderPage()}
      <button className="floating-button" onClick={handleFloatingButtonClick}>+</button>

      {isCreateMeetingVisible && (
        <CreateMeetingModal onClose={handleCreateMeetingClose} setMeetings={setMeetings} meetings={meetings} />
      )}

      {isCreateReviewVisible && (
        <CreateReviewModal onClose={handleCreateReviewClose} onReviewCreated={handleReviewCreated}/>
      )}
    </div>
  );
};

export default App;
