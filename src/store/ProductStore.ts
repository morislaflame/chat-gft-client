// src/store/ProductStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import type { Product } from "@/types/types";
import { getProducts, generateInvoice } from "@/http/productAPI";
import { getStore } from "./StoreProvider";

const tg = window.Telegram?.WebApp;
console.log("tg =>", tg);


export default class ProductStore {
  private _products: Product[] = [];
  private _loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setProducts(products: Product[]) {
    this._products = products;
  }
  setLoading(loading: boolean) {
    this._loading = loading;
  }

  // Загрузить товары
  async fetchProducts() {
    this.setLoading(true);
    try {
      const products = await getProducts();
      runInAction(() => {
        this._products = products;
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
    this.setLoading(true);
    try {
      // 1) Запрос на сервер: получаем invoiceLink
      const invoiceLink = await generateInvoice(productId);
      console.log("invoiceLink =>", invoiceLink);

      // 2) Открываем окно оплаты через openInvoice
      try {
        tg?.openInvoice(invoiceLink, (status: string) => {
          console.log("status =>", status);
          if (status === "paid") {
            getStore().user.fetchMyInfo();
          }
        });
      } catch (error) {
        console.error("Error opening invoice:", error);
      }
    } catch (error) {
      console.error("Error generating invoice or opening invoice:", error);
    } finally {
      runInAction(() => {
        this._loading = false;
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
