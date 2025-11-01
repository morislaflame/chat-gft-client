import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from 'mobx-react-lite';

interface SuggestionsProps {
    suggestions: string[];
    onSelectSuggestion: (text: string) => void;
    showButton?: boolean; // Для показа кнопки отдельно
    showList?: boolean; // Для показа ленты отдельно
    isExpanded?: boolean; // Внешнее управление состоянием
    onToggle?: () => void; // Колбэк для изменения состояния
}

const Suggestions: React.FC<SuggestionsProps> = observer(({ 
    suggestions, 
    onSelectSuggestion, 
    showButton = true,
    showList = true,
    isExpanded: externalIsExpanded,
    onToggle: externalOnToggle
}) => {
    const [internalIsExpanded, setInternalIsExpanded] = useState(false);
    
    // Используем внешнее состояние если передано, иначе внутреннее
    const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;

    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    const toggleExpanded = () => {
        if (externalOnToggle) {
            externalOnToggle();
        } else {
            setInternalIsExpanded(!isExpanded);
        }
    };

    const handleSuggestionClick = (text: string) => {
        onSelectSuggestion(text);
        if (externalOnToggle) {
            externalOnToggle();
        } else {
            setInternalIsExpanded(false);
        }
    };

    return (
        <>
            {/* Кнопка-кружочек (fixed справа внизу) */}
            {showButton && (
                <div className="fixed bottom-20 right-4 z-50">
                    <motion.button
                        onClick={toggleExpanded}
                        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <i className="fas fa-lightbulb text-white text-lg"></i>
                        {/* {suggestions.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-red-900">
                                {suggestions.length}
                            </span>
                        )} */}
                    </motion.button>
                </div>
            )}

            {/* Раскрывающаяся лента подсказок (под прогрессбаром или рядом с кнопкой) */}
            {showList && (
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="max-w-full overflow-x-hidden"
                        >
                            
                            <div className="flex w-full overflow-x-auto pb-2 scrollbar-thin">
                                {suggestions.map((suggestion, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="flex-shrink-0 bg-primary-700 hover:bg-primary-600 rounded-lg px-4 py-2 text-sm m-2 text-left transition-colors whitespace-nowrap border border-primary-600 hover:border-red-500"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <span className="text-white">{suggestion}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
});

export default Suggestions;
