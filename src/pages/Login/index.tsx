/**
 * Login Page - Accessible for people with disabilities
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login, getCurrentUser, verifyTeacherPassword, verifyStudentPattern, getTeacherName, getStudentName } from '@/lib/auth';
import { PatternLock, type PatternLockRef } from '@/components/auth/PatternLock';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      setError(t('login.errors.nameRequired'));
      nameInputRef.current?.focus();
      return;
    }

    if (role === 'teacher' && !email.trim()) {
      setError(t('login.errors.emailRequired'));
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
        setError(t('login.errors.passwordRequired'));
        setIsSubmitting(false);
        return;
      }
      isValid = verifyTeacherPassword(email.trim(), passwordData);
      if (!isValid) {
        setError(t('login.errors.invalidCredentials'));
        setIsSubmitting(false);
        return;
      }
    } else {
      // 验证学生手势
      if (!studentId.trim()) {
        setError(t('login.errors.studentIdRequired'));
        setIsSubmitting(false);
        return;
      }
      if (!patternData || patternData.length < 4) {
        setError(t('login.errors.patternRequired'));
        setIsSubmitting(false);
        return;
      }
      isValid = verifyStudentPattern(studentId.trim(), patternData);
      if (!isValid) {
        setError(t('login.errors.invalidPattern'));
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
        setError(t('login.errors.loginFailed'));
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
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">
            {t('login.subtitle')}
          </p>
        </div>

        {verificationStep === 'info' ? (
          <form onSubmit={handleInfoSubmit} className="login-form" noValidate>
          {/* Sélection du rôle */}
          <div className="form-group">
            <label htmlFor="role-select" className="form-label">
              {t('login.role.label')}
            </label>
            <div className="role-selection" role="radiogroup" aria-label={t('login.role.ariaLabel')}>
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
                <span className="role-label">{t('login.role.student.label')}</span>
                <span className="role-description">{t('login.role.student.description')}</span>
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
                <span className="role-label">{t('login.role.teacher.label')}</span>
                <span className="role-description">{t('login.role.teacher.description')}</span>
              </button>
            </div>
          </div>

          {/* Nom */}
          <div className="form-group">
            <label htmlFor="name-input" className="form-label">
              {t('login.name.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
              placeholder={t('login.name.placeholder')}
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'error-message' : 'name-help'}
              autoComplete="name"
            />
            <span id="name-help" className="form-help">
              {t('login.name.help')}
            </span>
          </div>

          {/* Email (seulement pour enseignants) */}
          {role === 'teacher' && (
            <div className="form-group">
              <label htmlFor="email-input" className="form-label">
                {t('login.email.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                placeholder={t('login.email.placeholder')}
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : 'email-help'}
                autoComplete="email"
              />
              <span id="email-help" className="form-help">
                {t('login.email.help')}
              </span>
            </div>
          )}

          {/* Student ID (seulement pour étudiants) */}
          {role === 'student' && (
            <div className="form-group">
              <label htmlFor="student-id-input" className="form-label">
                {t('login.studentId.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                placeholder={t('login.studentId.placeholder')}
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'error-message' : 'student-id-help'}
                autoComplete="username"
              />
              <span id="student-id-help" className="form-help">
                {t('login.studentId.help')}
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
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
              aria-busy={isSubmitting}
            >
              {t('login.continue')}
            </Button>
          </div>
        </form>
        ) : (
          <div className="verification-step">
            <div className="verification-header">
              <h2 className="verification-title">
                {role === 'teacher' ? t('login.verification.password.title') : t('login.verification.pattern.title')}
              </h2>
              <p className="verification-subtitle">
                {role === 'teacher'
                  ? t('login.verification.password.subtitle')
                  : t('login.verification.pattern.subtitle')}
              </p>
            </div>

            {role === 'teacher' ? (
              <form onSubmit={handlePasswordSubmit} className="login-form" noValidate>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  label={t('login.password.label')}
                  placeholder={t('login.password.placeholder')}
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
                    {t('common.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !password}
                    className="submit-btn"
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? t('login.signingIn') : t('login.signIn')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pattern-verification">
                <PatternLock
                  ref={patternLockRef}
                  onComplete={handlePatternComplete}
                  onError={() => setError(t('login.errors.patternError'))}
                  disabled={isSubmitting}
                  ariaLabel={t('login.pattern.ariaLabel')}
                  instructions={t('login.pattern.instructions')}
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
                    {t('common.back')}
                  </Button>
                </div>

                <div className="pattern-help">
                  <p className="help-text">
                    <strong>{t('login.pattern.help.title')}:</strong> {t('login.pattern.help.description')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer avec lien vers inscription */}
        <div className="login-footer">
          <p className="footer-text">
            {t('login.footer.text')} <Link to="/register" className="register-link">{t('login.footer.link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
