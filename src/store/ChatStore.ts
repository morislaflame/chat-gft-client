import { makeAutoObservable } from "mobx";
import {
    sendMessage as apiSendMessage,
    getChatHistory,
    getStatus,
    submitClientErrorReport as postClientErrorReport,
} from "@/http/chatAPI";
import { setSelectedChatMission } from "@/http/userAPI";
import { translate } from "@/utils/translations";
import type {
    Message,
    ChatSuggestion,
    ChatRetryPayload,
    ClientErrorReportPayload,
    ApiMessageResponse,
    StageRewardData,
    StepRewardData,
    CompanionData,
    FirstMissionArtifactData,
    MediaFile,
    Mission,
    MissionProgress,
} from "@/types/types";
import type UserStore from "@/store/UserStore";
import type CaseStore from "@/store/CaseStore";
import type { UserCase } from "@/http/caseAPI";
import { trackEvent } from "@/utils/analytics";
import { compareMissionsByStoryOrder } from "@/utils/missionStoryOrder";
import { isStoryLevelUnlocked } from "@/components/ProfilePageComponents/profileInventoryUtils";
import type { OpenStoryLevelPrompt } from "@/components/modals/OpenStoryLevelModal";

export default class ChatStore {
    _messages: Message[] = [];
    _isTyping = false;
    _currentStage = 1;
    _mission: string | null = null;
    _suggestions: ChatSuggestion[] = [];
    _suggestionsFormatError = false;
    _suggestionsFormatErrorReportContext: ClientErrorReportPayload | null = null;
    _artifactAction: ApiMessageResponse['artifactAction'] = null;
    _loading = false;
    /** Миссия, для которой сейчас грузится история (список миссий / смена треда) */
    _switchingMissionId: number | null = null;
    _error = '';
    _historyLoadFailed = false;
    _userStore: UserStore | null = null;
    _caseStore: CaseStore | null = null;
    _stageReward: StageRewardData | null = null;
    _openStoryLevelPrompt: OpenStoryLevelPrompt | null = null;
    _unlockedLevels: number[] = [1];
    _pendingOpenStoryLevel: number | null = null;
    /** Уровень, к первой миссии которого нужно прокрутить MissionPathScreen */
    _missionPathScrollToLevel: number | null = null;
    _stepReward: StepRewardData | null = null;
    _pendingCompanion: CompanionData | null = null;
    _pendingFirstMissionArtifact: FirstMissionArtifactData | null = null;
    _balanceBeforeReward: number | null = null;
    _pendingGemsOnLand: number | null = null;
    _pendingProgressAnimation: { from: number; to: number } | null = null;
    _insufficientEnergy = false;
    _insufficientGems = false;
    _video: MediaFile | null = null;
    _avatar: MediaFile | null = null;
    _background: MediaFile | null = null;
    _missions: Mission[] = [];
    _missionsProgress: MissionProgress[] = [];
    _selectedMissionId: number | null = null;
    _loadedHistoryName: string | null = null; // Отслеживаем для какой истории загружены данные
    _loadedMissionId: number | null = null;
    private _trackedMissionViews = new Set<string>();
    private _missionStartTs = new Map<number, number>();

    constructor(userStore?: UserStore) {
        makeAutoObservable(this);
        this._userStore = userStore || null;
    }

    setUserStore(userStore: UserStore) {
        this._userStore = userStore;
    }

    setCaseStore(caseStore: CaseStore) {
        this._caseStore = caseStore;
    }

    setMessages(messages: Message[]) {
        this._messages = messages;
    }

    addMessage(message: Message) {
        this._messages.push(message);
    }

    markMissionHasMessagesByOrder(orderIndex: number) {
        const mission = this._missions.find((m) => m.orderIndex === orderIndex);
        if (!mission) return;
        const targetMissionId = mission.id;
        this._messages = this._messages.map((m) => {
            if (m.isMissionCard && m.missionId === targetMissionId && !m.missionHasMessages) {
                return { ...m, missionHasMessages: true };
            }
            return m;
        });
    }

    markMissionHasMessagesByMissionId(missionId: number) {
        this._messages = this._messages.map((m) => {
            if (m.isMissionCard && m.missionId === missionId && !m.missionHasMessages) {
                return { ...m, missionHasMessages: true };
            }
            return m;
        });
    }

    private appendMissionCardIfNeeded(mission: Mission) {
        const existing = this._messages.some(
            (m) => m.isMissionCard && m.missionId === mission.id
        );
        if (existing) return;

        this._messages.push({
            id: `mission-${mission.id}-${Date.now()}`,
            text: '',
            isUser: false,
            timestamp: new Date(),
            isMissionCard: true,
            mission: {
                id: mission.id,
                title: mission.title,
                titleEn: mission.titleEn ?? null,
                description: mission.description,
                descriptionEn: mission.descriptionEn ?? null,
                orderIndex: mission.orderIndex,
            },
            missionId: mission.id,
            missionHasMessages: false,
        });

        // Track mission_view once per story+mission.
        const storyId = this._userStore?.user?.selectedHistoryName || "unknown";
        const key = `${storyId}:${mission.id}`;
        if (!this._trackedMissionViews.has(key)) {
            this._trackedMissionViews.add(key);
            trackEvent('mission_view', {
                story_id: storyId,
                mission_id: mission.id,
                mission_type: 'mission',
            });
        }
    }

    setIsTyping(isTyping: boolean) {
        this._isTyping = isTyping;
    }

    setCurrentStage(stage: number) {
        this._currentStage = stage;
    }

    setMission(mission: string | null) {
        this._mission = mission;
    }

    setStageReward(reward: StageRewardData | null) {
        this._stageReward = reward;
        if (reward?.isOpen) {
            this._balanceBeforeReward = this._userStore?.user?.balance ?? 0;
        }
    }

    setPendingGemsOnLand(amount: number) {
        this._pendingGemsOnLand = amount;
    }

