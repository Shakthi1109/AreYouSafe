/**
 * Page de connexion - Accessible pour les personnes en situation de handicap
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getCurrentUser, verifyTeacherPassword, verifyStudentPattern, getTeacherName, getStudentName } from '@/lib/auth';
import { PatternLock, type PatternLockRef } from '@/components/auth/PatternLock';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'info' | 'verify'>('info');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const patternLockRef = useRef<PatternLockRef>(null);

  // Vérifier si déjà connecté
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }, [navigate]);

  // Focus automatique sur le premier champ
  useEffect(() => {
    if (verificationStep === 'info') {
      nameInputRef.current?.focus();
    }
  }, [verificationStep]);

  // 当切换到验证步骤时，重置验证状态
  useEffect(() => {
    if (verificationStep === 'verify') {
      setPassword('');
      setPattern([]);
      setError('');
      // 如果是学生，重置手势锁
      if (role === 'student') {
        patternLockRef.current?.resetPattern();
      }
    }
  }, [verificationStep, role]);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Veuillez entrer votre nom');
      nameInputRef.current?.focus();
      return;
    }

    if (role === 'teacher' && !email.trim()) {
      setError('Veuillez entrer votre email (requis pour les enseignants)');
      return;
    }

    // 进入验证步骤
    setVerificationStep('verify');
  };

  const handlePatternComplete = (completedPattern: number[]) => {
    setPattern(completedPattern);
    handleVerification(completedPattern);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerification(undefined, password);
  };

  const handleVerification = (patternData?: number[], passwordData?: string) => {
    setError('');
    setIsSubmitting(true);

    let isValid = false;

    if (role === 'teacher') {
      // 验证教师密码
      if (!passwordData) {
        setError('Veuillez entrer votre mot de passe');
        setIsSubmitting(false);
        return;
      }
      isValid = verifyTeacherPassword(email.trim(), passwordData);
      if (!isValid) {
        setError('Email ou mot de passe incorrect. Vérifiez vos informations ou inscrivez-vous.');
        setIsSubmitting(false);
        return;
      }
    } else {
      // 验证学生手势
      if (!studentId.trim()) {
        setError('Veuillez entrer votre ID étudiant');
        setIsSubmitting(false);
        return;
      }
      if (!patternData || patternData.length < 4) {
        setError('Veuillez dessiner votre motif de sécurité (minimum 4 points)');
        setIsSubmitting(false);
        return;
      }
      isValid = verifyStudentPattern(studentId.trim(), patternData);
      if (!isValid) {
        setError('ID étudiant ou motif incorrect. Veuillez vérifier vos informations.');
        setIsSubmitting(false);
        // 重置手势
        patternLockRef.current?.resetPattern();
        setPattern([]);
        return;
      }
    }

    // 验证成功，进行登录
    setTimeout(() => {
      try {
        const userId = role === 'teacher' 
          ? `teacher_${Date.now()}`
          : `student_${Date.now()}`;
        
        // 从存储中获取真实姓名
        const finalName = role === 'teacher' 
          ? getTeacherName(email.trim()) || name.trim()
          : getStudentName(studentId.trim()) || name.trim();
        
        login(userId, finalName, role, email.trim() || undefined);
        
        // Rediriger selon le rôle
        if (role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      } catch (error) {
        setError('Erreur lors de la connexion. Veuillez réessayer.');
        setIsSubmitting(false);
      }
    }, 300);
  };

  const handleBack = () => {
    setVerificationStep('info');
    setError('');
    setPassword('');
    setPattern([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigation au clavier
    if (e.key === 'Escape') {
      navigate('/');
    }
  };

  return (
    <div className="login-page" onKeyDown={handleKeyDown}>
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Connexion</h1>
          <p className="login-subtitle">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {verificationStep === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="login-form" noValidate>
          {/* Sélection du rôle */}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRole('student');
                    setError('');
                  }
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRole('teacher');
                    setError('');
                  }
                }}
              >
                <span className="role-icon">👨‍🏫</span>
                <span className="role-label">Enseignant</span>
                <span className="role-description">Voir les signalements</span>
              </button>
            </div>
          </div>

          {/* Nom */}
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
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'error-message' : 'name-help'}
              autoComplete="name"
            />
            <span id="name-help" className="form-help">
              Votre nom sera utilisé pour identifier vos signalements
            </span>
          </div>

          {/* Email (seulement pour enseignants) */}
          {role === 'teacher' && (
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
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : 'email-help'}
                autoComplete="email"
              />
              <span id="email-help" className="form-help">
                Votre email est requis pour les enseignants
              </span>
            </div>
          )}

          {/* Student ID (seulement pour étudiants) */}
          {role === 'student' && (
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
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : 'student-id-help'}
                autoComplete="username"
              />
              <span id="student-id-help" className="form-help">
                L'ID que vous avez utilisé lors de l'inscription
              </span>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div
              id="error-message"
              className="error-message"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="cancel-btn"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
              aria-busy={isSubmitting}
            >
              Continuer
            </Button>
          </div>
        </form>
        ) : (
          <div className="verification-step">
            <div className="verification-header">
              <h2 className="verification-title">
                {role === 'teacher' ? 'Vérification du mot de passe' : 'Dessinez votre motif de sécurité'}
              </h2>
              <p className="verification-subtitle">
                {role === 'teacher' 
                  ? 'Entrez votre mot de passe pour continuer'
                  : 'Dessinez votre motif de sécurité pour continuer (minimum 4 points)'}
              </p>
            </div>

            {role === 'teacher' ? (
              <form onSubmit={handlePasswordSubmit} className="login-form" noValidate>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  label="Mot de passe"
                  placeholder="Entrez votre mot de passe"
                  error={error}
                  required
                  autoFocus
                />

                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="cancel-btn"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !password}
                    className="submit-btn"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? 'Vérification...' : 'Se connecter'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pattern-verification">
                <PatternLock
                  ref={patternLockRef}
                  onComplete={handlePatternComplete}
                  onError={() => setError('Motif incorrect. Réessayez.')}
                  disabled={isSubmitting}
                />

                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="cancel-btn"
                  >
                    Retour
                  </Button>
                </div>

                <div className="pattern-help">
                  <p className="help-text">
                    <strong>Astuce:</strong> Dessinez le motif que vous avez créé lors de l'inscription
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer avec lien vers inscription */}
        <div className="login-footer">
          <p className="footer-text">
            Pas encore de compte? <Link to="/register" className="register-link">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

