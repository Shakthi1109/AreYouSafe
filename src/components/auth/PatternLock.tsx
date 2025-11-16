/**
 * Pattern Lock Component - 手势密码锁（类似安卓）
 * 无障碍设计，支持键盘导航和屏幕阅读器
 */
import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './PatternLock.css';

interface PatternLockProps {
  onComplete: (pattern: number[]) => void;
  onError?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  instructions?: string;
}

export interface PatternLockRef {
  resetPattern: () => void;
}

const GRID_SIZE = 3;
const DOT_COUNT = GRID_SIZE * GRID_SIZE;

export const PatternLock = forwardRef<PatternLockRef, PatternLockProps>(
  ({ onComplete, onError, disabled = false, ariaLabel, instructions }, ref) => {
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  // 计算两点之间的所有点
  const getPointsBetween = (start: number, end: number): number[] => {
    const startRow = Math.floor(start / GRID_SIZE);
    const startCol = start % GRID_SIZE;
    const endRow = Math.floor(end / GRID_SIZE);
    const endCol = end % GRID_SIZE;

    const points: number[] = [];
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

    for (let i = 0; i <= steps; i++) {
      const row = startRow + Math.round((rowDiff * i) / steps);
      const col = startCol + Math.round((colDiff * i) / steps);
      const point = row * GRID_SIZE + col;
      if (!points.includes(point)) {
        points.push(point);
      }
    }

    return points;
  };

  const handleDotClick = (index: number) => {
    if (disabled) return;

    if (selectedDots.length === 0) {
      setSelectedDots([index]);
      setIsDrawing(true);
      setError(false);
    } else if (!selectedDots.includes(index)) {
      const lastDot = selectedDots[selectedDots.length - 1];
      const pointsBetween = getPointsBetween(lastDot, index);
      const newSelected = [...selectedDots, ...pointsBetween.filter(p => !selectedDots.includes(p)), index];
      setSelectedDots(newSelected);
      setError(false);
    }
  };

  const handleMouseDown = (index: number) => {
    if (disabled) return;
    handleDotClick(index);
  };

  const handleMouseEnter = (index: number) => {
    if (disabled || !isDrawing) return;
    if (!selectedDots.includes(index)) {
      const lastDot = selectedDots[selectedDots.length - 1];
      const pointsBetween = getPointsBetween(lastDot, index);
      const newSelected = [...selectedDots, ...pointsBetween.filter(p => !selectedDots.includes(p)), index];
      setSelectedDots(newSelected);
    }
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsDrawing(false);
    if (selectedDots.length >= 4) {
      // 至少需要4个点
      onComplete(selectedDots);
    } else {
      // 点数不足，显示错误
      setError(true);
      if (onError) onError();
      setTimeout(() => {
        setSelectedDots([]);
        setError(false);
      }, 1000);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    e.preventDefault();
    handleMouseDown(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('pattern-dot')) {
      const index = parseInt(element.getAttribute('data-index') || '0');
      handleMouseEnter(index);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  // 键盘导航支持
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDotClick(index);
    }
  };

  // 重置功能暴露给父组件
  useImperativeHandle(ref, () => ({
    resetPattern: () => {
      setSelectedDots([]);
      setIsDrawing(false);
      setError(false);
    },
  }));

  // 计算线条路径
  const getLinePath = () => {
    if (selectedDots.length < 2) return '';
    const dots = selectedDots.map((index) => {
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      const x = (col * 100) / (GRID_SIZE - 1);
      const y = (row * 100) / (GRID_SIZE - 1);
      return { x, y };
    });
    return dots.map((dot, i) => (i === 0 ? 'M' : 'L') + `${dot.x}% ${dot.y}%`).join(' ');
  };

  return (
    <div
      ref={containerRef}
      className={`pattern-lock ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      role="application"
      aria-label={ariaLabel || "Draw your security pattern"}
      aria-describedby="pattern-instructions"
    >
      {instructions && (
        <p id="pattern-instructions" className="pattern-instructions">
          {instructions}
        </p>
      )}
      <svg className="pattern-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        {selectedDots.length > 1 && (
          <path
            d={getLinePath()}
            className="pattern-line"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <div className="pattern-grid">
        {Array.from({ length: DOT_COUNT }).map((_, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;
          const isSelected = selectedDots.includes(index);
          const isLastSelected = selectedDots[selectedDots.length - 1] === index;

          return (
            <button
              key={index}
              type="button"
              className={`pattern-dot ${isSelected ? 'selected' : ''} ${isLastSelected ? 'last-selected' : ''}`}
              data-index={index}
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={disabled ? -1 : 0}
              aria-label={`Point ${index + 1}`}
              disabled={disabled}
            >
              <div className="dot-outer">
                <div className="dot-inner" />
              </div>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="pattern-error" role="alert" aria-live="polite">
          Le motif doit contenir au moins 4 points. Réessayez.
        </p>
      )}
    </div>
  );
});