    /** Перед анимацией полёта гема: фиксируем баланс «до» и сумму, которая прилетит в хэдер. */
    prepareGemsLanding(fromBalance: number, gemsAmount: number) {
        this._balanceBeforeReward = fromBalance;
        this._pendingGemsOnLand = gemsAmount;
    }

    onGemsLanded() {
        if (this._pendingGemsOnLand == null || this._balanceBeforeReward == null) return;
        const to = this._balanceBeforeReward + this._pendingGemsOnLand;
        if (this._userStore) {
            this._userStore.setBalance(to);
        }
        this._pendingProgressAnimation = { from: this._balanceBeforeReward, to };
        this._balanceBeforeReward = null;
        this._pendingGemsOnLand = null;
    }

    clearPendingProgressAnimation() {
        this._pendingProgressAnimation = null;
    }

    closeStageReward() {
        if (this._stageReward) {
            this._stageReward = { ...this._stageReward, isOpen: false };
        }
    }

    openOpenStoryLevelPrompt(prompt: OpenStoryLevelPrompt) {
        this._openStoryLevelPrompt = prompt;
    }

    closeOpenStoryLevelPrompt() {
        this._openStoryLevelPrompt = null;
    }

    setUnlockedLevels(levels: number[]) {
        const normalized = [...new Set(levels.filter((l) => Number.isFinite(l) && l >= 1))].sort(
            (a, b) => a - b,
        );
        this._unlockedLevels = normalized.length > 0 ? normalized : [1];
    }

    setPendingOpenStoryLevel(level: number | null) {
        this._pendingOpenStoryLevel =
            level != null && Number.isFinite(Number(level)) && Number(level) >= 2
                ? Number(level)
                : null;
    }

    setMissionPathScrollToLevel(level: number | null) {
        this._missionPathScrollToLevel =
            level != null && Number.isFinite(Number(level)) && Number(level) >= 2
                ? Number(level)
                : null;
    }

    setPendingCompanion(companion: Omit<CompanionData, 'isOpen'> | null) {
        this._pendingCompanion = companion ? { ...companion, isOpen: false } : null;
    }

    openCompanion() {
        if (this._pendingCompanion) {
            this._pendingCompanion = { ...this._pendingCompanion, isOpen: true };
        }
    }

    closeCompanion() {
        // Сбрасываем полностью: иначе pending остаётся после 1-й миссии и
        // openPendingMissionRewardModals() снова открывает модалку на 2-й, 3-й…
        this._pendingCompanion = null;
    }

    /** @deprecated */
    setPendingCompanionArtifact = this.setPendingCompanion.bind(this);
    /** @deprecated */
    openCompanionArtifact = this.openCompanion.bind(this);
    /** @deprecated */
    closeCompanionArtifact = this.closeCompanion.bind(this);

    setPendingFirstMissionArtifact(artifact: Omit<FirstMissionArtifactData, 'isOpen'> | null) {
        this._pendingFirstMissionArtifact = artifact ? { ...artifact, isOpen: false } : null;
    }

    openFirstMissionArtifact() {
        if (this._pendingFirstMissionArtifact) {
            this._pendingFirstMissionArtifact = {
                ...this._pendingFirstMissionArtifact,
                isOpen: true,
            };
        }
    }

    closeFirstMissionArtifact() {
        this._pendingFirstMissionArtifact = null;
        if (this._pendingCompanion) {
            this.openCompanion();
        }
    }

    setStepReward(reward: StepRewardData | null) {
        this._stepReward = reward;
        if (reward?.isOpen) {
            this._balanceBeforeReward = this._userStore?.user?.balance ?? 0;
        }
    }

    closeStepReward() {
        if (this._stepReward) {
            this._stepReward = { ...this._stepReward, isOpen: false };
        }
    }

    setInsufficientEnergy(value: boolean) {
        this._insufficientEnergy = value;
    }

    closeInsufficientEnergy() {
        this._insufficientEnergy = false;
    }

    setInsufficientGems(value: boolean) {
        this._insufficientGems = value;
    }

    closeInsufficientGems() {
        this._insufficientGems = false;
    }

    setVideo(video: MediaFile | null) {
        this._video = video;
    }

    setAvatar(avatar: MediaFile | null) {
        this._avatar = avatar;
    }

    setBackground(background: MediaFile | null) {
        this._background = background;
    }

    setMissions(missions: Mission[]) {
        this._missions = missions;
    }

    setMissionsProgress(progress: MissionProgress[]) {
        this._missionsProgress = progress ?? [];
    }

    /**
     * После /message: синхронизирует main_step текущей миссии для плашки целей шагов.
     */
    patchMissionMainStep(missionId: number, mainStep: number | null) {
        const m = this._missions.find((x) => x.id === missionId);
        if (!m) return;

        this._missions = this._missions.map((x) => {
            if (x.id !== missionId) return x;
            const p = x.progress;
            if (!p) {
                return {
                    ...x,
                    progress: {
                        missionId,
                        orderIndex: x.orderIndex,
                        status: "in_progress" as const,
                        mainStep,
                        mainStepsTotal: null,
                        beatsCompleted: 0,
                        artifactsFound: 0,
                        artifactsTotal: 0,
                    },
                };
            }
            return { ...x, progress: { ...p, mainStep } };
        });

        const list = [...this._missionsProgress];
        const idx = list.findIndex((p) => p.missionId === missionId);
        if (idx >= 0) {
            list[idx] = { ...list[idx], mainStep };
        } else {
            list.push({
                missionId,
                orderIndex: m.orderIndex,
                status: "in_progress",
                mainStep,
                mainStepsTotal: null,
                beatsCompleted: 0,
                artifactsFound: 0,
                artifactsTotal: 0,
            });
        }
        this._missionsProgress = list;
    }

