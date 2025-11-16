/**
 * Theme color selector component for background
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import './ThemeSelector.css';

export type ThemeColor = 'default' | 'beige' | 'light-blue' | 'light-gray';

const themes: { id: ThemeColor; name: string; gradient: string }[] = [
  {
    id: 'default',
    name: 'Default',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  },
  {
    id: 'beige',
    name: 'Beige',
    gradient: 'linear-gradient(135deg, #f5f1e8 0%, #e8ddd4 50%, #ddd4c7 100%)',
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #93c5fd 100%)',
  },
  {
    id: 'light-gray',
    name: 'Light Gray',
    gradient: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)',
  },
];

interface ThemeSelectorProps {
  onThemeChange?: (theme: ThemeColor) => void;
}

export function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('home-theme');
    return (saved as ThemeColor) || 'default';
  });

  useEffect(() => {
    // Appliquer le thème au chargement
    const themeData = themes.find((t) => t.id === selectedTheme);
    if (themeData) {
      document.documentElement.style.setProperty('--home-bg-gradient', themeData.gradient);

      // Ajuster la couleur du texte et du titre selon le thème
      if (selectedTheme === 'default') {
        document.documentElement.style.setProperty('--home-text-color', 'white');
        document.documentElement.style.setProperty('--home-title-gradient', 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)');
      } else {
        // Pour les thèmes clairs (beige, light-blue, light-gray), utiliser du texte sombre
        document.documentElement.style.setProperty('--home-text-color', '#1f2937');
        document.documentElement.style.setProperty('--home-title-gradient', 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)');
      }

      localStorage.setItem('home-theme', selectedTheme);
    }
    onThemeChange?.(selectedTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTheme]);

  const applyTheme = (theme: ThemeColor) => {
    const themeData = themes.find((t) => t.id === theme);
    if (themeData) {
      document.documentElement.style.setProperty('--home-bg-gradient', themeData.gradient);

      // Ajuster la couleur du texte et du titre selon le thème
      if (theme === 'default') {
        document.documentElement.style.setProperty('--home-text-color', 'white');
        document.documentElement.style.setProperty('--home-title-gradient', 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)');
      } else {
        // Pour les thèmes clairs (beige, light-blue, light-gray), utiliser du texte sombre
        document.documentElement.style.setProperty('--home-text-color', '#1f2937');
        document.documentElement.style.setProperty('--home-title-gradient', 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)');
      }

      localStorage.setItem('home-theme', theme);
    }
  };

  const handleThemeSelect = (theme: ThemeColor) => {
    setSelectedTheme(theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <button
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('themeSelector.changeTheme')}
        title={t('themeSelector.changeBackgroundColor')}
      >
        <Palette className="theme-icon" />
      </button>

      {isOpen && (
        <>
          <div className="theme-overlay" onClick={() => setIsOpen(false)} />
          <div className="theme-menu">
            <div className="theme-menu-header">
              <span>{t('themeSelector.chooseBackgroundColor')}</span>
            </div>
            <div className="theme-options">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={cn(
                    'theme-option',
                    selectedTheme === theme.id && 'selected'
                  )}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div
                    className="theme-preview"
                    style={{ background: theme.gradient }}
                  />
                  <span className="theme-name">{theme.name}</span>
                  {selectedTheme === theme.id && (
                    <span className="theme-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
