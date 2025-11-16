/**
 * Registration Page - Accessible for people with disabilities
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerTeacher, registerStudent, isTeacherRegistered, isStudentRegistered } from '@/lib/auth';
import { PatternLock, type PatternLockRef } from '@/components/auth/PatternLock';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import './Register.css';

export function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      setError(t('register.errors.nameRequired'));
      nameInputRef.current?.focus();
      return;
    }

    if (!studentId.trim()) {
      setError(t('register.errors.studentIdRequired'));
      return;
    }

    if (pattern.length < 4) {
      setError(t('register.errors.patternRequired'));
      return;
    }

    // 检查学生ID是否已注册
    if (isStudentRegistered(studentId.trim())) {
      setError(t('register.errors.studentIdTaken'));
      return;
    }

    // 进入确认步骤
    setStep('confirm');
  };

  const handleTeacherInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('register.errors.nameRequired'));
      nameInputRef.current?.focus();
      return;
    }

    if (!email.trim()) {
      setError(t('register.errors.emailRequired'));
      return;
    }

    // 检查邮箱是否已注册
    if (isTeacherRegistered(email.trim())) {
      setError(t('register.errors.alreadyRegistered'));
      return;
    }

    if (!password) {
      setError(t('register.errors.passwordRequired'));
      return;
    }

    if (password.length < 6) {
      setError(t('register.errors.passwordTooShort'));
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
        setError(t('register.errors.patternsMismatch'));
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
        setError(t('register.errors.passwordRequired'));
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError(t('register.errors.passwordMismatch'));
        setIsSubmitting(false);
        return;
      }
      registered = registerTeacher(email.trim(), passwordData, name.trim());
    } else {
      if (!patternData || patternData.length < 4) {
        setError(t('register.errors.patternRequired'));
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
      setError(t('register.errors.registrationFailed'));
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
            <h2>{t('register.success.title')}</h2>
            <p>{t('register.success.message')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">{t('register.title')}</h1>
          <p className="register-subtitle">
            {t('register.subtitle')}
          </p>
        </div>

        {step === 'info' ? (
          role === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="register-form" noValidate>
              <div className="form-group">
                <label htmlFor="role-select" className="form-label">
                  {t('register.role.label')}
                </label>
                <div className="role-selection" role="radiogroup" aria-label={t('register.role.ariaLabel')}>
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
                    <span className="role-label">{t('register.role.student.label')}</span>
                    <span className="role-description">{t('register.role.student.description')}</span>
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
                    <span className="role-label">{t('register.role.teacher.label')}</span>
                    <span className="role-description">{t('register.role.teacher.description')}</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name-input" className="form-label">
                  {t('register.name.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                  placeholder={t('register.name.placeholder')}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="student-id-input" className="form-label">
                  {t('register.studentId.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                  placeholder={t('register.studentId.placeholder')}
                  required
                  aria-required="true"
                />
                <span className="form-help">
                  {t('register.studentId.help')}
                </span>
              </div>

              <div className="form-group">
                <div className="pattern-label-row">
                  <label className="form-label">
                    {t('register.pattern.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                      aria-label={t('register.clearPattern')}
                    >
                      {t('register.clear')}
                    </button>
                  )}
                </div>
                <PatternLock
                  ref={patternLockRef}
                  onComplete={handlePatternComplete}
                  onError={() => setError(t('register.errors.patternRequired'))}
                  ariaLabel={t('register.pattern.ariaLabel')}
                  instructions={t('register.pattern.instructions')}
                />
                {pattern.length >= 4 && (
                  <div className="pattern-confirmed">
                    <p>✓ {t('register.confirmed', { count: pattern.length })}</p>
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
                    {t('common.cancel')}
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="submit-btn"
                  disabled={!name.trim() || !studentId.trim() || pattern.length < 4}
                >
                  {t('register.continue')}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTeacherInfoSubmit} className="register-form" noValidate>
              <div className="form-group">
                <label htmlFor="role-select" className="form-label">
                  {t('register.role.label')}
                </label>
                <div className="role-selection" role="radiogroup" aria-label={t('register.role.ariaLabel')}>
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
                    <span className="role-label">{t('register.role.student.label')}</span>
                    <span className="role-description">{t('register.role.student.description')}</span>
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
                    <span className="role-label">{t('register.role.teacher.label')}</span>
                    <span className="role-description">{t('register.role.teacher.description')}</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name-input" className="form-label">
                  {t('register.name.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                  placeholder={t('register.name.placeholder')}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-input" className="form-label">
                  {t('register.email.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                  placeholder={t('register.email.placeholder')}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  label={t('register.password.label')}
                  placeholder={t('register.password.placeholder')}
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
                    {t('common.cancel')}
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="submit-btn"
                  disabled={!name.trim() || !email.trim() || !password || password.length < 6}
                >
                  {t('register.continue')}
                </Button>
              </div>
            </form>
          )
        ) : (
          <div className="confirm-step">
            <div className="step-header">
              <h2 className="step-title">
                {role === 'teacher' ? t('register.confirmPassword.label') : t('register.confirmPattern.label')}
              </h2>
              <p className="step-subtitle">
                {role === 'teacher'
                  ? t('register.confirmPassword.help')
                  : t('register.confirmPattern.help')}
              </p>
            </div>

            {role === 'teacher' ? (
              <form onSubmit={handlePasswordConfirmSubmit} className="register-form" noValidate>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label={t('register.confirmPassword.label')}
                  placeholder={t('register.confirmPassword.placeholder')}
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
                    {t('common.back')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!confirmPassword || password !== confirmPassword || isSubmitting}
                    className="submit-btn"
                  >
                    {isSubmitting ? t('register.signingUp') : t('register.signUp')}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pattern-confirmation">
                <div className="pattern-label-row">
                  <label className="form-label">
                    {t('register.confirmPattern.label')} <span className="required" aria-label={t('common.required')}>*</span>
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
                      aria-label={t('register.clearPattern')}
                      disabled={isSubmitting}
                    >
                      {t('register.clear')}
                    </button>
                  )}
                </div>
                <PatternLock
                  ref={confirmPatternLockRef}
                  onComplete={handleConfirmPatternComplete}
                  onError={() => setError(t('register.errors.patternsMismatch'))}
                  disabled={isSubmitting}
                  ariaLabel={t('register.confirmPattern.ariaLabel')}
                  instructions={t('register.confirmPattern.instructions')}
                />

                {error && (
                  <div className="error-message" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <Button type="button" variant="outline" onClick={handleBack} className="cancel-btn">
                    {t('common.back')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="register-footer">
          <p className="footer-text">
            {t('register.footer.text')} <Link to="/login" className="login-link">{t('register.footer.link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
