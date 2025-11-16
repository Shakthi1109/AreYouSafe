/**
 * Find Out Page - Educational content about preventing harassment
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Users, Heart, BookOpen } from 'lucide-react';
import './FindOut.css';

export function FindOut() {
  const { t } = useTranslation();

  return (
    <div className="find-out-page">
      <div className="find-out-container">
        <Link to="/" className="back-button">
          <ArrowLeft className="back-icon" />
          <span>{t('findOut.backToHome')}</span>
        </Link>

        <div className="find-out-header">
          <h1 className="find-out-title">{t('findOut.title')}</h1>
          <p className="find-out-subtitle">
            {t('findOut.subtitle')}
          </p>
        </div>

        <div className="educational-content">
          <div className="content-section">
            <div className="section-icon">
              <Shield />
            </div>
            <h2 className="section-title">{t('findOut.whatIsHarassment.title')}</h2>
            <p className="section-text">
              {t('findOut.whatIsHarassment.description')}
            </p>
          </div>

          <div className="content-section">
            <div className="section-icon">
              <Users />
            </div>
            <h2 className="section-title">{t('findOut.typesOfHarassment.title')}</h2>
            <div className="types-list">
              <div className="type-item">
                <strong>{t('findOut.typesOfHarassment.physical')}</strong> {t('findOut.typesOfHarassment.physicalDesc')}
              </div>
              <div className="type-item">
                <strong>{t('findOut.typesOfHarassment.verbal')}</strong> {t('findOut.typesOfHarassment.verbalDesc')}
              </div>
              <div className="type-item">
                <strong>{t('findOut.typesOfHarassment.social')}</strong> {t('findOut.typesOfHarassment.socialDesc')}
              </div>
              <div className="type-item">
                <strong>{t('findOut.typesOfHarassment.cyber')}</strong> {t('findOut.typesOfHarassment.cyberDesc')}
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="section-icon">
              <Heart />
            </div>
            <h2 className="section-title">{t('findOut.howToStaySafe.title')}</h2>
            <ul className="safety-list">
              <li>{t('findOut.howToStaySafe.advice1')}</li>
              <li>{t('findOut.howToStaySafe.advice2')}</li>
              <li>{t('findOut.howToStaySafe.advice3')}</li>
              <li>{t('findOut.howToStaySafe.advice4')}</li>
              <li>{t('findOut.howToStaySafe.advice5')}</li>
            </ul>
          </div>

          <div className="content-section">
            <div className="section-icon">
              <BookOpen />
            </div>
            <h2 className="section-title">{t('findOut.whatToDoIfYouSeeHarassment.title')}</h2>
            <div className="action-steps">
              <div className="step-item">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h3>{t('findOut.whatToDoIfYouSeeHarassment.step1.title')}</h3>
                  <p>{t('findOut.whatToDoIfYouSeeHarassment.step1.description')}</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h3>{t('findOut.whatToDoIfYouSeeHarassment.step2.title')}</h3>
                  <p>{t('findOut.whatToDoIfYouSeeHarassment.step2.description')}</p>
                </div>
              </div>
              <div className="step-item">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h3>{t('findOut.whatToDoIfYouSeeHarassment.step3.title')}</h3>
                  <p>{t('findOut.whatToDoIfYouSeeHarassment.step3.description')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <Link to="/student">
              <Button size="lg" className="action-btn">
                {t('findOut.buttons.getHelpForMyself')}
              </Button>
            </Link>
            <Link to="/help-others">
              <Button size="lg" variant="outline" className="action-btn">
                {t('findOut.buttons.helpSomeoneInNeed')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
