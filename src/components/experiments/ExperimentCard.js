import React from 'react';
import Card from '../common/Card';

const ExperimentCard = ({ title, duration, progress, description }) => {
  const styles = {
    header: {
      marginBottom: '16px',
    },
    title: {
      fontSize: '20px',
      marginBottom: '8px',
    },
    meta: {
      display: 'flex',
      gap: '16px',
      marginBottom: '12px',
    },
    tag: {
      backgroundColor: 'black',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '14px',
    },
    progress: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: 'var(--primary-color)',
      color: 'var(--black)',
      padding: '4px 8px',
      borderRadius: '4px',
    },
  };

  return (
    <Card style={{ position: 'relative' }}>
      <div style={styles.progress}>{progress}%</div>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.meta}>
          <span style={styles.tag}>Titration</span>
          <span style={styles.tag}>{duration}</span>
        </div>
      </div>
      <p>{description}</p>
    </Card>
  );
};

export default ExperimentCard;