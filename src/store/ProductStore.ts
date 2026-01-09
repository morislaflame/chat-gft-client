// src/store/ProductStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import type { Product } from "@/types/types";
import { getProducts, generateInvoice } from "@/http/productAPI";
import { getStore } from "./StoreProvider";
import { trackEvent } from "@/utils/analytics";

const tg = window.Telegram?.WebApp;
console.log("tg =>", tg);


export default class ProductStore {
  private _products: Product[] = [];
  private _loading = false;
  private _productLoadingStates: Map<number, boolean> = new Map();
  private _productsLoaded = false; // Флаг для отслеживания загрузки продуктов

  constructor() {
    makeAutoObservable(this);
  }

  setProducts(products: Product[]) {
    this._products = products;
  }
  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setProductLoading(productId: number, loading: boolean) {
    if (loading) {
      this._productLoadingStates.set(productId, true);
    } else {
      this._productLoadingStates.delete(productId);
    }
  }

  isProductLoading(productId: number): boolean {
    return this._productLoadingStates.has(productId);
  }

  // Загрузить товары
  async fetchProducts(forceReload = false) {
    // Проверяем, не загружены ли уже продукты
    if (!forceReload && this._productsLoaded && this._products.length > 0 && !this._loading) {
      // Продукты уже загружены, пропускаем загрузку
      return;
    }

    this.setLoading(true);
    try {
      const products = await getProducts();
      runInAction(() => {
        this._products = products;
        this._productsLoaded = true; // Отмечаем, что продукты загружены
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      runInAction(() => {
        this._loading = false;
      });
    }
  }

  // Купить товар (через Mini App)
  async buyProduct(productId: number) {
    this.setProductLoading(productId, true);
    try {
      const product = this._products.find((p) => p.id === productId) || null;
      trackEvent('store_purchase_start', { product_id: productId, method: 'telegram_stars' });
      trackEvent('stars_purchase_start', {
        offer_id: String(productId),
        price_stars: product?.starsPrice ?? null,
      });
      // 1) Запрос на сервер: получаем invoiceLink
      const invoiceLink = await generateInvoice(productId);
      console.log("invoiceLink =>", invoiceLink);

      // 2) Открываем окно оплаты через openInvoice
      try {
        tg?.openInvoice(invoiceLink, (status: string) => {
          console.log("status =>", status);
          if (status === "paid") {
            trackEvent('store_purchase_paid', { product_id: productId });
            trackEvent('stars_purchase_success', {
              offer_id: String(productId),
              price_stars: product?.starsPrice ?? null,
              currency: 'XTR',
              energy_granted: product?.energy ?? null,
            });
            getStore().user.fetchMyInfo();
          } else {
            trackEvent('store_purchase_result', { product_id: productId, status });
            trackEvent('stars_purchase_fail', {
              offer_id: String(productId),
              fail_reason: status,
            });
          }
        });
      } catch (error) {
        console.error("Error opening invoice:", error);
        trackEvent('store_purchase_failed', { product_id: productId, reason: 'open_invoice_failed' });
        trackEvent('stars_purchase_fail', { offer_id: String(productId), fail_reason: 'open_invoice_failed' });
      }
    } catch (error) {
      console.error("Error generating invoice or opening invoice:", error);
      trackEvent('store_purchase_failed', { product_id: productId, reason: 'invoice_generation_failed' });
      trackEvent('stars_purchase_fail', { offer_id: String(productId), fail_reason: 'invoice_generation_failed' });
    } finally {
      runInAction(() => {
        this.setProductLoading(productId, false);
      });
    }
  }

  get products() {
    return this._products;
  }
  get loading() {
    return this._loading;
  }
}