    /**
     * Сразу после отправки сообщения с beginReplay: до ответа LLM статус ещё «completed»
     * и main_step максимальный — прогрессбар показывал все шаги пройденными. Приводим к началу реплея.
     */
    patchMissionReplayStarted(missionId: number) {
        const m = this._missions.find((x) => x.id === missionId);
        if (!m) return;

        const applyProgress = (base: MissionProgress | undefined): MissionProgress => {
            const prev = base ?? {
                missionId,
                orderIndex: m.orderIndex,
                status: "completed" as const,
                mainStep: 1,
                mainStepsTotal: null,
                beatsCompleted: 0,
                artifactsFound: 0,
                artifactsTotal: 0,
            };
            return {
                ...prev,
                missionId,
                orderIndex: m.orderIndex,
                status: "replay_in_progress",
                mainStep: 1,
                beatsCompleted: 0,
            };
        };

        this._missions = this._missions.map((x) => {
            if (x.id !== missionId) return x;
            const p = x.progress;
            return { ...x, progress: applyProgress(p ?? undefined) };
        });

        const list = [...this._missionsProgress];
        const idx = list.findIndex((p) => p.missionId === missionId);
        if (idx >= 0) {
            list[idx] = applyProgress(list[idx]);
        } else {
            list.push(applyProgress(undefined));
        }
        this._missionsProgress = list;
    }

    /** Реплей уже идёт (есть история чата) — не сбрасывать mainStep в 1. */
    private patchMissionReplayActive(missionId: number, mainStep: number) {
        const m = this._missions.find((x) => x.id === missionId);
        if (!m) return;
        const step = Math.max(1, Number(mainStep) || 1);

        const applyProgress = (base: MissionProgress | undefined): MissionProgress => ({
            ...(base ?? {
                missionId,
                orderIndex: m.orderIndex,
                beatsCompleted: Math.max(0, step - 1),
                artifactsFound: 0,
                artifactsTotal: 0,
            }),
            missionId,
            orderIndex: m.orderIndex,
            status: "replay_in_progress",
            mainStep: step,
            beatsCompleted: Math.max(0, step - 1),
        });

        this._missions = this._missions.map((x) => {
            if (x.id !== missionId) return x;
            return { ...x, progress: applyProgress(x.progress ?? undefined) };
        });

        const list = [...this._missionsProgress];
        const idx = list.findIndex((p) => p.missionId === missionId);
        if (idx >= 0) {
            list[idx] = applyProgress(list[idx]);
        } else {
            list.push(applyProgress(undefined));
        }
        this._missionsProgress = list;
    }

    /**
     * После loadChatHistory: шаг 1 только у свежего реплея без сообщений.
     */
    private syncReplayProgressAfterLoad(
        missionId: number | null,
        missionsProgress: MissionProgress[],
        historyLength: number,
        lastMainStep: number | null = null,
    ) {
        if (missionId == null) return;
        const entry = missionsProgress.find((p) => p.missionId === missionId);
        if (!entry) return;

        const hasMessages = historyLength > 0;
        const restoredStep =
            lastMainStep != null && lastMainStep >= 1
                ? lastMainStep
                : entry.mainStep != null && entry.mainStep >= 1
                  ? entry.mainStep
                  : null;

        if (entry.status === "replay_in_progress") {
            if (!hasMessages) {
                this.patchMissionReplayStarted(missionId);
            } else if (restoredStep != null) {
                this.patchMissionReplayActive(missionId, restoredStep);
            }
            return;
        }

        if (entry.status === "completed" && hasMessages && restoredStep != null) {
            this.patchMissionReplayActive(missionId, restoredStep);
        }
    }

    setSelectedMissionId(id: number | null) {
        this._selectedMissionId = id;
    }

    /** Сохранить выбранную миссию на сервере (без текста; для восстановления после перезагрузки). */
    private async persistSelectedChatMission(missionId: number | null) {
        try {
            await setSelectedChatMission(missionId);
            if (this._userStore) {
                this._userStore.setSelectedChatMissionId(missionId);
            }
        } catch (e) {
            console.error("persistSelectedChatMission failed:", e);
        }
    }

    /**
     * Миссия по умолчанию для загрузки чата после /status.
     * Сначала текущая in_progress — иначе после прохождения миссии 1 снова выбиралась бы миссия 1
     * (canSelectMission true и для completed — реплей).
     */
    pickDefaultMissionId(missions: Mission[], mp: MissionProgress[]): number | null {
        if (!missions.length) return null;
        const sorted = [...missions].sort(compareMissionsByStoryOrder);
        const inProgress = [...mp]
            .filter(
                (p) =>
                    (p.status === "in_progress" || p.status === "replay_in_progress") &&
                    this.canSelectMission(p.missionId),
            )
            .sort((a, b) => {
                const ma = sorted.find((m) => m.id === a.missionId);
                const mb = sorted.find((m) => m.id === b.missionId);
                if (!ma || !mb) return 0;
                return compareMissionsByStoryOrder(ma, mb);
            })[0];
        if (inProgress && sorted.some((m) => m.id === inProgress.missionId)) {
            return inProgress.missionId;
        }
        for (const m of [...sorted].reverse()) {
            if (!this.canSelectMission(m.id)) continue;
            const p = this.missionProgressFor(m.id);
            if (p?.status === "completed" || p?.status === "replay_in_progress") {
                return m.id;
            }
        }
        for (const m of sorted) {
            if (this.canSelectMission(m.id)) {
                return m.id;
            }
        }
        return sorted[0]?.id ?? null;
    }

    /**
     * После награды за этап: без status/history и без авто-«старт».
     * Локально синхронизируем цепочку прогресса (без запросов), затем плашка с кнопкой «Старт».
     */
    startNextMissionAfterReward(nm: {
        id: number;
        title: string;
        titleEn?: string | null;
        orderIndex: number;
    }) {
        this.closeStageReward();
        this.setSelectedMissionId(nm.id);
        this.patchMissionsProgressForUnlockedNext(nm.id);
        this.primeMissionThread(nm.id);
    }

