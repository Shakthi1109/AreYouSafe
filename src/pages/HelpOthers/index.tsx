/**
 * Help Others Page - Report for someone else
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, logout } from '@/lib/auth';
import { CategorySymbolSelector } from '@/components/reporting/CategorySymbolSelector';
import { BodyMap } from '@/components/reporting/BodyMap';
import { EmotionScaleComponent } from '@/components/reporting/EmotionScale';
import { SafetyThermometerComponent } from '@/components/reporting/SafetyThermometer';
import { Button } from '@/components/ui/button';
// Question icons
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
import './HelpOthers.css';

export function HelpOthers() {
  const { t } = useTranslation();
  
  // Frequency options with translations
  const frequencyOptions = [
    { value: 'once', label: t('helpOthers.frequency.once') },
    { value: 'sometimes', label: t('helpOthers.frequency.sometimes') },
    { value: 'often', label: t('helpOthers.frequency.often') },
    { value: 'always', label: t('helpOthers.frequency.always') },
  ];

  // Category configuration with translations
  const SYMBOL_CATEGORIES = [
    { id: 'physical', label: t('helpOthers.categories.physical'), icon: attackIcon },
    { id: 'verbal', label: t('helpOthers.categories.verbal'), icon: mockIcon },
    { id: 'social', label: t('helpOthers.categories.social'), icon: isolationIcon },
    { id: 'cyber', label: t('helpOthers.categories.cyber'), icon: '💻' },
  ];
  
  const [step, setStep] = useState(1);
  const currentUser = getCurrentUser();
  const reporterId = currentUser?.id || 'reporter-001';
  const reporterName = currentUser?.name || 'Reporter';
  const [studentName, setStudentName] = useState('');

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
    if (!symbols.length) {
      alert(t('helpOthers.errors.noIncidents'));
      return;
    }
    if (!emotion || !location || !frequency || !safety || !studentName.trim()) {
      alert(t('helpOthers.errors.incomplete'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createReport({
        studentId: `student-${Date.now()}`,
        studentName: studentName.trim(),
        symbols,
        bodyMap: bodyMap.length > 0 ? bodyMap : undefined,
        emotion,
        location,
        frequency,
        safety,
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(t('helpOthers.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setStudentName('');
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
        return studentName.trim().length > 0;
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

  if (submitSuccess) {
    return (
      <div className="help-others-page">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>{t('helpOthers.success.title')}</h2>
          <p>{t('helpOthers.success.message', { name: studentName || t('helpOthers.success.defaultName') })}</p>
          <div className="success-actions">
            <Link to="/">
              <Button variant="outline" className="previous-btn">
                {t('helpOthers.buttons.backToHome')}
              </Button>
            </Link>
            <Button onClick={resetForm} className="next-btn">
              {t('helpOthers.buttons.createNew')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="help-others-page">

      <div className="dashboard-header-top">
        <Link to="/" className="dashboard-title-link">
          <h1 className="dashboard-title">{t('helpOthers.title')}</h1>
        </Link>
        <div className="user-info">
          <span className="user-name">{reporterName}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="logout-btn"
          >
            {t('helpOthers.logout')}
          </Button>
        </div>
      </div>

      {step > 1 && (
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
            <h3 className="text-lg font-semibold mb-4">{t('helpOthers.whoNeedsHelp')}</h3>
            <div className="student-name-input">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={t('helpOthers.enterName')}
                className="name-input"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {t('helpOthers.leaveAnonymous')}
              </p>
            </div>
          </div>
        )}

        {/* Category steps: 2-5 (Physical, Verbal, Social, Cyber) */}
        {step >= 2 && step <= 5 && (() => {
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
        {step === 6 && (
          <div className="form-step">
            <div className="question-header">
              <div className="question-icon-placeholder">📋</div>
              <h3>{t('helpOthers.reviewReport')}</h3>
            </div>
            <div className="review-summary">
              <p>{t('helpOthers.selectedIncidents')}</p>
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
                <p style={{ color: '#FF8CC8', fontStyle: 'italic' }}>{t('helpOthers.noIncidents')}</p>
              )}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="form-step">
            <EmotionScaleComponent onSelect={setEmotion} selectedEmotion={emotion || undefined} />
          </div>
        )}

        {step === 8 && (
          <div className="form-step">
            <div className="question-header">
              <img src={whereIcon} alt="Where" className="question-icon" />
              <h3>{t('helpOthers.whereDidThisHappen')}</h3>
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

        {step === 9 && (
          <div className="form-step">
            <div className="question-header">
              <img src={howOftenIcon} alt="How often" className="question-icon" />
              <h3>{t('helpOthers.howOften')}</h3>
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

        {step === 10 && (
          <div className="form-step">
            <SafetyThermometerComponent
              onSelect={setSafety}
              selectedSafety={safety || undefined}
            />
          </div>
        )}

        {step === 11 && (
          <div className="form-step">
            {symbols.some((s) => s.category === 'physical') ? (
              <>
                <div className="question-header">
                  <img src={whichBodyPartIcon} alt="Which body part" className="question-icon" />
                  <h3>{t('helpOthers.whereWereYouTouched')}</h3>
                </div>
                <BodyMap onSelect={setBodyMap} selectedPoints={bodyMap} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#FF8CC8', fontSize: '18px', fontWeight: 600 }}>
                {t('helpOthers.noPhysicalIncidents')}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="form-actions">
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="next-btn">
              {t('common.continue')}
            </Button>
          </div>
        )}
        {step > 1 && (
          <div className="form-actions">
            <Button variant="outline" onClick={() => setStep(step - 1)} className="previous-btn">
              {t('common.back')}
            </Button>
            {step < 11 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="next-btn">
                {t('common.continue')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="next-btn">
                {isSubmitting ? t('helpOthers.buttons.sending') : t('helpOthers.buttons.submitReport')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
