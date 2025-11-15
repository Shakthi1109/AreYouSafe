/**
 * Password Input Component - 密码输入组件（无障碍设计）
 */
import { useState, useRef, useEffect } from 'react';
import './PasswordInput.css';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = 'Entrez votre mot de passe',
  label = 'Mot de passe',
  error,
  required = false,
  disabled = false,
  autoFocus = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `password-input-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="password-input-group">
      <label htmlFor={inputId} className="password-label">
        {label}
        {required && <span className="required" aria-label="requis">*</span>}
      </label>
      <div className={`password-input-wrapper ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        <input
          ref={inputRef}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="password-input"
          required={required}
          disabled={disabled}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : `${inputId}-help`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          tabIndex={0}
          disabled={disabled}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="password-error" role="alert" aria-live="polite">
          {error}
        </span>
      ) : (
        <span id={`${inputId}-help`} className="password-help">
          Le mot de passe est requis pour les enseignants
        </span>
      )}
    </div>
  );
}

