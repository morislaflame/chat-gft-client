import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import Button from '@/components/ui/button';

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
                    <Button
                        key={index}
                        variant="default"
                        size="default"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex-shrink-0 m-2 text-left whitespace-normal text-balance"
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>
        </motion.div>
    );
});

export default Suggestions;
