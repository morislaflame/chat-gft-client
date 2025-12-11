import { useState, useEffect, useRef } from 'react';

interface MediaFile {
  url: string;
  mimeType: string;
}

/**
 * Хук для загрузки анимаций из медиафайлов
 * @param items - массив элементов, из которых нужно извлечь медиафайлы
 * @param getMediaFile - функция для получения mediaFile из элемента
 * @param deps - зависимости для перезагрузки анимаций
 * @returns массив с объектом анимаций { [url: string]: Record<string, unknown> }
 */
export const useAnimationLoader = <T>(
  items: T[],
  getMediaFile: (item: T) => MediaFile | null | undefined,
  deps: React.DependencyList = []
): [{ [url: string]: Record<string, unknown> }] => {
  const [animations, setAnimations] = useState<{ [url: string]: Record<string, unknown> }>({});
  const loadedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadAnimations = async () => {
      // Очищаем загруженные URL при изменении зависимостей
      loadedUrls.current.clear();
      setAnimations({});

      // Загружаем анимации параллельно, но обновляем состояние по мере загрузки
      const loadPromises = items.map(async (item) => {
        const mediaFile = getMediaFile(item);
        if (mediaFile && mediaFile.mimeType === 'application/json' && !loadedUrls.current.has(mediaFile.url)) {
          try {
            const response = await fetch(mediaFile.url);
            const data = await response.json();
            loadedUrls.current.add(mediaFile.url);
            // Обновляем состояние сразу после загрузки каждой анимации
            setAnimations(prev => ({ ...prev, [mediaFile.url]: data }));
          } catch (error) {
            console.error(`Error loading animation for ${mediaFile.url}:`, error);
          }
        }
      });

      // Запускаем все загрузки параллельно
      await Promise.all(loadPromises);
    };

    loadAnimations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ...deps]);

  return [animations];
};