    /** Без GET /status: все миссии до следующей — completed, следующая — in_progress (для canSelectMission и «Старт»). */
    private patchMissionsProgressForUnlockedNext(nextMissionId: number) {
        const target = this._missions.find((x) => x.id === nextMissionId);
        if (!target) return;
        const sorted = [...this._missions].sort(compareMissionsByStoryOrder);
        const list = [...this._missionsProgress];
        const upsert = (mission: Mission, status: MissionProgress["status"]) => {
            const idx = list.findIndex((p) => p.missionId === mission.id);
            const base: MissionProgress = {
                missionId: mission.id,
                orderIndex: mission.orderIndex,
                status,
                beatsCompleted: idx >= 0 ? list[idx].beatsCompleted : 0,
                artifactsFound: idx >= 0 ? list[idx].artifactsFound : 0,
                artifactsTotal: idx >= 0 ? list[idx].artifactsTotal : 0,
            };
            if (idx >= 0) {
                list[idx] = { ...list[idx], ...base };
            } else {
                list.push(base);
            }
        };
        for (const m of sorted) {
            if (compareMissionsByStoryOrder(m, target) < 0) {
                upsert(m, "completed");
            }
        }
        upsert(target, "in_progress");
        this.setMissionsProgress(list);
    }

    /** Прогресс миссии: из /status (missionsProgress) или вложенного mission.progress. */
    missionProgressFor(missionId: number): MissionProgress | null {
        const fromList = this._missionsProgress.find((x) => x.missionId === missionId);
        if (fromList) return fromList;
        const m = this._missions.find((x) => x.id === missionId);
        return m?.progress ?? null;
    }

    /**
     * Можно открыть чат по миссии (аналог assertMissionChatAllowed на бэке).
     * Раньше UI считал locked только при p?.status === 'locked'; если progress не пришёл — все миссии были «открыты».
     */
    canSelectMission(missionId: number): boolean {
        const sorted = [...this._missions].sort(compareMissionsByStoryOrder);
        const m = sorted.find((x) => x.id === missionId);
        if (!m) return false;

        const order = sorted.findIndex((x) => x.id === missionId);
        for (let i = 0; i < order; i++) {
            const pp = this.missionProgressFor(sorted[i].id);
            const prevUnlocked =
                pp &&
                (pp.status === "completed" || pp.status === "replay_in_progress");
            if (!prevUnlocked) {
                return false;
            }
        }

        const p = this.missionProgressFor(missionId);
        if (!p) {
            return order === 0;
        }
        if (p.status === "locked") {
            return false;
        }
        const missionLevel = m.level ?? 1;
        if (!isStoryLevelUnlocked(this._unlockedLevels, missionLevel)) {
            return false;
        }
        return (
            p.status === "in_progress" ||
            p.status === "completed" ||
            p.status === "replay_in_progress"
        );
    }

    /**
     * Смена активной миссии из списка.
     * Завершённая — только стартовая плашка (реплей начнётся по кнопке «Старт» на карточке).
     * Идущая — подгружаем историю треда.
     */
    async selectMissionForChat(missionId: number) {
        if (!this.canSelectMission(missionId)) return;
        this.setSwitchingMissionId(missionId);
        try {
            this.setSelectedMissionId(missionId);
            await this.persistSelectedChatMission(missionId);
            await this.loadChatHistory(true);
        } finally {
            this.setSwitchingMissionId(null);
        }
    }

    setSwitchingMissionId(id: number | null) {
        this._switchingMissionId = id;
    }

    setMissionStart(missionId: number) {
        if (!missionId) return;
        this._missionStartTs.set(missionId, Date.now());
    }

    /**
     * Локально переключить чат на миссию без запросов status/history (перед «старт» с карточки).
     */
    primeMissionThread(missionId: number) {
        const m = this._missions.find((x) => x.id === missionId);
        if (!m || !this.canSelectMission(missionId)) return;
        this.setSelectedMissionId(missionId);
        this.setMessages([
            {
                id: `mission-${m.id}-${Date.now()}`,
                text: "",
                isUser: false,
                timestamp: new Date(),
                isMissionCard: true,
                mission: {
                    id: m.id,
                    title: m.title,
                    titleEn: m.titleEn ?? null,
                    description: m.description,
                    descriptionEn: m.descriptionEn ?? null,
                    orderIndex: m.orderIndex,
                },
                missionId: m.id,
                missionHasMessages: false,
            },
        ]);
        this.setSuggestions([]);
        this.setSuggestionsFormatError(false);
        this.setSuggestionsFormatErrorReportContext(null);
        this._loadedHistoryName = this._userStore?.user?.selectedHistoryName ?? null;
        this._loadedMissionId = missionId;
        void this.persistSelectedChatMission(missionId);
    }

    getMissionVideoByOrderIndex(orderIndex: number): MediaFile | null {
        const mission = this._missions.find(m => m.orderIndex === orderIndex);
        return mission?.video || null;
    }

    getMissionVideoByMissionId(missionId: number): MediaFile | null {
        const mission = this._missions.find((m) => m.id === missionId);
        return mission?.video ?? null;
    }

    setSuggestions(suggestions: ChatSuggestion[]) {
        this._suggestions = suggestions;
    }

    setSuggestionsFormatError(value: boolean) {
        this._suggestionsFormatError = value;
    }

    setSuggestionsFormatErrorReportContext(context: ClientErrorReportPayload | null) {
        this._suggestionsFormatErrorReportContext = context;
    }

    setArtifactAction(action: ApiMessageResponse['artifactAction']) {
        this._artifactAction = action ?? null;
    }

