import React from 'react';
import { motion } from 'motion/react';

interface SuggestionButtonProps {
    onClick: () => void;
    suggestionsCount?: number;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({ onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className="relative w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-full transition"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <i className="fas fa-lightbulb text-white text-sm"></i>
            {/* {suggestionsCount && suggestionsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-red-900">
                    {suggestionsCount}
                </span>
            )} */}
        </motion.button>
    );
};

export default SuggestionButton;

