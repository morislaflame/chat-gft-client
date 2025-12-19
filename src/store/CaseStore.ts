import { makeAutoObservable, runInAction } from 'mobx';
import { caseAPI, type CaseBox, type OpenCaseResponse, type PurchaseCaseResponse, type UserCase } from '@/http/caseAPI';
import type UserStore from '@/store/UserStore';

class CaseStore {
  activeCases: CaseBox[] = [];
  myUnopenedCases: UserCase[] = [];
  loading = false;
  error: string | null = null;

  private _activeLoaded = false;
  private _unopenedLoaded = false;
  private _userStore: UserStore | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUserStore(userStore: UserStore) {
    this._userStore = userStore;
  }

  async fetchActiveCases(forceReload = false) {
    if (!forceReload && this._activeLoaded && this.activeCases.length > 0 && !this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      const cases = await caseAPI.getActiveCases();
      runInAction(() => {
        this.activeCases = cases;
        this._activeLoaded = true;
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to load cases';
      runInAction(() => {
        this.error = errorMessage || 'Failed to load cases';
      });
      console.error('Error fetching active cases:', error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async fetchMyUnopenedCases(forceReload = false) {
    if (!forceReload && this._unopenedLoaded && !this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      const userCases = await caseAPI.getMyUnopenedCases();
      runInAction(() => {
        this.myUnopenedCases = userCases;
        this._unopenedLoaded = true;
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to load your cases';
      runInAction(() => {
        this.error = errorMessage || 'Failed to load your cases';
      });
      console.error('Error fetching unopened cases:', error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async purchaseCase(caseId: number, quantity = 1): Promise<PurchaseCaseResponse | null> {
    this.loading = true;
    this.error = null;
    try {
      const response = await caseAPI.purchaseCase(caseId, quantity);
      runInAction(() => {
        const created = response.userCases?.length
          ? response.userCases
          : response.userCase
            ? [response.userCase]
            : [];
        this.myUnopenedCases = [...created, ...this.myUnopenedCases];
        this._unopenedLoaded = true;
      });
      if (this._userStore) {
        this._userStore.setBalance(response.newBalance);
      }
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to purchase case';
      runInAction(() => {
        this.error = errorMessage || 'Failed to purchase case';
      });
      console.error('Error purchasing case:', error);
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async openCase(userCaseId: number): Promise<OpenCaseResponse | null> {
    this.loading = true;
    this.error = null;
    try {
      const response = await caseAPI.openCase(userCaseId);
      runInAction(() => {
        this.myUnopenedCases = this.myUnopenedCases.filter((c) => c.id !== userCaseId);
      });
      if (this._userStore) {
        this._userStore.setBalance(response.balance);
        this._userStore.setEnergy(response.energy);
      }
      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to open case';
      runInAction(() => {
        this.error = errorMessage || 'Failed to open case';
      });
      console.error('Error opening case:', error);
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  reset() {
    this.activeCases = [];
    this.myUnopenedCases = [];
    this.loading = false;
    this.error = null;
    this._activeLoaded = false;
    this._unopenedLoaded = false;
  }
}

export default CaseStore;

