import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode";
import type { Reward, Referral } from '@/types/types';

export const telegramAuth = async (initData: string) => {
    const { data } = await $host.post('api/user/auth/telegram', { initData });
    localStorage.setItem('token', data.token);
    return {
        ...jwtDecode(data.token),
    };
};

export const registration = async (email: string, password: string) => {
    const { data } = await $host.post('api/user/registration', { email, password });
    localStorage.setItem('token', data.token);
    return {
        ...jwtDecode(data.token),
    };
};

export const login = async (email: string, password: string) => {
    const { data } = await $host.post('api/user/login', { email, password });
    localStorage.setItem('token', data.token);
    return {
        ...jwtDecode(data.token),
    };
};

export const check = async () => {
    const {data} = await $authHost.get('api/user/auth')
    localStorage.setItem('token', data.token)
    return {
        ...jwtDecode(data.token),
    };
}

export const fetchMyInfo = async () => {
    const { data } = await $authHost.get('api/user/me');
    return data;
};

export const getRewards = async (): Promise<Reward[]> => {
    const { data } = await $authHost.get('api/user/me/rewards');
    return data;
};

export const getReferrals = async (): Promise<Referral[]> => {
    const { data } = await $authHost.get('api/user/me/referral');
    return data;
};

export const getReferralLink = async (): Promise<string> => {
    const { data } = await $authHost.get('api/user/me/referral');
    return data.link;
};

export const getBalance = async (): Promise<number> => {
    const { data } = await $authHost.get('api/user/me/balance');
    return data.balance;
};

// deductBalance function removed - balance deduction is now handled in message processing

export const getLanguage = async (): Promise<string> => {
    const { data } = await $authHost.get('api/user/me/language');
    return data.language;
};

export const setLanguage = async (language: string): Promise<void> => {
    await $authHost.post('api/user/me/language', { language });
};

export const getOnboarding = async (): Promise<boolean> => {
    const { data } = await $authHost.get('api/user/me/onboarding');
    return data.completed;
};

export const setOnboarding = async (completed: boolean): Promise<void> => {
    await $authHost.post('api/user/me/onboarding', { completed });
};
