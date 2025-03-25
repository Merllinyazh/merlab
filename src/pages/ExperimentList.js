import React from 'react';
import { useNavigate } from 'react-router-dom';
import ExperimentCard from '../components/experiments/ExperimentCard';
import { EXPERIMENTS } from '../utils/constants';

const ExperimentList = () => {
  const navigate = useNavigate();
  
  const styles = {
    container: {
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#0d47a1', // Dark blue background
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: '1200px',
      marginBottom: '32px',
    },
    searchContainer: {
      position: 'relative',
      width: '300px',
    },
    searchInput: {
      width: '100%',
      padding: '12px',
      paddingLeft: '40px',
      borderRadius: '8px',
      border: '1px solid #90caf9',
      backgroundColor: '#1e3a8a',
      color: 'white',
      outline: 'none',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)', // 2 containers per row
      gap: '30px',
      justifyContent: 'center',
      maxWidth: '900px',
      width: '100%',
    },
    cardContainer: {
      background: 'linear-gradient(145deg, #1565c0, #0d47a1)', // Gradient Blue
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: 'white',
      transition: 'all 0.3s ease-in-out',
      border: '2px solid #90caf9',
    },
    cardHover: {
      transform: 'translateY(-5px)', // Subtle lift on hover
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
    },
    button: {
      backgroundColor: '#64b5f6',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease-in-out, transform 0.2s ease',
      width: '90%',
      textAlign: 'center',
      marginTop: '15px',
    },
    buttonHover: {
      backgroundColor: '#42a5f5', // Slightly darker blue
      transform: 'scale(1.05)', // Small zoom-in
    },
    blackButton: {
      backgroundColor: 'black',
      color: 'white',
      border: '2px solid white',
    },
    blackButtonHover: {
      backgroundColor: 'white',
      color: 'black',
      border: '2px solid black',
    },
  };

  const selectedExperiments = [...EXPERIMENTS.slice(0, 2), ...EXPERIMENTS.slice(0, 2)];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>My Experiments</h1>
        <div style={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search anything" 
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.grid}>
        {selectedExperiments.map((experiment, index) => (
          <div 
            key={index} 
            style={styles.cardContainer}
            onClick={() => navigate(`/experiments/${experiment.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.cardHover.transform;
              e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = styles.cardContainer.boxShadow;
            }}
          >
            <ExperimentCard {...experiment} />
            <button 
              style={{
                ...styles.button, 
                ...(experiment.title === "Titration" || experiment.title === "Week 1" ? styles.blackButton : {})
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 
                  (experiment.title === "Titration" || experiment.title === "Week 2") 
                    ? styles.blackButtonHover.backgroundColor 
                    : styles.buttonHover.backgroundColor;
                e.currentTarget.style.color = 
                  (experiment.title === "Titration" || experiment.title === "Week 2") 
                    ? styles.blackButtonHover.color 
                    : styles.button.color;
                e.currentTarget.style.transform = styles.buttonHover.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
                e.currentTarget.style.color = styles.button.color;
                e.currentTarget.style.transform = 'none';
              }}
              onClick={() => navigate(`/experiments/${experiment.id}`)}
            >
              View Experiment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentList;
