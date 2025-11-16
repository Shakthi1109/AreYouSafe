/**
 * Find Out Page - Educational content about preventing harassment
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import './FindOut.css';

// Training slides data
const trainingSlides = [
  {
    id: 1,
    gif: 'src/assets/gifs/loading.gif',
    title: 'What is Harassment?',
    description: 'Harassment is any unwanted behavior that makes someone feel uncomfortable, scared, or hurt. It can be physical, verbal, social, or happen online.'
  },
  {
    id: 2,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Types of Harassment',
    description: 'Harassment can take many forms including bullying, cyberbullying, physical intimidation, verbal abuse, and social exclusion.'
  },
  {
    id: 3,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Recognizing the Signs',
    description: 'Learn to identify harassment early. Signs include repeated unwanted attention, threats, intimidation, or behavior that makes you feel unsafe.'
  },
  {
    id: 4,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Physical Harassment',
    description: 'Physical harassment includes hitting, pushing, or any unwanted physical contact. No one has the right to touch you without permission.'
  },
  {
    id: 5,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Verbal Harassment',
    description: 'Verbal harassment includes name-calling, threats, insults, or any words meant to hurt, intimidate, or demean someone.'
  },
  {
    id: 6,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Cyberbullying',
    description: 'Online harassment through social media, messages, or emails is just as serious. Always report cyberbullying and save evidence.'
  },
  {
    id: 7,
    gif: 'src/assets/gifs/loading.gif',
    title: 'How to Respond',
    description: 'If you experience harassment: stay calm, document everything, tell a trusted adult, and report it through proper channels.'
  },
  {
    id: 8,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Supporting Others',
    description: 'If you witness harassment, be an upstander not a bystander. Support the victim, report the incident, and never participate.'
  },
  {
    id: 9,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Creating Safe Spaces',
    description: 'Everyone deserves to feel safe. Treat others with respect, speak up against harassment, and help create a positive environment.'
  },
  {
    id: 10,
    gif: 'src/assets/gifs/loading.gif',
    title: 'Getting Help',
    description: 'Remember: you are not alone. Talk to teachers, counselors, parents, or use our reporting system. Help is always available.'
  }
];

export function FindOut() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentContent = trainingSlides[currentSlide - 1];
  const isLastSlide = currentSlide === trainingSlides.length;

  const handleNext = () => {
    if (currentSlide < trainingSlides.length) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleFinish = () => {
    setShowCompletionModal(true);
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
            <p className="section-text">{currentContent.description}</p>

            {/* Navigation Button */}
            <div className="slide-navigation">
              {!isLastSlide ? (
                <Button 
                  size="lg" 
                  className="nav-btn next-btn"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="nav-btn finish-btn"
                  onClick={handleFinish}
                >
                  <CheckCircle className="finish-icon" />
                  Finish Training
                </Button>
              )}
            </div>
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

