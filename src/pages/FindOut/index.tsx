/**
 * Find Out Page - Educational content about preventing harassment
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, X, Check } from 'lucide-react';
import './FindOut.css';

// Training slides data with isGood property
const trainingSlides = [
  {
    id: 1,
    gif: 'src/assets/gifs/StrangerDanger.gif',
    title: 'Stranger Danger',
    description: 'If a stranger approaches or offers something that feels wrong, say no, move away, and get help from a trusted adult.',
    isGood: false, // This is a BAD scenario
    question: 'Is this situation safe or unsafe?'
  },
  {
    id: 2,
    gif: 'src/assets/gifs/PersonalSpaces.gif',
    title: 'Personal & Private Parts',
    description: 'Your personal space and private parts are yours. If anyone tries to touch you, say no, step away, and tell a trusted adult.',
    isGood: true, // Knowing about personal space is GOOD
    question: 'Is knowing about personal boundaries good or bad?'
  },
  {
    id: 3,
    gif: 'src/assets/gifs/BadTouch.gif',
    title: 'Bad Touch',
    description: 'If someone touches you in a way that feels uncomfortable, say no, run away, and tell a trusted adult immediately.',
    isGood: false, // This is a BAD scenario
    question: 'Is this type of touch safe or unsafe?'
  },
  {
    id: 4,
    gif: 'src/assets/gifs/SexualHarasment.gif',
    title: 'Physical/Sexual Harassment',
    description: 'If someone touches you, grabs you, or behaves in a way that feels unsafe, say no loudly, move away, and seek help from a trusted adult.',
    isGood: false, // This is a BAD scenario
    question: 'Is this behavior acceptable or unacceptable?'
  },
  {
    id: 5,
    gif: 'src/assets/gifs/AdultContent.gif',
    title: 'Adult Content',
    description: 'If you accidentally see adult or inappropriate content, look away, leave the situation, and tell a trusted adult about it.',
    isGood: false, // This is a BAD scenario
    question: 'Is viewing adult content safe for children?'
  },
  {
    id: 6,
    gif: 'src/assets/gifs/Bully.gif',
    title: 'Bullying',
    description: 'If someone is teasing, hurting, or scaring you, say stop, move away, and ask a trusted adult for help.',
    isGood: false, // This is a BAD scenario
    question: 'Is bullying acceptable behavior?'
  },
  {
    id: 7,
    gif: 'src/assets/gifs/Uncomfortable.gif',
    title: 'Feeling Uncomfortable',
    description: 'If something or someone makes you feel uneasy, listen to that feeling—say no, step away, and talk to a trusted adult.',
    isGood: false, // Feeling uncomfortable is a warning sign (BAD situation)
    question: 'Should you ignore uncomfortable feelings?'
  },
  {
    id: 8,
    gif: 'src/assets/gifs/SeekHelp.gif',
    title: 'Talk to Trusted Adult',
    description: 'When you feel scared, confused, or uncomfortable, talk to a trusted adult so they can help you stay safe.',
    isGood: true, // Seeking help is GOOD
    question: 'Is talking to a trusted adult a good action?'
  },
  {
    id: 9,
    gif: 'src/assets/gifs/AdultAttention.gif',
    title: 'Seek Help from Trusted Adult',
    description: 'If you face anything unsafe, say no, get away from the situation, and immediately seek help from a trusted adult.',
    isGood: true, // Seeking help is GOOD
    question: 'Is seeking help from adults a good response?'
  }
  
];

export function FindOut() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentContent = trainingSlides[currentSlide - 1];
  const isLastSlide = currentSlide === trainingSlides.length;

  const handleAnswer = (userAnswerIsGood: boolean) => {
    const isCorrect = userAnswerIsGood === currentContent.isGood;
    
    if (isCorrect) {
      setFeedback('correct');
      setShowAnswer(true);
      
      // Auto-advance to next slide after showing correct feedback
      setTimeout(() => {
        if (currentSlide < trainingSlides.length) {
          setCurrentSlide(currentSlide + 1);
          setFeedback(null);
          setShowAnswer(false);
        } else {
          // Last slide - show completion modal
          setShowCompletionModal(true);
        }
      }, 2000);
    } else {
      setFeedback('incorrect');
      
      // Reset feedback after 2 seconds to allow retry
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
    }
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
  };

  return (
    <div className="find-out-page">
      <div className="find-out-container">
        <Link to="/" className="back-button">
          <ArrowLeft className="back-icon" />
          <span>Home</span>
        </Link>

        <div className="find-out-header">
          <h1 className="find-out-title">Harassment Awareness Training</h1>
          <p className="find-out-subtitle">
            Learn about preventing harassment and how to stay safe
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentSlide / trainingSlides.length) * 100}%` }}
            />
          </div>
          <p className="progress-text">
            Slide {currentSlide} of {trainingSlides.length}
          </p>
        </div>

        {/* Training Content */}
        <div className="educational-content">
          <div className="content-section training-slide">
            <div className="gif-container">
              <img 
                src={currentContent.gif}
                alt={`Training slide ${currentSlide}`}
                className="section-gif"
              />
            </div>
            <h2 className="section-title">{currentContent.title}</h2>
            
            {/* Question */}
            {!showAnswer && (
              <div className="question-container">
                <p className="question-text">{currentContent.question}</p>
              </div>
            )}

            {/* Answer Buttons */}
            {!showAnswer && (
              <div className="answer-buttons">
                <button
                  className={`answer-btn bad-btn ${feedback === 'incorrect' ? 'shake' : ''}`}
                  onClick={() => handleAnswer(false)}
                  disabled={feedback !== null}
                >
                  <X className="answer-icon" />
                  <span>Unsafe/Bad</span>
                </button>
                <button
                  className={`answer-btn good-btn ${feedback === 'incorrect' ? 'shake' : ''}`}
                  onClick={() => handleAnswer(true)}
                  disabled={feedback !== null}
                >
                  <Check className="answer-icon" />
                  <span>Safe/Good</span>
                </button>
              </div>
            )}

            {/* Feedback Message */}
            {feedback && (
              <div className={`feedback-message ${feedback}`}>
                {feedback === 'correct' ? (
                  <>
                    <CheckCircle className="feedback-icon" />
                    <p className="feedback-text">Correct! Well done!</p>
                  </>
                ) : (
                  <>
                    <X className="feedback-icon" />
                    <p className="feedback-text">Wrong! Try again.</p>
                  </>
                )}
              </div>
            )}

            {/* Show description after correct answer */}
            {showAnswer && (
              <div className="answer-explanation">
                <p className="section-text">{currentContent.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <CheckCircle className="success-icon" />
            </div>
            <h2 className="modal-title">Congratulations!</h2>
            <p className="modal-message">
              Harassment Awareness Training Completed
            </p>
            <p className="modal-submessage">
              You've successfully completed all training modules. You now have the knowledge to recognize, prevent, and report harassment.
            </p>
            <div className="modal-actions">
              <Link to="/">
                <Button size="lg" className="modal-btn">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

