/**
 * Student Dashboard - Visual reporting interface
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CategorySymbolSelector } from '@/components/reporting/CategorySymbolSelector';
import { BodyMap } from '@/components/reporting/BodyMap';
import { EmotionScaleComponent } from '@/components/reporting/EmotionScale';
import { SafetyThermometerComponent } from '@/components/reporting/SafetyThermometer';
import { Button } from '@/components/ui/button';
// Question icons
import howAreYouIcon from '@/assets/icons/questions/How_u_feel.png';
import whereIcon from '@/assets/icons/questions/where.png';
import howOftenIcon from '@/assets/icons/questions/How_offen.png';
import whichBodyPartIcon from '@/assets/icons/questions/Which_body_part.png';
// Category type icons
import attackIcon from '@/assets/icons/types/attack.png';
import mockIcon from '@/assets/icons/types/mock.png';
import isolationIcon from '@/assets/icons/types/isolation.png';
import {
  createReport,
  getLocations,
  type Location,
  type SymbolSelection,
  type BodyMapSelection,
  type EmotionScale,
  type Frequency,
  type SafetyThermometer,
} from '@/lib/api';
import './StudentDashboard.css';

const frequencyOptions = [
  { value: 'once', label: 'Once' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'often', label: 'Often' },
  { value: 'always', label: 'Always' },
];

// Category configuration for step-by-step symbol selection
const SYMBOL_CATEGORIES = [
  { id: 'physical', label: 'Physical Harassment', icon: attackIcon },
  { id: 'verbal', label: 'Verbal Harassment', icon: mockIcon },
  { id: 'social', label: 'Social Harassment', icon: isolationIcon },
  { id: 'cyber', label: 'Cyber Harassment', icon: '💻' }, // No icon file for cyber, keep emoji
];

export function StudentDashboard() {
  const [step, setStep] = useState(1);
  const [studentId] = useState('student-001'); // To be replaced with authentication
  const [studentName] = useState('Student'); // To be replaced with authentication
  
  const [isEverythingFine, setIsEverythingFine] = useState<boolean | null>(null);
  const [wasEverythingFine, setWasEverythingFine] = useState<boolean>(false);
  const [symbols, setSymbols] = useState<SymbolSelection[]>([]);
  const [categorySelections, setCategorySelections] = useState<Record<string, SymbolSelection[]>>({});
  const [bodyMap, setBodyMap] = useState<BodyMapSelection[]>([]);
  const [emotion, setEmotion] = useState<EmotionScale | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [safety, setSafety] = useState<SafetyThermometer | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await getLocations();
      setLocations(data);
      return data;
    } catch (error) {
      console.error('Error loading locations:', error);
      return [];
    }
  };

  const handleSubmit = async () => {
    // Normal submission flow (only called when reporting something)
    if (!symbols.length) {
      alert('Please select at least one incident to report');
      return;
    }
    if (!emotion || !location || !frequency || !safety) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        studentId,
        studentName,
        symbols,
        bodyMap: bodyMap.length > 0 ? bodyMap : undefined,
        emotion,
        location,
        frequency,
        safety,
      });
      setSubmitSuccess(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error sending report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setIsEverythingFine(null);
    setWasEverythingFine(false);
    setSymbols([]);
    setCategorySelections({});
    setBodyMap([]);
    setEmotion(null);
    setLocation(null);
    setFrequency(null);
    setSafety(null);
    setSubmitSuccess(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return isEverythingFine !== null;
      case 2:
      case 3:
      case 4:
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return emotion !== null;
      case 8:
        return location !== null;
      case 9:
        return frequency !== null;
      case 10:
        return safety !== null;
      case 11:
        return true;
      default:
        return false;
    }
  };

  const handleCategorySelection = (category: string, selected: SymbolSelection[]) => {
    setCategorySelections((prev) => {
      const updated = {
        ...prev,
        [category]: selected,
      };
      const allSymbols = Object.values(updated).flat();
      setSymbols(allSymbols);
      return updated;
    });
  };

  const handleEverythingFine = async (value: boolean) => {
    setIsEverythingFine(value);
    if (value === true) {
      setWasEverythingFine(true);
      setIsSubmitting(true);
      try {
        let locationsData = locations;
        if (locationsData.length === 0) {
          locationsData = await loadLocations();
        }
        
        const defaultLocation = locationsData.length > 0 ? locationsData[0] : {
          id: 'general',
          name: 'General',
          icon: '🏫'
        };
        
        await createReport({
          studentId,
          studentName,
          symbols: [{ id: 'everything_fine', label: 'Everything is fine', category: 'general' }],
          bodyMap: undefined,
          emotion: { level: 1, color: 'green' },
          location: defaultLocation,
          frequency: { value: 'once' },
          safety: { level: 1, feeling: 'very_safe' },
        });
        setSubmitSuccess(true);
        setTimeout(() => {
          resetForm();
        }, 3000);
      } catch (error) {
        console.error('Error submitting report:', error);
        alert('Error sending report. Please try again.');
        setIsSubmitting(false);
        setWasEverythingFine(false);
      }
    } else {
      setStep(2);
    }
  };

  if (submitSuccess) {
    return (
      <div className="student-dashboard">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Report Sent Successfully</h2>
          <p>
            {wasEverythingFine
              ? "Thank you for letting us know everything is fine. Your report has been received."
              : "Your report has been received. A teacher will review it shortly."}
          </p>
          <div className="success-actions">
            <Link to="/">
              <Button variant="outline" className="previous-btn">
                Back to Home
              </Button>
            </Link>
            <Button onClick={resetForm} className="next-btn">
              Create New Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <Link to="/" className="dashboard-title-link">
        <h1 className="dashboard-title">Are You Safe</h1>
      </Link>

      {isEverythingFine === false && (
        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
              <div
                key={s}
                className={`progress-step ${s <= step ? 'active' : ''} ${s === step ? 'current' : ''}`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="report-form">
        {step === 1 && (
          <div className="form-step">
            <div className="question-header">
              <img src={howAreYouIcon} alt="How are you doing" className="question-icon" />
              <h3>How are you doing today?</h3>
            </div>
            <div className="everything-fine-options">
              <button
                onClick={() => handleEverythingFine(true)}
                className={`everything-fine-btn ${isEverythingFine === true ? 'selected' : ''}`}
              >
                <div className="fine-icon">✅</div>
                <div className="fine-content">
                  <h4 className="fine-title">Everything is fine</h4>
                  <p className="fine-description">No incidents to report</p>
                </div>
              </button>
              <button
                onClick={() => handleEverythingFine(false)}
                className={`everything-fine-btn ${isEverythingFine === false ? 'selected' : ''}`}
              >
                <div className="fine-icon">⚠️</div>
                <div className="fine-content">
                  <h4 className="fine-title">I need to report something</h4>
                  <p className="fine-description">Something happened that I want to report</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Category steps: 2-5 (Physical, Verbal, Social, Cyber) */}
        {isEverythingFine === false && step >= 2 && step <= 5 && (() => {
          const categoryIndex = step - 2;
          const category = SYMBOL_CATEGORIES[categoryIndex];
          return (
            <div className="form-step form-step-no-scroll">
              <CategorySymbolSelector
                category={category.id}
                categoryLabel={category.label}
                categoryIcon={category.icon}
                onSelect={(selected) => handleCategorySelection(category.id, selected)}
                selectedSymbols={categorySelections[category.id] || []}
                onSkip={() => {
                  if ((categorySelections[category.id] || []).length === 0) {
                    setTimeout(() => {
                      if (step < 5) {
                        setStep(step + 1);
                      }
                    }, 300);
                  }
                }}
              />
            </div>
          );
        })()}

        {/* Step 6: Summary/Review */}
        {isEverythingFine === false && step === 6 && (
          <div className="form-step">
            <div className="question-header">
              <div className="question-icon-placeholder">📋</div>
              <h3>Review Your Report</h3>
            </div>
            <div className="review-summary">
              <p>You have selected the following incidents:</p>
              {symbols.length > 0 ? (
                <div className="selected-symbols-list">
                  {symbols.map((symbol) => {
                    const category = SYMBOL_CATEGORIES.find(c => c.id === symbol.category);
                    const categoryIcon = category?.icon;
                    const isImageIcon = typeof categoryIcon === 'string' && 
                      (categoryIcon.includes('/') || categoryIcon.includes('\\') || categoryIcon.endsWith('.png'));
                    return (
                      <div key={symbol.id} className="selected-symbol-item">
                        <span className="symbol-category-badge">
                          {isImageIcon ? (
                            <img src={categoryIcon} alt={category?.label || ''} className="symbol-category-badge-image" />
                          ) : (
                            categoryIcon
                          )}
                        </span>
                        <span className="symbol-label-text">{symbol.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#FF8CC8', fontStyle: 'italic' }}>No incidents selected. You can go back to add incidents.</p>
              )}
            </div>
          </div>
        )}

        {isEverythingFine === false && step === 7 && (
          <div className="form-step">
            <EmotionScaleComponent onSelect={setEmotion} selectedEmotion={emotion || undefined} />
          </div>
        )}

        {isEverythingFine === false && step === 8 && (
          <div className="form-step">
            <div className="question-header">
              <img src={whereIcon} alt="Where" className="question-icon" />
              <h3>Where did this happen?</h3>
            </div>
            <div className="locations-grid">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocation(loc)}
                  className={`location-card ${location?.id === loc.id ? 'selected' : ''}`}
                >
                  <span className="location-icon">{loc.icon}</span>
                  <span className="location-name">{loc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isEverythingFine === false && step === 9 && (
          <div className="form-step">
            <div className="question-header">
              <img src={howOftenIcon} alt="How often" className="question-icon" />
              <h3>How often does this happen?</h3>
            </div>
            <div className="frequency-options">
              {frequencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFrequency({ value: opt.value })}
                  className={`frequency-btn ${frequency?.value === opt.value ? 'selected' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isEverythingFine === false && step === 10 && (
          <div className="form-step">
            <SafetyThermometerComponent
              onSelect={setSafety}
              selectedSafety={safety || undefined}
            />
          </div>
        )}

        {isEverythingFine === false && step === 11 && (
          <div className="form-step">
            {symbols.some((s) => s.category === 'physical') ? (
              <>
                <div className="question-header">
                  <img src={whichBodyPartIcon} alt="Which body part" className="question-icon" />
                  <h3>Where were you touched?</h3>
                </div>
                <BodyMap onSelect={setBodyMap} selectedPoints={bodyMap} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#FF8CC8', fontSize: '18px', fontWeight: 600 }}>
                No physical incidents reported. You can proceed to submit.
              </div>
            )}
          </div>
        )}

        {isEverythingFine === false && step > 1 && (
          <div className="form-actions">
            <Button variant="outline" onClick={() => setStep(step - 1)} className="previous-btn">
              Previous
            </Button>
            {step < 11 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="next-btn">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="next-btn">
                {isSubmitting ? 'Sending...' : 'Submit Report'}
              </Button>
            )}
          </div>
        )}
        {isEverythingFine === true && isSubmitting && (
          <div className="form-actions">
            <div className="submitting-message">
              <p>Submitting your report...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
