import React, { memo } from 'react';
import { motion } from 'motion/react';

interface SuggestionButtonsProps {
  suggestions: string[];
  onSelectSuggestion: (text: string) => void;
}

const SuggestionButtons: React.FC<SuggestionButtonsProps> = memo(({ suggestions, onSelectSuggestion }) => (
  <motion.div
    key="suggestions"
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    transition={{ duration: 0.25, ease: 'easeOut' }}
    className="mt-3 grid grid-cols-2 gap-2"
  >
    {suggestions.map((suggestion, suggestionIndex) => (
      <motion.button
        key={suggestionIndex}
        layout
        onClick={() => onSelectSuggestion(suggestion)}
        className="bg-primary-700 hover:bg-primary-600 rounded-lg px-2 py-1.5 text-xs text-center transition-colors border border-primary-600 hover:border-red-500 text-white cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.2, delay: suggestionIndex * 0.05 }}
      >
        {suggestion}
      </motion.button>
    ))}
  </motion.div>
));

SuggestionButtons.displayName = 'SuggestionButtons';

export default SuggestionButtons;

