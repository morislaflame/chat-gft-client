import { createContext, useState, useEffect, type ReactNode } from "react";
import LoadingIndicator from "../components/LoadingIndicator";
import UserStore from "@/store/UserStore";
import ChatStore from "@/store/ChatStore";
import QuestStore from "@/store/QuestStore";
import ShopStore from "@/store/ShopStore";
import ProductStore from "@/store/ProductStore";
// Определяем интерфейс для нашего контекста
export interface IStoreContext {
  user: UserStore;
  chat: ChatStore;
  quest: QuestStore;
  shop: ShopStore;
  product: ProductStore;
}

let storeInstance: IStoreContext | null = null;

// Функция для получения экземпляра хранилища
export function getStore(): IStoreContext {
  if (!storeInstance) {
    throw new Error("Store not initialized");
  }
  return storeInstance;
}

// Создаем контекст с начальным значением null, но указываем правильный тип
export const Context = createContext<IStoreContext | null>(null);

// Добавляем типы для пропсов
interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<{
    user: UserStore;
    chat: ChatStore;
    quest: QuestStore;
    shop: ShopStore;
    product: ProductStore;
  } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const [
        { default: UserStore },
        { default: ChatStore },
        { default: QuestStore },
        { default: ShopStore },
        { default: ProductStore },
      ] = await Promise.all([
        import("@/store/UserStore"),
        import("@/store/ChatStore"),
        import("@/store/QuestStore"),
        import("@/store/ShopStore"),
        import("@/store/ProductStore"),
      ]);

      setStores({
        user: new UserStore(),
        chat: new ChatStore(),
        quest: new QuestStore(),
        shop: new ShopStore(),
        product: new ProductStore(),
      });
    };

    loadStores();
  }, []);

  if (!stores) {
    return <LoadingIndicator />; // Use custom loading indicator
  }

  // Сохраняем экземпляр хранилища для доступа из других модулей
  storeInstance = stores;

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
