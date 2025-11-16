/**
 * Safety thermometer to indicate the level of safety felt
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { SafetyThermometer } from '@/lib/api';
import './SafetyThermometer.css';

interface SafetyThermometerProps {
  onSelect: (safety: SafetyThermometer) => void;
  selectedSafety?: SafetyThermometer;
}

const safetyLevels = [
  { level: 1, feeling: 'very_safe', label: 'Very Safe', color: '#22c55e' },
  { level: 2, feeling: 'safe', label: 'Safe', color: '#84cc16' },
  { level: 3, feeling: 'neutral', label: 'Neutral', color: '#eab308' },
  { level: 4, feeling: 'unsafe', label: 'Unsafe', color: '#f97316' },
  { level: 5, feeling: 'very_unsafe', label: 'Very Unsafe', color: '#ef4444' },
];

export function SafetyThermometerComponent({ onSelect, selectedSafety }: SafetyThermometerProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number>(selectedSafety?.level || 0);

  useEffect(() => {
    if (selectedSafety) {
      setSelected(selectedSafety.level);
    }
  }, [selectedSafety]);

  const handleSelect = (level: number, feeling: string) => {
    setSelected(level);
    onSelect({ level, feeling });
  };

  return (
    <div className="safety-thermometer">
      <div className="question-header">
        <div className="question-icon-placeholder">🛡️</div>
        <h3 className="text-lg font-semibold mb-6 text-center">{t('safetyThermometer.question')}</h3>
      </div>

      <div className="thermometer-container-horizontal">
        {safetyLevels.map((safety) => {
          const isActive = selected === safety.level;

          return (
            <button
              key={safety.level}
              onClick={() => handleSelect(safety.level, safety.feeling)}
              className={cn(
                'thermometer-item-horizontal',
                isActive && 'active'
              )}
              style={{
                borderColor: isActive ? safety.color : '#e5e7eb',
                backgroundColor: isActive ? safety.color : 'white',
                color: isActive ? 'white' : '#1f2937',
              }}
            >
              <div className="thermometer-number">{safety.level}</div>
              <div className="thermometer-label-horizontal">{safety.label}</div>
            </button>
          );
        })}
      </div>

      {selected > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('safetyThermometer.selectedLevel', { level: safetyLevels[selected - 1].label })}
        </p>
      )}
    </div>
  );
}
