import React, { useState } from 'react';
import './PsychologyTest.css';

const PsychologyTest = () => {
  const [activeTest, setActiveTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});

  // Exercise Personality Assessment Questions (15 questions)
  const exercisePersonalityQuestions = [
    { id: 1, question: 'I prefer to exercise alone rather than in a group', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 2, question: 'I enjoy physical challenges', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 3, question: 'I need a regular schedule for workouts', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 4, question: 'I get motivated by competing with others', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 5, question: 'I prefer to do varied exercises', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 6, question: 'I enjoy intense and challenging workouts', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 7, question: 'I need immediate feedback on my progress', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 8, question: 'I get bored with repetitive exercises', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 9, question: 'I prefer to exercise in a quiet environment', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 10, question: 'I enjoy setting goals and achieving them', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 11, question: 'I need flexibility in my workout schedule', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 12, question: 'I get excited about learning new techniques', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 13, question: 'I prefer short and intense workouts', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 14, question: 'I enjoy group and social exercises', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 15, question: 'I need structure and order in my workouts', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] }
  ];

  // Emotional Intelligence (EQ) Test in Sports Questions (12 questions)
  const eqTestQuestions = [
    { id: 1, question: 'I can control my emotions during exercise', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 2, question: 'I can understand others\' emotions in a sports environment', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 3, question: 'I maintain my motivation when facing failure', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 4, question: 'I can manage stress during exercise', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 5, question: 'I welcome constructive feedback', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 6, question: 'I can collaborate effectively with a team', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 7, question: 'I can maintain my motivation over time', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 8, question: 'I can convert negative emotions into positive energy', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 9, question: 'I have good understanding of my strengths and weaknesses', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 10, question: 'I can stay calm in difficult situations', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 11, question: 'I can communicate effectively with coach and teammates', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 12, question: 'I learn from my mistakes and improve', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] }
  ];

  // Exercise Potential Assessment Questions (12 questions)
  const exercisePotentialQuestions = [
    { id: 1, question: 'I exercise regularly and consistently', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 2, question: 'I am not afraid of hard workouts', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 3, question: 'I can set long-term goals for myself', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 4, question: 'I am not afraid of pain and discomfort in workouts', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 5, question: 'I can continue workouts even in difficult conditions', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 6, question: 'I enjoy continuous learning and improvement', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 7, question: 'I can maintain my focus throughout the workout', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 8, question: 'I enjoy competition and challenges', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 9, question: 'I can learn from my mistakes', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 10, question: 'I have strong motivation to progress', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 11, question: 'I can cooperate with coach and guide', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] },
    { id: 12, question: 'I believe I can achieve my sports goals', options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'] }
  ];

  const getQuestions = () => {
    switch (activeTest) {
      case 'personality':
        return exercisePersonalityQuestions;
      case 'eq':
        return eqTestQuestions;
      case 'potential':
        return exercisePotentialQuestions;
      default:
        return [];
    }
  };

  const handleAnswer = (answerIndex) => {
    const questions = getQuestions();
    const questionId = questions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    const questions = getQuestions();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const questions = getQuestions();
    let totalScore = 0;
    let answeredCount = 0;

    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        // Score: 5 for Strongly Agree, 4 for Agree, 3 for Neutral, 2 for Disagree, 1 for Strongly Disagree
        totalScore += (5 - answers[q.id]);
        answeredCount++;
      }
    });

    const averageScore = answeredCount > 0 ? (totalScore / answeredCount) : 0;
    const percentage = (averageScore / 4) * 100; // Max score is 4 (5-1)

    let level, description;
    if (percentage >= 80) {
      level = 'Excellent';
      description = activeTest === 'personality' 
        ? 'You have a strong and cohesive sports personality'
        : activeTest === 'eq'
        ? 'Your emotional intelligence in sports is very high'
        : 'Your exercise potential is very high';
    } else if (percentage >= 60) {
      level = 'Good';
      description = activeTest === 'personality'
        ? 'You have a good sports personality'
        : activeTest === 'eq'
        ? 'Your emotional intelligence in sports is good'
        : 'Your exercise potential is good';
    } else if (percentage >= 40) {
      level = 'Average';
      description = activeTest === 'personality'
        ? 'Your sports personality is at an average level'
        : activeTest === 'eq'
        ? 'Your emotional intelligence in sports is average'
        : 'Your exercise potential is average';
    } else {
      level = 'Needs Improvement';
      description = activeTest === 'personality'
        ? 'You need to strengthen your sports personality'
        : activeTest === 'eq'
        ? 'You need to improve your emotional intelligence'
        : 'You need to strengthen your exercise potential';
    }

    setResults({
      score: percentage.toFixed(1),
      level,
      description
    });
  };

  const startTest = (testType) => {
    setActiveTest(testType);
    setCurrentQuestion(0);
    setAnswers({});
    setResults({});
  };

  const resetTest = () => {
    setActiveTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResults({});
  };

  const questions = getQuestions();
  const currentQ = questions[currentQuestion];

  return (
    <div className="psychology-test" dir="ltr">
      <div className="psychology-test-header">
        <h2>Psychology Test</h2>
      </div>

      {!activeTest ? (
        <div className="test-selection">
          <div className="test-cards">
            <div className="test-card" onClick={() => startTest('personality')}>
              <h3>Exercise Personality Assessment</h3>
              <p>15 questions to analyze your exercise personality</p>
              <button className="start-test-btn">
                Start Test
              </button>
            </div>

            <div className="test-card" onClick={() => startTest('eq')}>
              <h3>Emotional Intelligence (EQ) Test in Sports</h3>
              <p>12 questions to assess your emotional intelligence in sports</p>
              <button className="start-test-btn">
                Start Test
              </button>
            </div>

            <div className="test-card" onClick={() => startTest('potential')}>
              <h3>Exercise Potential Assessment</h3>
              <p>12 questions to evaluate your exercise potential</p>
              <button className="start-test-btn">
                Start Test
              </button>
            </div>
          </div>
        </div>
      ) : results.score ? (
        <div className="test-results">
          <h3>
            {activeTest === 'personality' 
              ? 'Exercise Personality Results'
              : activeTest === 'eq'
              ? 'Emotional Intelligence Results'
              : 'Exercise Potential Results'}
          </h3>
          <div className="result-display">
            <div className="result-score">
              <span className="score-number">{results.score}%</span>
              <span className="score-level">{results.level}</span>
            </div>
            <p className="result-description">{results.description}</p>
          </div>
          <button className="retake-test-btn" onClick={resetTest}>
            Back to Main Menu
          </button>
        </div>
      ) : (
        <div className="test-taking">
          <div className="test-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <p className="progress-text">
              {`Question ${currentQuestion + 1} of ${questions.length}`}
            </p>
          </div>

          <div className="question-section">
            <h3 className="question-text">{currentQ.question}</h3>
            <div className="options-list">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-btn ${answers[currentQ.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="test-navigation">
            <button 
              className="nav-btn prev-btn" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            <button 
              className="nav-btn next-btn" 
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsychologyTest;

