import {makeAutoObservable, runInAction } from "mobx";
import { fetchMyInfo, telegramAuth, check, getEnergy, getReferralInfo, getReferralLink, getRewards, getOnboarding, setOnboarding, } from "@/http/userAPI";
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
    _language: 'ru' | 'en' = 'ru';
    _showOnboarding = false;
    _onboardingInitialStep: 'welcome' | 'select' = 'welcome';

    constructor() {
        // Инициализируем язык из localStorage при создании store
        const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' | null;
        if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
            this._language = savedLanguage;
        }
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

    setSelectedHistoryName(historyName: string) {
        // Обновляем selectedHistoryName в объекте пользователя, если он существует
        if (this._user) {
            this._user = { ...this._user, selectedHistoryName: historyName };
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

    setLanguage(lang: 'ru' | 'en') {
        this._language = lang;
        localStorage.setItem('language', lang);
        // Обновляем язык в объекте пользователя, если он существует
        if (this._user) {
            this._user = { ...this._user, language: lang };
        }
    }

    async changeLanguage(lang: 'ru' | 'en') {
        try {
            runInAction(() => {
                this.setLanguage(lang);
            });
        } catch (error) {
            console.error("Error changing language:", error);
        }
    }

    // Получаем язык из Telegram language_code и конвертируем в наш формат
    private normalizeLanguage(languageCode: string | null | undefined): 'ru' | 'en' {
        if (!languageCode) return 'en';
        // Конвертируем язык Telegram в наш формат (ru или en)
        const lang = languageCode.toLowerCase().split('-')[0];
        return lang === 'ru' ? 'ru' : 'en';
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
            
            // Получаем язык из Telegram или используем сохраненный
            const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' | null;
            const userLanguage: 'ru' | 'en' = savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en') 
                ? savedLanguage 
                : this.normalizeLanguage((data as UserInfo).language);
            
            // Если языка нет в localStorage, сохраняем язык из Telegram
            if (!savedLanguage) {
                localStorage.setItem('language', userLanguage);
            }
            
            runInAction(() => {
                this.setLanguage(userLanguage);
                this.setUser({ ...(data as UserInfo), language: userLanguage });
                this.setIsAuth(true);
                this.setServerError(false);
            });
            // Загружаем полную информацию о пользователе после аутентификации
            await this.fetchMyInfo();
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
            // Загружаем полную информацию о пользователе после проверки аутентификации
            await this.fetchMyInfo();
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
            
            // Используем язык из данных пользователя или из localStorage
            const userLanguage = (data as UserInfo).language || this._language;
            const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' | null;
            const finalLanguage = savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en') 
                ? savedLanguage 
                : this.normalizeLanguage(userLanguage);
            
            runInAction(() => {
                this.setLanguage(finalLanguage);
                this.setUser({ 
                    ...data as UserInfo, 
                    language: finalLanguage,
                    referrals: referralInfo.referrals || [],
                    referralCount: referralInfo.referralCount || 0,
                    lastBonuses: referralInfo.lastBonuses || []
                });
                if (data.energy !== undefined) {
                    this.setEnergy(data.energy);
                }
                // Проверяем, нужно ли показать онбординг после загрузки данных пользователя
                if (!this._user?.onboardingSeen) {
                    this._showOnboarding = true;
                    this._onboardingInitialStep = 'welcome';
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
                    this.setUser({ ...this._user!, onboardingSeen: completed });
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
    
    get language() {
        return this._language;
    }

    // Онбординг
    get shouldShowOnboarding() {
        // Показываем онбординг если пользователь авторизован, но онбординг не просмотрен
        return this._isAuth && this._user !== null && !this._user.onboardingSeen;
    }

    get showOnboarding() {
        return this._showOnboarding;
    }

    get onboardingInitialStep() {
        return this._onboardingInitialStep;
    }

    setShowOnboarding(show: boolean) {
        this._showOnboarding = show;
    }

    setOnboardingInitialStep(step: 'welcome' | 'select') {
        this._onboardingInitialStep = step;
    }

    openHistorySelection() {
        this._onboardingInitialStep = 'select';
        this._showOnboarding = true;
    }

    async completeOnboarding() {
        try {
            // Обновляем onboardingSeen на сервере и в локальном состоянии
            // await this.updateOnboarding(true);
            runInAction(() => {
                this._showOnboarding = false;
                this._onboardingInitialStep = 'welcome';
            });
        } catch (error) {
            console.error("Error completing onboarding:", error);
            // Даже при ошибке скрываем онбординг, чтобы пользователь мог продолжить
            runInAction(() => {
                this._showOnboarding = false;
                this._onboardingInitialStep = 'welcome';
            });
        }
    }
}