    closeArtifactAcquireModal() {
        this._artifactAction = null;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setError(error: string) {
        this._error = error;
    }

    setHistoryLoadFailed(failed: boolean) {
        this._historyLoadFailed = failed;
    }

    clearHistoryLoadError() {
        this._historyLoadFailed = false;
        this._error = '';
    }

    /** Повтор последнего пользовательского сообщения после ошибки формата ответа LLM. */
    async submitClientErrorReport(payload: ClientErrorReportPayload) {
        await postClientErrorReport({
            ...payload,
            clientMeta: {
                ...payload.clientMeta,
                app: "chat-gft-client",
            },
        });
        trackEvent("chat_error_report_submitted", {
            story_id: payload.historyName,
            http_status: payload.httpStatus,
        });
    }

    retryAfterLlmFormatError(payload: ChatRetryPayload) {
        this._messages = this._messages.filter((m) => m.chatErrorKind !== "llm_format");
        void this.sendMessage(
            payload.messageText,
            undefined,
            payload.suggestionId,
            payload.payGemsForSuggestionId,
            {
                beginReplay: payload.beginReplay === true,
                skipUserBubble: true,
            },
        );
    }

    async sendMessage(
        messageText: string,
        onEnergyUpdate?: (newEnergy: number) => void,
        suggestionId?: string | null,
        payGemsForSuggestionId?: string | null,
        extra?: { beginReplay?: boolean; skipUserBubble?: boolean },
    ) {
        const userMessage: Message = {
            id: Date.now().toString(),
            text: messageText,
            isUser: true,
            timestamp: new Date()
        };

        if (!extra?.skipUserBubble) {
            this.addMessage(userMessage);
        }
        if (extra?.beginReplay === true && this._selectedMissionId != null) {
            this.patchMissionReplayStarted(this._selectedMissionId);
        }
        this.setIsTyping(true);
        this.setError('');
        this.setArtifactAction(null);

        // Очищаем suggestions при отправке нового сообщения
        this.setSuggestions([]);
        this.setSuggestionsFormatError(false);
        this.setSuggestionsFormatErrorReportContext(null);

        // Сохраняем баланс до отправки сообщения для вычисления награды
        const previousBalance = this._userStore?.user?.balance || 0;
        const previousEnergy = this._userStore?.user?.energy ?? null;
        const storyId = this._userStore?.user?.selectedHistoryName || "unknown";

        try {
            const startTs = Date.now();
            trackEvent('chat_message_send', {
                length: messageText.length,
                is_start: ['старт', 'start'].includes(messageText.trim().toLowerCase()),
                selected_history: storyId,
            });
            trackEvent('message_send', {
                story_id: storyId,
                message_len: messageText.length,
                has_voice: 0,
            });
            // Energy is spent per message. If you ever change pricing, adjust here.
            trackEvent('energy_spent', {
                amount: 1,
                balance_after: previousEnergy !== null ? Math.max(0, Number(previousEnergy) - 1) : null,
                reason: 'step',
            });
            const response: ApiMessageResponse = await apiSendMessage(
                messageText,
                suggestionId ?? null,
                payGemsForSuggestionId ?? null,
                this._selectedMissionId,
                extra?.beginReplay === true,
            );
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response || '',
                isUser: false,
                timestamp: new Date()
            };
            this.addMessage(aiMessage);

            trackEvent('ai_response_show', {
                story_id: storyId,
                response_len: (response.response || '').length,
                latency_ms: Date.now() - startTs,
            });
            
            // Обновляем энергию и баланс пользователя из ответа сервера
            if (response.newEnergy !== undefined) {
                if (this._userStore) {
                    this._userStore.setEnergy(response.newEnergy);
                }
                // Поддерживаем старый API через колбэк для обратной совместимости
                if (onEnergyUpdate) {
                    onEnergyUpdate(response.newEnergy);
                }
            }
            
            // Обновляем прогресс из ответа
            if (response.stage !== undefined) {
                this.setCurrentStage(response.stage);
            }

            if (response.mission !== undefined) {
                this.setMission(response.mission);
            }
            
            // Обновляем баланс пользователя из ответа сервера ПОСЛЕ обновления прогресса
            // чтобы правильно вычислить награду
            if (response.newBalance !== undefined && this._userStore) {
                if (response.missionCompleted && response.rewardsSuppressed) {
                    this._userStore.setBalance(response.newBalance);
                    if (response.stageReward) {
                        const stageNumberReplay =
                            response.stageReward.stageNumber ??
                            response.completedStage ??
                            (response.stage ? (response.stage === 1 ? 3 : response.stage - 1) : 1);
                        this.setStageReward({
                            stageNumber: stageNumberReplay,
                            rewardAmount:
                                typeof response.stageReward.rewardAmount === "number"
                                    ? response.stageReward.rewardAmount
                                    : null,
                            rewardCaseId: response.stageReward.rewardCaseId ?? null,
                            rewardCase: response.stageReward.rewardCase ?? null,
                            isOpen: true,
                            lastLlmReply: response.lastLlmReply ?? response.response ?? null,
                            nextMission: response.nextMission ?? null,
                            artifactsGate: response.artifactsGate ?? null,
                        });
                    }
                } else if (response.missionCompleted && !response.rewardsSuppressed) {
                    const stageNumber =
                        response.stageReward?.stageNumber ??
                        response.completedStage ??
                        (response.stage ? (response.stage === 1 ? 3 : response.stage - 1) : 1);

                    const rewardAmount =
                        typeof response.stageReward?.rewardAmount === "number"
                            ? response.stageReward.rewardAmount
                            : response.newBalance - previousBalance;

                    this.setStageReward({
                        stageNumber,
                        rewardAmount,
                        rewardCaseId: response.stageReward?.rewardCaseId ?? null,
                        rewardCase: response.stageReward?.rewardCase ?? null,
                        isOpen: true,
                        lastLlmReply: response.lastLlmReply ?? response.response ?? null,
                        nextMission: response.nextMission ?? null,
                        artifactsGate: response.artifactsGate ?? null,
                    });

                    const grantedCompanion = response?.companion ?? response?.companionArtifact;
                    if (grantedCompanion) {
                        this.setPendingCompanion(grantedCompanion);
                    }

                    if (response?.firstMissionArtifact) {
                        this.setPendingFirstMissionArtifact(response.firstMissionArtifact);
                    }

                    const createdCases: Array<
                        Pick<UserCase, "id" | "userId" | "caseId" | "isOpened"> & Partial<UserCase>
                    > = (response.userCases?.length
                        ? response.userCases
                        : response.userCase
                          ? [response.userCase]
                          : []
                    ).map((uc) => ({
                        id: uc.id,
                        userId: uc.userId,
                        caseId: uc.caseId,
                        isOpened: uc.isOpened,
                        resultType: uc.resultType ?? null,
                        resultRewardId: uc.resultRewardId ?? null,
                        createdAt: uc.createdAt,
                        updatedAt: uc.updatedAt,
                    }));
                    if (createdCases.length > 0 && this._caseStore) {
                        this._caseStore.addUnopenedCasesFromExternal(createdCases);
                    } else if (response.stageReward?.rewardCaseId && this._caseStore) {
                        void this._caseStore.fetchMyUnopenedCases(true);
                    }

                    trackEvent("mission_completed", {
                        stage: stageNumber,
                        reward_amount: rewardAmount,
                        selected_history: storyId,
                    });

                    /** Активная миссия чата; не сопоставлять с orderIndex награды/stage — id могут расходиться. */
                    const missionIdTracked = this._selectedMissionId ?? null;
                    const startedAt = missionIdTracked
                        ? this._missionStartTs.get(missionIdTracked) || null
                        : null;
                    const timeToCompleteSec = startedAt
                        ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
                        : null;

                    trackEvent("mission_complete", {
                        story_id: storyId,
                        mission_id: missionIdTracked,
                        attempts: 1,
                        time_to_complete_sec: timeToCompleteSec,
                    });

                    trackEvent("scene_complete", {
                        story_id: storyId,
                        scene_id: missionIdTracked,
                        completion_type: "mission",
                    });

                    trackEvent("gems_earned", {
                        amount: rewardAmount,
                        balance_after: response.newBalance,
                        source: "mission",
                    });
                } else if (
                    !response.rewardsSuppressed &&
                    response.stepReward &&
                    typeof response.stepReward.rewardGems === "number"
                ) {
                    this.setStepReward({
                        stepNumber: response.stepReward.stepNumber,
                        rewardGems: response.stepReward.rewardGems,
                        isOpen: true,
                    });
                }

                const stageGemReward =
                    response.missionCompleted && !response.rewardsSuppressed
                        ? typeof response.stageReward?.rewardAmount === "number"
                            ? response.stageReward.rewardAmount
                            : response.newBalance - previousBalance
                        : 0;
                const hasStageGemAnimation = stageGemReward > 0;
                const hasStepGemAnimation =
                    !response.missionCompleted &&
                    !response.rewardsSuppressed &&
                    response.stepReward != null &&
                    typeof response.stepReward.rewardGems === "number" &&
                    response.stepReward.rewardGems > 0;

                if (!hasStageGemAnimation && !hasStepGemAnimation) {
                    this._userStore.setBalance(response.newBalance);
                }
            }

            if (response.missionCompleted && this._missions.length > 0) {
                let nextMission: Mission | null = null;
                const apiNext = response.nextMission;
                if (
                    apiNext &&
                    typeof apiNext.id === "number" &&
                    Number.isFinite(apiNext.id)
                ) {
                    nextMission = this._missions.find((m) => m.id === apiNext.id) ?? null;
                }
                const artifactsGateBlocksNext =
                    response.artifactsGate != null &&
                    typeof response.artifactsGate.completedLevel === "number";
                if (
                    !nextMission &&
                    !artifactsGateBlocksNext &&
                    this._selectedMissionId != null
                ) {
                    const sorted = [...this._missions].sort(compareMissionsByStoryOrder);
                    const idx = sorted.findIndex((m) => m.id === this._selectedMissionId);
                    if (idx >= 0 && idx + 1 < sorted.length) {
                        nextMission = sorted[idx + 1];
                    }
                }
                if (nextMission) {
                    this.appendMissionCardIfNeeded(nextMission);
                }
            }
            
            // Обновляем подсказки из ответа
            if (response.suggestions && response.suggestions.length > 0) {
                this.setSuggestions(response.suggestions);
            } else {
                this.setSuggestions([]);
            }
            const suggestionsFormatError = response.suggestionsFormatError === true;
            this.setSuggestionsFormatError(suggestionsFormatError);
            this.setSuggestionsFormatErrorReportContext(
                suggestionsFormatError
                    ? {
                        clientMessage: messageText,
                        httpStatus: 200,
                        serverMessage: "LLM returned invalid suggestions; service fallback suggestions were used.",
                        serverCode: "LLM_INVALID_SUGGESTIONS",
                        suggestionId: suggestionId ?? null,
                        payGemsForSuggestionId: payGemsForSuggestionId ?? null,
                        historyName: storyId,
                        missionId: this._selectedMissionId,
                        beginReplay: extra?.beginReplay === true,
                        clientMeta: {
                            failReason: "llm_invalid_suggestions",
                        },
                    }
                    : null,
            );

            // Обновляем артефакты юзера из ответа (актуально после подбора/использования)
            if (response.artifacts && Array.isArray(response.artifacts) && this._userStore) {
                this._userStore.setArtifacts(response.artifacts);
            }

            if (response.artifactAction?.action === 'RECEIVE') {
                this.setArtifactAction(response.artifactAction);
            }

            if (response.mainStep !== undefined && this._selectedMissionId != null) {
                this.patchMissionMainStep(this._selectedMissionId, response.mainStep ?? null);
            }

            // Возвращаем response для использования в компонентах
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            const axiosError = error as {
                response?: {
                    status?: number;
                    data?: { message?: string; code?: string; newEnergy?: number; newBalance?: number };
                };
                code?: string;
            };
            const status = axiosError.response?.status;
            const data = axiosError.response?.data;

            if (data?.newEnergy !== undefined && this._userStore) {
                this._userStore.setEnergy(data.newEnergy);
            }
            if (data?.newBalance !== undefined && this._userStore) {
                this._userStore.setBalance(data.newBalance);
            }

            const lang = this._userStore?.user?.language === "en" ? "en" : "ru";

            if (status === 400) {
                const msg = data?.message ?? '';
                if (msg.includes('Insufficient energy')) {
                    this.setError('Insufficient energy. Please purchase more stars.');
                    this.setInsufficientEnergy(true);
                    trackEvent('chat_message_send_failed', { reason: 'insufficient_energy' });
                    trackEvent('energy_depleted', {
                        balance: this._userStore?.user?.energy ?? null,
                        context: 'story',
                    });
                    trackEvent('mission_fail', { story_id: storyId, fail_reason: 'energy_depleted' });
                } else {
                    // Остальные 400 (Invalid artifact, balance и т.д.): setError нигде не рендерится в чате —
                    // показываем тот же блок с перезагрузкой, что и для 5xx/сети.
                    const failReason = msg.toLowerCase().includes('artifact')
                        ? 'bad_request_artifact'
                        : msg.toLowerCase().includes('balance')
                          ? 'bad_request_balance'
                          : 'bad_request_other';
                    this.addMessage({
                        id: `chat-err-reload-${Date.now()}`,
                        text: translate('chatReloadAppHint', lang),
                        isUser: false,
                        timestamp: new Date(),
                        chatErrorKind: 'reload_app',
                        errorReportContext: {
                            clientMessage: messageText,
                            httpStatus: 400,
                            serverMessage: msg || null,
                            serverCode: typeof data?.code === 'string' ? data.code : null,
                            suggestionId: suggestionId ?? null,
                            payGemsForSuggestionId: payGemsForSuggestionId ?? null,
                            historyName: storyId,
                            missionId: this._selectedMissionId,
                            beginReplay: extra?.beginReplay === true,
                            clientMeta: { failReason },
                        },
                    });
                    trackEvent('chat_message_send_failed', { reason: failReason });
                    trackEvent('mission_fail', { story_id: storyId, fail_reason: failReason });
                }
            } else if (status === 422 && data?.code === 'LLM_INVALID_FORMAT') {
                this.addMessage({
                    id: `chat-err-llm-${Date.now()}`,
                    text: translate('chatLlmCouldNotProcess', lang),
                    isUser: false,
                    timestamp: new Date(),
                    chatErrorKind: 'llm_format',
                    chatRetryPayload: {
                        messageText,
                        suggestionId: suggestionId ?? null,
                        payGemsForSuggestionId: payGemsForSuggestionId ?? null,
                        beginReplay: extra?.beginReplay === true,
                    },
                });
                trackEvent('chat_message_send_failed', { reason: 'llm_invalid_format' });
            } else {
                const failReason =
                    status === 503 && data?.code === 'CHAT_SERVICE_UNAVAILABLE'
                        ? 'chat_service_unavailable'
                        : 'fatal_reload';
                this.addMessage({
                    id: `chat-err-reload-${Date.now()}`,
                    text: translate('chatReloadAppHint', lang),
                    isUser: false,
                    timestamp: new Date(),
                    chatErrorKind: 'reload_app',
                    errorReportContext: {
                        clientMessage: messageText,
                        httpStatus: status ?? null,
                        serverMessage: typeof data?.message === 'string' ? data.message : null,
                        serverCode: typeof data?.code === 'string' ? data.code : null,
                        suggestionId: suggestionId ?? null,
                        payGemsForSuggestionId: payGemsForSuggestionId ?? null,
                        historyName: storyId,
                        missionId: this._selectedMissionId,
                        beginReplay: extra?.beginReplay === true,
                        clientMeta: {
                            failReason,
                            axiosErrorCode: axiosError.code ?? null,
                        },
                    },
                });
                trackEvent('chat_message_send_failed', { reason: failReason });
                trackEvent('mission_fail', { story_id: storyId, fail_reason: failReason });
            }
            return null;
        } finally {
            this.setIsTyping(false);
        }
    }

