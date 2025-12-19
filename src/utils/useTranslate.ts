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

  return useMemo(() => ({ t, language }), [t, language]);
};