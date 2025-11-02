import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';

interface SuggestionsProps {
    suggestions: string[];
    onSelectSuggestion: (text: string) => void;
    isExpanded?: boolean; // Внешнее управление состоянием
    onToggle?: () => void; // Колбэк для изменения состояния
}

const Suggestions: React.FC<SuggestionsProps> = observer(({ 
    suggestions, 
    onSelectSuggestion, 
    isExpanded: externalIsExpanded,
    onToggle: externalOnToggle
}) => {
    const [internalIsExpanded, setInternalIsExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0);
    
    // Используем внешнее состояние если передано, иначе внутреннее
    const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;

    // Измеряем высоту контента для анимации
    useEffect(() => {
        if (contentRef.current) {
            if (isExpanded) {
                // Когда раскрывается, устанавливаем точную высоту для анимации
                const measuredHeight = contentRef.current.scrollHeight;
                setHeight(measuredHeight);
            } else {
                // Когда сворачивается, устанавливаем высоту 0
                setHeight(0);
            }
        }
    }, [isExpanded]);

    // При изменении подсказок, если они развернуты, обновляем высоту
    useEffect(() => {
        if (contentRef.current && isExpanded) {
            const measuredHeight = contentRef.current.scrollHeight;
            setHeight(measuredHeight);
        } else if (!isExpanded) {
            setHeight(0);
        }
    }, [suggestions, isExpanded]);

    // Если нет подсказок, не рендерим ничего
    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    const handleSuggestionClick = (text: string) => {
        onSelectSuggestion(text);
        if (externalOnToggle) {
            externalOnToggle();
        } else {
            setInternalIsExpanded(false);
        }
    };

    return (
        <motion.div
            animate={{ height }}
            initial={{ height: 0 }}
            transition={{ type: "keyframes", stiffness: 300, damping: 25 }}
            style={{ overflow: 'hidden' }}
            className="max-w-full overflow-x-hidden"
        >
            <div ref={contentRef} className="flex w-full overflow-x-auto scrollbar-thin">
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
    );
});

export default Suggestions;
