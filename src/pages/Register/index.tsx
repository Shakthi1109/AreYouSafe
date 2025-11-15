/**
 * Page d'inscription - Accessible pour les personnes en situation de handicap
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerTeacher, registerStudent, isTeacherRegistered, isStudentRegistered } from '@/lib/auth';
import { PatternLock, type PatternLockRef } from '@/components/auth/PatternLock';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import './Register.css';

export function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [confirmPattern, setConfirmPattern] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'info' | 'confirm'>('info');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const patternLockRef = useRef<PatternLockRef>(null);
  const confirmPatternLockRef = useRef<PatternLockRef>(null);

  // Focus automatique
  useEffect(() => {
    if (step === 'info') {
      nameInputRef.current?.focus();
    }
  }, [step]);

  // 重置确认手势
  useEffect(() => {
    if (step === 'confirm' && role === 'student') {
      setConfirmPattern([]);
      confirmPatternLockRef.current?.resetPattern();
    }
  }, [step, role]);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证学生信息
    if (!name.trim()) {
      setError('Veuillez entrer votre nom');
      nameInputRef.current?.focus();
      return;
    }

    if (!studentId.trim()) {
      setError('Veuillez entrer votre ID étudiant');
      return;
    }

    if (pattern.length < 4) {
      setError('Veuillez dessiner votre motif de sécurité (minimum 4 points)');
      return;
    }

    // 检查学生ID是否已注册
    if (isStudentRegistered(studentId.trim())) {
      setError('Cet ID étudiant est déjà enregistré. Veuillez vous connecter.');
      return;
    }

    // 进入确认步骤
    setStep('confirm');
  };

  const handleTeacherInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Veuillez entrer votre nom');
      nameInputRef.current?.focus();
      return;
    }

    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }

    // 检查邮箱是否已注册
    if (isTeacherRegistered(email.trim())) {
      setError('Cet email est déjà enregistré. Veuillez vous connecter.');
      return;
    }

    if (!password) {
      setError('Veuillez entrer un mot de passe');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setStep('confirm');
  };

  const handlePatternComplete = (completedPattern: number[]) => {
    setPattern(completedPattern);
    setError('');
  };

  const handleConfirmPatternComplete = (completedPattern: number[]) => {
    setConfirmPattern(completedPattern);
    
    // 自动验证
    if (completedPattern.length >= 4) {
      const patternStr = JSON.stringify(completedPattern.sort());
      const originalPatternStr = JSON.stringify(pattern.sort());
      
      if (patternStr === originalPatternStr) {
        handleFinalSubmit(undefined, completedPattern);
      } else {
        setError('Les motifs ne correspondent pas. Réessayez.');
        if (confirmPatternLockRef.current) {
          const resetFn = (confirmPatternLockRef.current as any).resetPattern;
          if (resetFn) resetFn();
        }
        setConfirmPattern([]);
      }
    }
  };

  const handleFinalSubmit = (passwordData?: string, patternData?: number[]) => {
    setError('');
    setIsSubmitting(true);

    let registered = false;

    if (role === 'teacher') {
      if (!passwordData) {
        setError('Veuillez entrer un mot de passe');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setIsSubmitting(false);
        return;
      }
      registered = registerTeacher(email.trim(), passwordData, name.trim());
    } else {
      if (!patternData || patternData.length < 4) {
        setError('Veuillez dessiner votre motif de sécurité');
        setIsSubmitting(false);
        return;
      }
      registered = registerStudent(studentId.trim(), patternData, name.trim());
    }

    if (registered) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const handlePasswordConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFinalSubmit(confirmPassword);
  };

  const handleBack = () => {
    setStep('info');
    setError('');
    setPassword('');
    setConfirmPassword('');
    setPattern([]);
    setConfirmPattern([]);
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Inscription réussie!</h2>
            <p>Redirection vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">Inscription</h1>
          <p className="register-subtitle">
            Créez votre compte pour accéder à l'application
          </p>
        </div>

        {step === 'info' ? (
          role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="register-form" noValidate>
              <div className="form-group">
                <label htmlFor="role-select" className="form-label">
                  Je suis
                </label>
                <div className="role-selection" role="radiogroup" aria-label="Sélectionnez votre rôle">
                  <button
                    type="button"
                    id="role-student"
                    role="radio"
                    aria-checked={role === 'student'}
                    className={`role-option ${role === 'student' ? 'selected' : ''}`}
                    onClick={() => {
                      setRole('student');
                      setError('');
                    }}
                  >
                    <span className="role-icon">👤</span>
                    <span className="role-label">Étudiant</span>
                    <span className="role-description">Faire un signalement</span>
                  </button>
                  <button
                    type="button"
                    id="role-teacher"
                    role="radio"
                    aria-checked={role === 'teacher'}
                    className={`role-option ${role === 'teacher' ? 'selected' : ''}`}
                    onClick={() => {
                      setRole('teacher');
                      setError('');
                    }}
                  >
                    <span className="role-icon">👨‍🏫</span>
                    <span className="role-label">Enseignant</span>
                    <span className="role-description">Voir les signalements</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name-input" className="form-label">
                  Nom <span className="required" aria-label="requis">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  className="form-input"
                  placeholder="Entrez votre nom"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="student-id-input" className="form-label">
                  ID Étudiant <span className="required" aria-label="requis">*</span>
                </label>
                <input
                  id="student-id-input"
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setError('');
                  }}
                  className="form-input"
                  placeholder="Entrez votre ID étudiant"
                  required
                  aria-required="true"
                />
                <span className="form-help">
                  Cet ID sera utilisé pour vous identifier
                </span>
              </div>

              <div className="form-group">
                <div className="pattern-label-row">
                  <label className="form-label">
                    Motif de sécurité <span className="required" aria-label="requis">*</span>
                  </label>
                  {pattern.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        patternLockRef.current?.resetPattern();
                        setPattern([]);
                        setError('');
                      }}
                      className="clear-pattern-btn"
                      aria-label="Effacer le motif"
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <PatternLock
                  ref={patternLockRef}
                  onComplete={handlePatternComplete}
                  onError={() => setError('Le motif doit contenir au moins 4 points')}
                />
                {pattern.length >= 4 && (
                  <div className="pattern-confirmed">
                    <p>✓ Motif enregistré ({pattern.length} points)</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message" role="alert" aria-live="polite">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <Link to="/login">
                  <Button type="button" variant="outline" className="cancel-btn">
                    Annuler
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!name.trim() || !studentId.trim() || pattern.length < 4}
                >
                  Continuer
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTeacherInfoSubmit} className="register-form" noValidate>
              <div className="form-group">
                <label htmlFor="role-select" className="form-label">
                  Je suis
                </label>
                <div className="role-selection" role="radiogroup" aria-label="Sélectionnez votre rôle">
                  <button
                    type="button"
                    id="role-student"
                    role="radio"
                    aria-checked={role === 'student'}
                    className={`role-option ${role === 'student' ? 'selected' : ''}`}
                    onClick={() => {
                      setRole('student');
                      setError('');
                    }}
                  >
                    <span className="role-icon">👤</span>
                    <span className="role-label">Étudiant</span>
                    <span className="role-description">Faire un signalement</span>
                  </button>
                  <button
                    type="button"
                    id="role-teacher"
                    role="radio"
                    aria-checked={role === 'teacher'}
                    className={`role-option ${role === 'teacher' ? 'selected' : ''}`}
                    onClick={() => {
                      setRole('teacher');
                      setError('');
                    }}
                  >
                    <span className="role-icon">👨‍🏫</span>
                    <span className="role-label">Enseignant</span>
                    <span className="role-description">Voir les signalements</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name-input" className="form-label">
                  Nom <span className="required" aria-label="requis">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  className="form-input"
                  placeholder="Entrez votre nom"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-input" className="form-label">
                  Email <span className="required" aria-label="requis">*</span>
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="form-input"
                  placeholder="votre.email@exemple.com"
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe (minimum 6 caractères)"
                  required
                />
              </div>

              {error && (
                <div className="error-message" role="alert" aria-live="polite">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <Link to="/login">
                  <Button type="button" variant="outline" className="cancel-btn">
                    Annuler
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="submit-btn"
                  disabled={!name.trim() || !email.trim() || !password || password.length < 6}
                >
                  Continuer
                </Button>
              </div>
            </form>
          )
        ) : (
          <div className="confirm-step">
            <div className="step-header">
              <h2 className="step-title">
                {role === 'teacher' ? 'Confirmez votre mot de passe' : 'Confirmez votre motif'}
              </h2>
              <p className="step-subtitle">
                {role === 'teacher'
                  ? 'Entrez à nouveau votre mot de passe pour confirmer'
                  : 'Dessinez à nouveau votre motif pour confirmer'}
              </p>
            </div>

            {role === 'teacher' ? (
              <form onSubmit={handlePasswordConfirmSubmit} className="register-form" noValidate>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Confirmer le mot de passe"
                  placeholder="Entrez à nouveau votre mot de passe"
                  required
                  autoFocus
                />

                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <Button type="button" variant="outline" onClick={handleBack} className="cancel-btn">
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={!confirmPassword || password !== confirmPassword || isSubmitting}
                    className="submit-btn"
                  >
                    {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pattern-confirmation">
                <div className="pattern-label-row">
                  <label className="form-label">
                    Confirmez votre motif <span className="required" aria-label="requis">*</span>
                  </label>
                  {confirmPattern.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        confirmPatternLockRef.current?.resetPattern();
                        setConfirmPattern([]);
                        setError('');
                      }}
                      className="clear-pattern-btn"
                      aria-label="Effacer le motif"
                      disabled={isSubmitting}
                    >
                      Effacer
                    </button>
                  )}
                </div>
                <PatternLock
                  ref={confirmPatternLockRef}
                  onComplete={handleConfirmPatternComplete}
                  onError={() => setError('Les motifs ne correspondent pas')}
                  disabled={isSubmitting}
                />

                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <Button type="button" variant="outline" onClick={handleBack} className="cancel-btn">
                    Retour
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="register-footer">
          <p className="footer-text">
            Déjà un compte? <Link to="/login" className="login-link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
