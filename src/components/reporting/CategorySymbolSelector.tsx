/**
 * Category-based symbol selector - one category per page
 */
import { useState, useEffect, useRef } from 'react';
import { getSymbols, type Symbol, type SymbolSelection } from '@/lib/api';
import { cn } from '@/lib/utils';
import './CategorySymbolSelector.css';

interface CategorySymbolSelectorProps {
  category: string;
  categoryLabel: string;
  categoryIcon: string;
  onSelect: (symbols: SymbolSelection[]) => void;
  selectedSymbols?: SymbolSelection[];
  onSkip?: () => void;
}

export function CategorySymbolSelector({
  category,
  categoryLabel,
  categoryIcon,
  onSelect,
  selectedSymbols = [],
  onSkip,
}: CategorySymbolSelectorProps) {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [selected, setSelected] = useState<SymbolSelection[]>([]);
  const prevCategoryRef = useRef<string>(category);

  useEffect(() => {
    loadSymbols();
    
    // Reset selected when category changes (not when selectedSymbols changes)
    if (prevCategoryRef.current !== category) {
      const categorySelected = selectedSymbols?.filter((s) => s.category === category) || [];
      setSelected(categorySelected);
      prevCategoryRef.current = category;
    }
  }, [category]); // Only depend on category to avoid resetting user selections

  const loadSymbols = async () => {
    try {
      const data = await getSymbols();
      // Filter symbols for this category only
      const categorySymbols = data.filter((s) => s.category === category);
      setSymbols(categorySymbols);
    } catch (error) {
      console.error('Error loading symbols:', error);
    }
  };

  const toggleSymbol = (symbol: Symbol) => {
    const isSelected = selected.some((s) => s.id === symbol.id);
    let newSelected: SymbolSelection[];
    if (isSelected) {
      newSelected = selected.filter((s) => s.id !== symbol.id);
    } else {
      newSelected = [...selected, { id: symbol.id, label: symbol.label, category: symbol.category }];
    }
    setSelected(newSelected);
    // Notify parent immediately
    onSelect(newSelected);
  };

  const handleNone = () => {
    // Remove all symbols from this category
    const newSelected: SymbolSelection[] = [];
    setSelected(newSelected);
    // Notify parent immediately
    onSelect(newSelected);
    if (onSkip) {
      onSkip();
    }
  };

  const hasSelection = selected.length > 0;

  // Check if categoryIcon is an image path (contains path indicators) or emoji
  const isImageIcon = typeof categoryIcon === 'string' && 
    (categoryIcon.includes('/') || categoryIcon.includes('\\') || categoryIcon.endsWith('.png'));

  return (
    <div className="category-symbol-selector">
      <div className="category-header">
        <div className="category-icon-large">
          {isImageIcon ? (
            <img src={categoryIcon} alt={categoryLabel} className="category-icon-image" />
          ) : (
            categoryIcon
          )}
        </div>
        <h3 className="category-title">{categoryLabel}</h3>
        <p className="category-description">Select what happened, or choose "None" if nothing happened in this category</p>
      </div>

      {/* Symbols grid */}
      <div className="symbols-grid-category">
        {symbols.map((symbol) => {
          const isSelected = selected.some((s) => s.id === symbol.id);
          return (
            <button
              key={symbol.id}
              onClick={() => toggleSymbol(symbol)}
              className={cn(
                'symbol-card-category',
                isSelected && 'selected'
              )}
            >
              <div className="symbol-icon-category">
                {isImageIcon ? (
                  <img src={categoryIcon} alt={categoryLabel} className="symbol-icon-image" />
                ) : (
                  categoryIcon
                )}
              </div>
              <div className="symbol-label-category">{symbol.label}</div>
            </button>
          );
        })}
        {/* None option - last in grid */}
        <button
          onClick={handleNone}
          className={cn(
            'symbol-card-category none-card',
            !hasSelection && 'selected'
          )}
        >
          <div className="symbol-icon-category none-icon-symbol">✓</div>
          <div className="symbol-label-category">None</div>
        </button>
      </div>
    </div>
  );
}

