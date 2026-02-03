import React from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';

interface SuggestionButtonProps {
    onClick: () => void;
    suggestionsCount?: number;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ onClick }) => {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="shrink-0"
        >
            <Button
                type="button"
                variant="gradient"
                size="sm"
                icon="fas fa-lightbulb"
                onClick={onClick}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-0"
            />
        </motion.div>
    );
};

export default SuggestionButton;

