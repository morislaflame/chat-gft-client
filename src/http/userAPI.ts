import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode";
import type { Reward } from '@/types/types';

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

export const getReferralInfo = async () => {
    const { data } = await $authHost.get('api/user/me/referral');
    return data;
};

export const getReferralLink = async (): Promise<string> => {
    const { data } = await $authHost.get('api/user/me/referral');
    return data.link;
};

export const setMyReferralCode = async (refCode: string): Promise<{ success: boolean; refCode: string; balance?: number }> => {
    const { data } = await $authHost.post('api/user/me/ref-code', { refCode });
    return data;
};

export const getEnergy = async (): Promise<number> => {
    const { data } = await $authHost.get('api/user/me/energy');
    return data.energy;
};


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
    await $authHost.post('api/user/me/onboarding', { seen: completed });
};

export const setSelectedHistoryName = async (historyName: string): Promise<{ success: boolean; selectedHistoryName: string }> => {
    const { data } = await $authHost.post('api/user/me/history', { historyName });
    return data;
};

export const markVideoAsSeen = async (historyName: string): Promise<{ success: boolean; hasVideoSeen: boolean }> => {
    const { data } = await $authHost.post('api/user/mark-video-seen', { historyName });
    return data;
};