import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

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
      <Button
        key={suggestionIndex}
        variant="default"
        size="sm"
        onClick={() => onSelectSuggestion(suggestion)}
        className="rounded-lg px-2 py-auto text-xs text-center whitespace-normal h-full min-h-0"
      >
        {suggestion}
      </Button>
    ))}
  </motion.div>
));

SuggestionButtons.displayName = 'SuggestionButtons';

export default SuggestionButtons;

