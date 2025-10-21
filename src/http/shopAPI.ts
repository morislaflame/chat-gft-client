import type { StarsPackage } from "@/types/types";
import { $authHost } from "./index";

export const getStarsPackages = async (): Promise<StarsPackage[]> => {
    const { data } = await $authHost.get('api/payment/packages');
    return data;
};

export const purchaseStars = async (packageId: string): Promise<void> => {
    await $authHost.post('api/payment/create-stars-link', { packageId });
};

export const deductStars = async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    const { data } = await $authHost.post('api/user/me/deduct', { amount });
    return data;
};