/**
 * Home Page - Main navigation
 */
import { Link } from 'react-router-dom';
import { ThemeSelector } from '@/components/ThemeSelector';
import { LogIn } from 'lucide-react';
import myselfIcon from '@/assets/icons/homepage/homepage_button_myself.png';
import othersIcon from '@/assets/icons/homepage/homepage_button_others.png';
import trainIcon from '@/assets/icons/homepage/homepage_button_train.png';
import './Home.css';

export function Home() {
  return (
    <div className="home-page">
      <ThemeSelector />
      
      {/* Teacher Login Button - Top Left */}
      <Link to="/teacher" className="teacher-login-btn">
        <LogIn className="login-icon" />
        <span>Teacher Login</span>
      </Link>

      <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">Are You Safe</h1>
          <p className="home-subtitle">
            Je te cois 
          </p>
        </div>

        <div className="main-options">
          <Link to="/student" className="main-option-card">
            <div className="option-icon">
              <img src={myselfIcon} alt="Get help for myself" />
            </div>
            <h2 className="option-title">Get help for myself</h2>
            <div className="option-arrow">→</div>
          </Link>

          <Link to="/help-others" className="main-option-card">
            <div className="option-icon">
              <img src={othersIcon} alt="Help someone in need" />
            </div>
            <h2 className="option-title">Help someone in need</h2>
            <div className="option-arrow">→</div>
          </Link>

          <Link to="/find-out" className="main-option-card">
            <div className="option-icon">
              <img src={trainIcon} alt="Find out" />
            </div>
            <h2 className="option-title">Find out</h2>
            <div className="option-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