    async loadChatHistory(forceReload = false) {
        const currentHistoryName = this._userStore?.user?.selectedHistoryName || null;
        if (
            !forceReload &&
            currentHistoryName === this._loadedHistoryName &&
            this._loadedMissionId === this._selectedMissionId &&
            this._messages.length > 0 &&
            !this._loading
        ) {
            return;
        }

        this.setLoading(true);
        this.setError("");
        this.setHistoryLoadFailed(false);

        try {
            const statusData = await getStatus();
            this.setCurrentStage(statusData.stage);
            this.setMission(statusData.mission);
            if (statusData.missions) {
                this.setMissions(statusData.missions);
            }
            const mp = statusData.missionsProgress ?? [];
            this.setMissionsProgress(mp);
            if (statusData.unlockedLevels) {
                this.setUnlockedLevels(statusData.unlockedLevels);
            }
            this.setPendingOpenStoryLevel(statusData.pendingOpenStoryLevel ?? null);

            if (this._userStore?.user) {
                this._userStore.setSelectedChatMissionId(statusData.selectedChatMissionId ?? null);
            }

            const missions = (statusData.missions || [])
                .slice()
                .sort(compareMissionsByStoryOrder);

            let mid =
                this._selectedMissionId ??
                statusData.selectedChatMissionId ??
                null;
            const valid =
                mid != null &&
                missions.some((m) => m.id === mid) &&
                this.canSelectMission(mid);
            if (!valid) {
                mid = this.pickDefaultMissionId(missions, mp);
                this.setSelectedMissionId(mid);
            } else {
                this.setSelectedMissionId(mid);
            }

            const historyResponse = await getChatHistory(undefined, null, mid ?? undefined);
            const historyData = historyResponse.history ?? [];

            const orderedHistory = historyData.slice().sort((a, b) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            const selected = mid != null ? missions.find((m) => m.id === mid) : null;
            const messages: Message[] = [];

            if (selected) {
                const hasMessages = orderedHistory.length > 0;
                messages.push({
                    id: `mission-${selected.id}`,
                    text: "",
                    isUser: false,
                    timestamp: new Date(orderedHistory[0]?.createdAt || Date.now()),
                    isMissionCard: true,
                    mission: {
                        id: selected.id,
                        title: selected.title,
                        titleEn: selected.titleEn ?? null,
                        description: selected.description,
                        descriptionEn: selected.descriptionEn ?? null,
                        orderIndex: selected.orderIndex,
                    },
                    missionId: selected.id,
                    missionHasMessages: hasMessages,
                });

                orderedHistory.forEach((item) => {
                    messages.push({
                        id: `${item.id}`,
                        text: item.content,
                        isUser: item.role === "user",
                        timestamp: new Date(item.createdAt || Date.now()),
                        missionId: item.missionId ?? null,
                        isCongratulation: item.isCongratulation ?? false,
                    });
                });
            }

            this.setMessages(messages);

            this.syncReplayProgressAfterLoad(
                mid,
                mp,
                orderedHistory.length,
                historyResponse.lastMainStep ?? null,
            );

            if (historyResponse.video !== undefined) {
                this.setVideo(historyResponse.video);
            }
            if (historyResponse.avatar !== undefined) {
                this.setAvatar(historyResponse.avatar);
            }
            if (historyResponse.background !== undefined) {
                this.setBackground(historyResponse.background);
            }

            if (historyResponse.lastSuggestions?.length) {
                this.setSuggestions(historyResponse.lastSuggestions);
            } else {
                this.setSuggestions([]);
            }
            this.setSuggestionsFormatError(false);
            this.setSuggestionsFormatErrorReportContext(null);

            this._loadedHistoryName = currentHistoryName;
            this._loadedMissionId = mid;
        } catch (error) {
            console.error("Error loading chat history:", error);
            this.setError("Error loading chat history");
            this.setHistoryLoadFailed(true);
        } finally {
            this.setLoading(false);
        }
    }

    async loadStatus() {
        try {
            const statusData = await getStatus();
            this.setCurrentStage(statusData.stage);
            this.setMission(statusData.mission);
            if (statusData.missions) {
                this.setMissions(statusData.missions);
            }
            this.setMissionsProgress(statusData.missionsProgress ?? []);
            if (statusData.unlockedLevels) {
                this.setUnlockedLevels(statusData.unlockedLevels);
            }
            this.setPendingOpenStoryLevel(statusData.pendingOpenStoryLevel ?? null);
        } catch (error) {
            console.error('Error loading status:', error);
            // Устанавливаем дефолтные значения при ошибке
            this.setCurrentStage(1);
            this.setMission(null);
        }
    }

    clearMessages() {
        this.setMessages([]);
        this.setCurrentStage(1);
        this.setMission(null);
        this.setSuggestions([]);
        this.setSuggestionsFormatError(false);
        this.setSuggestionsFormatErrorReportContext(null);
        this._loadedHistoryName = null;
        this._loadedMissionId = null;
        this._selectedMissionId = null;
        this._missionsProgress = [];
        this._unlockedLevels = [1];
        this._pendingOpenStoryLevel = null;
        this._openStoryLevelPrompt = null;
        this._missionPathScrollToLevel = null;
        this._pendingCompanion = null;
        this._pendingFirstMissionArtifact = null;
        this._historyLoadFailed = false;
        this._trackedMissionViews.clear();
        this._missionStartTs.clear();
    }

    get messages() {
        return this._messages;
    }

    get isTyping() {
        return this._isTyping;
    }

    get currentStage() {
        return this._currentStage;
    }

    get mission() {
        return this._mission;
    }

    get suggestions() {
        return this._suggestions;
    }

    get suggestionsFormatError() {
        return this._suggestionsFormatError;
    }

    get suggestionsFormatErrorReportContext() {
        return this._suggestionsFormatErrorReportContext;
    }

    get artifactAction() {
        return this._artifactAction;
    }


    get loading() {
        return this._loading;
    }

    get switchingMissionId() {
        return this._switchingMissionId;
    }

    get error() {
        return this._error;
    }

    get historyLoadFailed() {
        return this._historyLoadFailed;
    }

    get stageReward() {
        return this._stageReward;
    }

    get openStoryLevelPrompt() {
        return this._openStoryLevelPrompt;
    }

    get unlockedLevels() {
        return this._unlockedLevels;
    }

    get pendingOpenStoryLevel() {
        return this._pendingOpenStoryLevel;
    }

    get missionPathScrollToLevel() {
        return this._missionPathScrollToLevel;
    }

    get pendingCompanion() {
        return this._pendingCompanion;
    }

    /** @deprecated */
    get pendingCompanionArtifact() {
        return this._pendingCompanion;
    }

    get pendingFirstMissionArtifact() {
        return this._pendingFirstMissionArtifact;
    }

    get stepReward() {
        return this._stepReward;
    }

    get pendingProgressAnimation() {
        return this._pendingProgressAnimation;
    }

    get insufficientEnergy() {
        return this._insufficientEnergy;
    }

    get insufficientGems() {
        return this._insufficientGems;
    }

    get video() {
        return this._video;
    }

    get avatar() {
        return this._avatar;
    }

    get background() {
        return this._background;
    }

    get missions() {
        return this._missions;
    }

    get missionsProgress() {
        return this._missionsProgress;
    }

    get selectedMissionId() {
        return this._selectedMissionId;
    }
}
