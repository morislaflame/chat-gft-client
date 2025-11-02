import React from 'react';

interface FormattedTextProps {
    text: string;
}

/**
 * Компонент для форматирования текста сообщения:
 * - Обрабатывает \n\n как разрывы параграфов
 * - Обрабатывает \n как переносы строк
 * - Обрабатывает **текст** как жирный текст
 */
const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
    if (!text) return null;

    // Разбиваем текст на параграфы по \n\n
    const paragraphs = text.split(/\n\n/);
    
    return (
        <>
            {paragraphs.map((paragraph, paragraphIndex) => (
                <React.Fragment key={`paragraph-${paragraphIndex}`}>
                    {paragraphIndex > 0 && <div className="mb-3" />}
                    
                    {paragraph.split('\n').map((line, lineIndex) => {
                        // Обрабатываем жирный текст **текст**
                        const parts: React.ReactNode[] = [];
                        let currentIndex = 0;
                        const boldRegex = /\*\*(.+?)\*\*/g;
                        let match;
                        let keyCounter = 0;
                        
                        while ((match = boldRegex.exec(line)) !== null) {
                            // Добавляем текст до жирного фрагмента
                            if (match.index > currentIndex) {
                                parts.push(
                                    <span key={`text-${paragraphIndex}-${lineIndex}-${keyCounter++}`}>
                                        {line.substring(currentIndex, match.index)}
                                    </span>
                                );
                            }
                            
                            // Добавляем жирный текст
                            parts.push(
                                <strong key={`bold-${paragraphIndex}-${lineIndex}-${keyCounter++}`} className="font-bold">
                                    {match[1]}
                                </strong>
                            );
                            
                            currentIndex = match.index + match[0].length;
                        }
                        
                        // Добавляем оставшийся текст после последнего жирного фрагмента
                        if (currentIndex < line.length) {
                            parts.push(
                                <span key={`text-end-${paragraphIndex}-${lineIndex}-${keyCounter++}`}>
                                    {line.substring(currentIndex)}
                                </span>
                            );
                        }
                        
                        // Если не было жирного текста, просто добавляем весь текст
                        if (parts.length === 0) {
                            parts.push(
                                <span key={`text-plain-${paragraphIndex}-${lineIndex}`}>
                                    {line}
                                </span>
                            );
                        }
                        
                        return (
                            <React.Fragment key={`line-${paragraphIndex}-${lineIndex}`}>
                                {lineIndex > 0 && <br />}
                                {parts}
                            </React.Fragment>
                        );
                    })}
                </React.Fragment>
            ))}
        </>
    );
};

export default FormattedText;

