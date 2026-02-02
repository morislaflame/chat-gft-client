import { makeAutoObservable, runInAction } from 'mobx';
import { caseAPI, type CaseBox, type OpenCaseResponse, type PurchaseCaseResponse, type UserCase } from '@/http/caseAPI';
import type UserStore from '@/store/UserStore';
import { trackEvent } from '@/utils/analytics';
import type RewardStore from '@/store/RewardStore';
import type { Reward } from '@/http/rewardAPI';

class CaseStore {
  activeCases: CaseBox[] = [];
  myUnopenedCases: UserCase[] = [];
  loading = false;
  error: string | null = null;

  private _activeLoaded = false;
  private _unopenedLoaded = false;
  private _userStore: UserStore | null = null;
  private _rewardStore: RewardStore | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUserStore(userStore: UserStore) {
    this._userStore = userStore;
  }

  setRewardStore(rewardStore: RewardStore) {
    this._rewardStore = rewardStore;
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
      trackEvent('case_purchase_attempt', { case_id: caseId, quantity });
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
      trackEvent('case_purchase', {
        case_id: caseId,
        quantity,
        new_balance: response.newBalance,
      });
      // Treat buying boxes as spending gems
      const price = (this.activeCases.find((c) => c.id === caseId)?.price ?? null);
      if (price !== null) {
        trackEvent('gems_spent', {
          amount: price * quantity,
          balance_after: response.newBalance,
          sink: 'box',
        });
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
      trackEvent('case_purchase_failed', { case_id: caseId, quantity, reason: this.error || 'unknown' });
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Add unopened cases immediately without refetch (e.g. awarded from missions/daily rewards)
  addUnopenedCasesFromExternal(userCases: Array<Pick<UserCase, 'id' | 'userId' | 'caseId' | 'isOpened'> & Partial<UserCase>>) {
    if (!userCases || userCases.length === 0) return;
    const normalized: UserCase[] = userCases.map((uc) => ({
      id: uc.id,
      userId: uc.userId,
      caseId: uc.caseId,
      isOpened: uc.isOpened ?? false,
      resultType: (uc as UserCase).resultType ?? null,
      resultRewardId: (uc as UserCase).resultRewardId ?? null,
      createdAt: uc.createdAt,
      updatedAt: uc.updatedAt,
      case: uc.case,
    }));

    const existingIds = new Set(this.myUnopenedCases.map((c) => c.id));
    const toAdd = normalized.filter((c) => !existingIds.has(c.id));
    if (toAdd.length === 0) return;

    this.myUnopenedCases = [...toAdd, ...this.myUnopenedCases];
    this._unopenedLoaded = true;
  }

  private applyOpenCaseEffects(response: OpenCaseResponse) {
    if (this._userStore) {
      this._userStore.setBalance(response.balance);
      this._userStore.setEnergy(response.energy);
    }

    // If a reward dropped, add it to RewardStore so it appears in "My rewards" without refetch.
    if (response.result.type === 'reward' && this._rewardStore && this._userStore?.user) {
      const nowIso = new Date().toISOString();
      const r = response.result.reward;
      const rewardFull: Reward = {
        id: r.id,
        name: r.name,
        price: r.price ?? 0,
        description: r.description,
        isActive: r.isActive ?? true,
        previewId: r.previewId ?? null,
        createdAt: nowIso,
        updatedAt: nowIso,
        mediaFile: r.mediaFile,
        preview: r.preview,
      };
      this._rewardStore.addPurchaseFromCase({
        userRewardId: response.result.userRewardId,
        userId: this._userStore.user.id,
        reward: rewardFull,
        purchasePrice: rewardFull.price,
        purchaseDate: nowIso,
      });
    }
  }

  async openCase(
    userCaseId: number,
    opts?: { deferEffects?: boolean }
  ): Promise<OpenCaseResponse | null> {
    this.loading = true;
    this.error = null;
    try {
      const userCase = this.myUnopenedCases.find((c) => c.id === userCaseId) || null;
      const boxId = userCase?.caseId ?? null;
      trackEvent('case_open_attempt', { user_case_id: userCaseId });
      trackEvent('box_open_start', {
        box_id: boxId,
        balance_before: this._userStore?.user?.balance ?? null,
      });
      const response = await caseAPI.openCase(userCaseId);
      runInAction(() => {
        this.myUnopenedCases = this.myUnopenedCases.filter((c) => c.id !== userCaseId);
      });
      if (!opts?.deferEffects) {
        this.applyOpenCaseEffects(response);
      }
      trackEvent('case_open', {
        user_case_id: userCaseId,
        result_type: response.result?.type || 'unknown',
      });

      const droppedRewardPrice =
        response.result.type === 'reward' ? (response.result.reward.price ?? null) : null;
      const droppedRewardId =
        response.result.type === 'reward' ? (response.result.reward.id ?? null) : null;

      trackEvent('box_open_result', {
        box_id: boxId,
        reward_type: response.result?.type || 'unknown',
        reward_amount: droppedRewardPrice,
        nft_id: droppedRewardId,
      });

      // If result is energy/gems, it’s also an "earned" event.
      if (response.result?.type === 'gems' && typeof response.result.amount === 'number') {
        trackEvent('gems_earned', {
          amount: response.result.amount,
          balance_after: response.balance,
          source: 'box',
        });
      }
      if (response.result?.type === 'energy' && typeof response.result.amount === 'number') {
        trackEvent('energy_refill', {
          amount: response.result.amount,
          balance_after: response.energy,
          method: 'box',
        });
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
      trackEvent('case_open_failed', { user_case_id: userCaseId, reason: this.error || 'unknown' });
      return null;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Use this when you called openCase(..., { deferEffects: true })
  applyDeferredOpenCaseEffects(response: OpenCaseResponse) {
    this.applyOpenCaseEffects(response);
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

