// src/http/productAPI.ts
import { $authHost } from "./index";
import type { Product } from "@/types/types";

// Получить все товары
export const getProducts = async (): Promise<Product[]> => {
  const { data } = await $authHost.get("/api/product/all");
  return data;
};


// Сгенерировать invoice link для покупки
export const generateInvoice = async (productId: number) => {
  // Сервер вернёт { invoiceLink: string }
  const { data } = await $authHost.post("/api/payment/generate-invoice", { productId });
  return data.invoiceLink as string;
};
