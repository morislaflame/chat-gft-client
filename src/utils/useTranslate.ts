import { useCallback, useContext, useMemo } from 'react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { translate } from '@/utils/translations';

export const useTranslate = () => {
  const { user } = useContext(Context) as IStoreContext;
  
  // Используем язык из user.user?.language если доступен, иначе из user.language
  const language = useMemo(
    () => (user.user?.language || user.language) as 'ru' | 'en',
    [user.user?.language, user.language]
  );

  const t = useCallback((key: string) => translate(key, language), [language]);

  const pick = useCallback(
    (value: { ru?: string | null; en?: string | null } | null | undefined, fallback = "") => {
      if (!value) return fallback;
      const selected = language === "en" ? value.en : value.ru;
      return selected ?? fallback;
    },
    [language]
  );

  return useMemo(() => ({ t, language, pick }), [t, language, pick]);
};