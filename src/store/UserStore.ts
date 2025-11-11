import {makeAutoObservable, runInAction } from "mobx";
import { fetchMyInfo, telegramAuth, check, getEnergy, getReferralInfo, getReferralLink, getRewards, getLanguage, setLanguage, getOnboarding, setOnboarding } from "@/http/userAPI";
import { type Referral, type Reward, type UserInfo } from "@/types/types";

export default class UserStore {
    _user: UserInfo | null = null;
    _isAuth = false;
    _users: UserInfo[] = [];
    _loading = false;
    _energy = 0;
    _referrals: Referral[] = [];
    _referralLink = '';
    _rewards: Reward[] = [];
    isTooManyRequests = false;
    isServerError = false;
    serverErrorMessage = '';

    constructor() {
        makeAutoObservable(this);
    }

    setIsAuth(bool: boolean) {
        this._isAuth = bool;
    }

    setUser(user: UserInfo | null) {
        this._user = user;
    }

    setUsers(users: UserInfo[]) {
        this._users = users;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setTooManyRequests(flag: boolean) {
        this.isTooManyRequests = flag;
    }

    setServerError(flag: boolean, message: string = '') {
        this.isServerError = flag;
        this.serverErrorMessage = message;
    }

    setEnergy(energy: number) {
        this._energy = energy;
        // Также обновляем энергию в объекте пользователя, если он существует
        if (this._user) {
            this._user = { ...this._user, energy };
        }
    }

    setBalance(balance: number) {
        // Обновляем баланс в объекте пользователя, если он существует
        if (this._user) {
            this._user = { ...this._user, balance };
        }
    }

    setReferrals(referrals: Referral[]) {
        this._referrals = referrals;
    }

    setReferralLink(link: string) {
        this._referralLink = link;
    }

    setRewards(rewards: Reward[]) {
        this._rewards = rewards;
    }

    async logout() {
        try {
            this.setIsAuth(false);
            this.setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    async telegramLogin(initData: string) {
        try {
            const data = await telegramAuth(initData);
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error) {
            console.error("Error during Telegram authentication:", error);
            this.setServerError(true, 'Server is not responding. Please try again later.');
        }
    }
    
    async checkAuth() {
        try {
            const data = await check();
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
            });
        } catch (error) {
            console.error("Error during auth check:", error);
            runInAction(() => {
                this.setIsAuth(false);
                this.setUser(null);
                this.setServerError(true, 'Server is not responding. Please try again later.');
            });
        }
    }

    async fetchMyInfo() {
        try {
            const data = await fetchMyInfo();
            // Также загружаем информацию о рефералах для получения referralCount и lastBonuses
            const referralInfo = await getReferralInfo();
            runInAction(() => {
                this.setUser({ 
                    ...data as UserInfo, 
                    referrals: referralInfo.referrals || [],
                    referralCount: referralInfo.referralCount || 0,
                    lastBonuses: referralInfo.lastBonuses || []
                });
                if (data.energy !== undefined) {
                    this.setEnergy(data.energy);
                }
            });
            
        } catch (error) {
            console.error("Error during fetching my info:", error);
        }
    }

    async loadEnergy() {
        try {
            const energy = await getEnergy();
            runInAction(() => {
                this.setEnergy(energy);
            });
        } catch (error) {
            console.error("Error loading energy:", error);
        }
    }


    async loadReferralLink() {
        try {
            const link = await getReferralLink();
            runInAction(() => {
                this.setReferralLink(link);
            });
        } catch (error) {
            console.error("Error loading referral link:", error);
        }
    }

    async loadRewards() {
        try {
            const rewards = await getRewards();
            runInAction(() => {
                this.setRewards(rewards);
            });
        } catch (error) {
            console.error("Error loading rewards:", error);
        }
    }


    async loadLanguage() {
        try {
            const language = await getLanguage();
            if (this._user) {
                runInAction(() => {
                    this.setUser({ ...this._user!, language: language as 'en' | 'ru' });
                });
            }
        } catch (error) {
            console.error("Error loading language:", error);
        }
    }

    async updateLanguage(language: 'en' | 'ru') {
        try {
            await setLanguage(language);
            if (this._user) {
                runInAction(() => {
                    this.setUser({ ...this._user!, language });
                });
            }
        } catch (error) {
            console.error("Error updating language:", error);
        }
    }

    async loadOnboarding() {
        try {
            const completed = await getOnboarding();
            if (this._user) {
                runInAction(() => {
                    this.setUser({ ...this._user!, onboardingCompleted: completed });
                });
            }
        } catch (error) {
            console.error("Error loading onboarding:", error);
        }
    }

    async updateOnboarding(completed: boolean) {
        try {
            await setOnboarding(completed);
            if (this._user) {
                runInAction(() => {
                    this.setUser({ ...this._user!, onboardingCompleted: completed });
                });
            }
        } catch (error) {
            console.error("Error updating onboarding:", error);
        }
    }

    get users() {
        return this._users;
    }

    get isAuth() {
        return this._isAuth
    }

    get user() {
        return this._user
    }

    get loading() {
        return this._loading;
    }

    get energy() {
        return this._energy;
    }

    get referrals() {
        return this._referrals;
    }

    get referralLink() {
        return this._referralLink;
    }

    get rewards() {
        return this._rewards;
    }
    
}
