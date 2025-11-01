/**
 * Удаляет варианты ответов (A), B), C) и т.д.) из текста ответа AI
 * @param text Текст для очистки
 * @returns Очищенный текст
 */
export const cleanAiResponse = (text: string): string => {
    if (!text) return text;

    let cleaned = text;
    
    // Ищем "Выбор:" в тексте (с учетом регистра и пробелов)
    const choiceIndex = cleaned.search(/Выбор\s*:?\s*/i);
    
    if (choiceIndex !== -1) {
        // Обрезаем текст до "Выбор:"
        cleaned = cleaned.substring(0, choiceIndex).trim();
    }
    
    // Дополнительно удаляем варианты ответов в формате A) B) C) или А) Б) В)
    // которые могут остаться если "Выбор:" не было найдено
    const optionsPattern = /\s*[A-ZА-Я]\)\s+[^\n]*(\n\s*[A-ZА-Я]\)\s+[^\n]*)*/gi;
    cleaned = cleaned.replace(optionsPattern, '').trim();
    
    // Удаляем отдельные варианты в конце строк
    cleaned = cleaned.replace(/\s*[A-ZА-Я]\)\s+[^\n]*/g, '').trim();
    
    // Удаляем пустые строки в конце
    cleaned = cleaned.replace(/\n\s*$/g, '').trim();
    
    return cleaned;
};

