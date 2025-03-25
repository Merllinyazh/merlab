import { Link } from 'react-router-dom'; // ✅ Import Link

import React, { useState, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import ExperimentVideo from '../components/experiments/ExperimentVideo';
import Button from '../components/common/Button';

const Chatbot = lazy(() => import('../components/chat/Chatbot')); // ✅ Lazy-loaded chatbot

const ExperimentDetail = () => {
  const { id } = useParams();
  const [showChat, setShowChat] = useState(false); // ✅ State for chatbot visibility

  const toggleChat = () => {
    setShowChat((prev) => !prev);
  };

  const styles = {
    container: {
      maxWidth: '100%',
      margin: '0 auto',
      paddingBottom: '80px',
      backgroundColor: '#1e3a8a',
    },
    header: {
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
    },
    title: {
      fontSize: '24px',
      textAlign: 'left',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      transition: 'width 0.3s ease', // ✅ Smooth transition when resizing
      width: showChat ? '75%' : '90%', // ✅ Shrinks when chatbot is open
    },
    videoContainer: {
      width: '100%',
      maxWidth: showChat ? '900px' : '1200px', // ✅ Adjusts size dynamically
    },
    section: {
      width: '100%',
      maxWidth: showChat ? '900px' : '1200px', // ✅ Adjusts width dynamically
    },
    sectionTitle: {
      fontSize: '18px',
      marginBottom: '16px',
      textAlign: 'left',
    },
    floatingButtons: {
      position: 'fixed',
      bottom: '20px',
      right: showChat ? '380px' : '20px', // ✅ Pushes floating buttons when chatbot is open
      display: 'flex',
      gap: '12px',
    },
    chatbotButton: {
      position: 'fixed',
      top: '20px', // ✅ Keeps chatbot icon at the top right
      right: '20px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      zIndex: 1000,
    },
    chatbotImage: {
      width: '50px',
      height: '50px',
    },
  };

  return (
    <div style={styles.container}>
      {/* ✅ Header with Floating Chatbot Button in Top Right */}
      <div style={styles.header}>
        <h1 style={styles.title}>Estimation of Ferrous Sulphate (Fe2+)</h1>
        <button style={styles.chatbotButton} onClick={toggleChat}>
          <img src="/assets/chatbot.png" alt="Chatbot" style={styles.chatbotImage} />
        </button>
      </div>

      <div style={styles.content}>
        {/* ✅ Enlarged Video Section (Resizes when Chatbot Opens) */}
        <div style={styles.videoContainer}>
          <ExperimentVideo videoUrl="/placeholder-video.mp4" title="Experiment 1 Video" />
        </div>

        {/* ✅ Procedure Section Below Video (Resizes when Chatbot Opens) */}
        <Card style={styles.section}>
          <h2 style={styles.sectionTitle}>Procedure</h2>
          <p>Titration is a laboratory method used in quantitative chemical analysis to determine the concentration of an analyte (the substance being analyzed). It involves the gradual addition of a solution of known concentration (the titrant) to a measured volume of another solution of unknown concentration until the reaction reaches a specific endpoint, often indicated by a color change</p>
        </Card>
      </div>

      {/* ✅ Floating Bottom Buttons */}
      <div style={styles.floatingButtons}>
      <Link to="/mcq">
        <Button>Practice MCQs</Button>
      </Link>
      <a href="/practice-space.html">
        <Button>Practice Space</Button>
      </a>
      </div>

      {/* ✅ Chatbot Component (Appears in Bottom Right When Clicked) */}
      {showChat && (
        <Suspense fallback={<div>Loading Chatbot...</div>}>
          <Chatbot />
        </Suspense>
      )}
    </div>
  );
};

export default ExperimentDetail;
