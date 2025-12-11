import { makeAutoObservable } from "mobx";
import { getStarsPackages, purchaseStars, deductStars } from "@/http/shopAPI";
import type { StarsPackage } from "@/types/types";

export default class ShopStore {
    _packages: StarsPackage[] = [];
    _loading = false;
    _error = '';
    _purchasing = false;
    _packagesLoaded = false; // Флаг для отслеживания загрузки пакетов

    constructor() {
        makeAutoObservable(this);
    }

    setPackages(packages: StarsPackage[]) {
        this._packages = packages;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setPurchasing(purchasing: boolean) {
        this._purchasing = purchasing;
    }

    setError(error: string) {
        this._error = error;
    }

    async loadPackages(forceReload = false) {
        // Проверяем, не загружены ли уже пакеты
        if (!forceReload && this._packagesLoaded && this._packages.length > 0 && !this._loading) {
            // Пакеты уже загружены, пропускаем загрузку
            return;
        }

        this.setLoading(true);
        this.setError('');

        try {
            const packages = await getStarsPackages();
            this.setPackages(packages);
            this._packagesLoaded = true; // Отмечаем, что пакеты загружены
        } catch (error) {
            console.error('Error loading packages:', error);
            this.setError('Error loading packages');
        } finally {
            this.setLoading(false);
        }
    }

    async purchasePackage(packageId: string) {
        this.setPurchasing(true);
        this.setError('');

        try {
            await purchaseStars(packageId);
            // После успешной покупки можно обновить баланс пользователя
            return { success: true };
        } catch (error) {
            console.error('Error purchasing package:', error);
            this.setError('Error processing purchase. Please try again.');
            return { success: false, error: this._error };
        } finally {
            this.setPurchasing(false);
        }
    }

    async deductStars(amount: number) {
        try {
            const result = await deductStars(amount);
            return result;
        } catch (error) {
            console.error('Error deducting stars:', error);
            this.setError('Error processing payment. Please try again.');
            return { success: false, newEnergy: 0 };
        }
    }

    getPackageById(id: string) {
        return this._packages.find(pkg => pkg.id === id);
    }

    getPopularPackages() {
        return this._packages.filter(pkg => pkg.popular);
    }

    get packages() {
        return this._packages;
    }

    get loading() {
        return this._loading;
    }

    get purchasing() {
        return this._purchasing;
    }

    get error() {
        return this._error;
    }
}
