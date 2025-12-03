import { useContext } from 'react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { translate } from '@/utils/translations';

export const useTranslate = () => {
  const { user } = useContext(Context) as IStoreContext;
  
  // Используем язык из user.user?.language если доступен, иначе из user.language
  const language = (user.user?.language || user.language) as 'ru' | 'en';
  
  const t = (key: string) => {
    return translate(key, language);
  };
  
  return { t, language };
};