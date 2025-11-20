import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import Modal from '@/components/CoreComponents/Modal';
import { getPublicAgents, type Agent } from '@/http/agentAPI';
import { setSelectedHistoryName } from '@/http/userAPI';

interface HistorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistorySelectionModal: React.FC<HistorySelectionModalProps> = observer(({ isOpen, onClose }) => {
    const { user } = useContext(Context) as IStoreContext;
    const [histories, setHistories] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadHistories();
        }
    }, [isOpen]);

    const loadHistories = async () => {
        setLoading(true);
        setError(null);
        try {
            const agents = await getPublicAgents();
            setHistories(agents);
        } catch (err) {
            console.error('Failed to load histories:', err);
            setError('Failed to load histories');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectHistory = async (historyName: string) => {
        if (saving) return;
        
        setSaving(true);
        setError(null);
        try {
            await setSelectedHistoryName(historyName);
            // Обновляем информацию о пользователе через UserStore
            await user.fetchMyInfo();
            onClose();
        } catch (err) {
            console.error('Failed to set history:', err);
            setError('Failed to change history');
        } finally {
            setSaving(false);
        }
    };

    const currentHistory = user.user?.selectedHistoryName || 'starwars';

    const historyDisplayNames: Record<string, { en: string; ru: string }> = {
        starwars: { en: 'Star Wars', ru: 'Звёздные Войны' },
        // Добавьте другие истории по мере необходимости
    };

    const getHistoryDisplayName = (historyName: string, lang: 'en' | 'ru' = 'en'): string => {
        const displayName = historyDisplayNames[historyName];
        if (displayName) {
            return displayName[lang];
        }
        // Если нет специального названия, используем имя с заглавной буквы
        return historyName.charAt(0).toUpperCase() + historyName.slice(1);
    };

    const userLanguage = (user.user?.language || 'en') as 'en' | 'ru';

    const texts = {
        en: {
            title: 'Select History',
            description: 'Choose the story you want to participate in',
            current: 'Current',
            loading: 'Loading...',
            error: 'Error loading histories',
            retry: 'Retry',
        },
        ru: {
            title: 'Выбрать историю',
            description: 'Выберите историю, в которой хотите участвовать',
            current: 'Текущая',
            loading: 'Загрузка...',
            error: 'Ошибка загрузки историй',
            retry: 'Повторить',
        },
    };

    const t = texts[userLanguage];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            closeOnOverlayClick={true}
            className="p-6"
        >
            <div className="relative">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {t.title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t.description}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                        <button
                            onClick={loadHistories}
                            className="ml-2 underline hover:text-red-300"
                        >
                            {t.retry}
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-8 flex w-full justify-center">
                        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    /* Histories List */
                    <div className="space-y-2 max-h-[300px] overflow-y-auto hide-scrollbar">
                        {histories.map((agent, index) => {
                            const isSelected = agent.historyName === currentHistory;
                            return (
                                <motion.button
                                    key={agent.id}
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSelectHistory(agent.historyName)}
                                    disabled={saving || isSelected}
                                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-red-500/30 to-red-700/30 border-2 border-red-500 cursor-default'
                                            : 'bg-primary-700/50 hover:bg-primary-700 border-2 border-primary-600 hover:border-red-500 cursor-pointer'
                                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">
                                                    {getHistoryDisplayName(agent.historyName, userLanguage)}
                                                </span>
                                                {/* {isSelected && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-500/30 text-red-300 rounded">
                                                        {t.current}
                                                    </span>
                                                )} */}
                                            </div>
                                            {agent.description && (
                                                <p className="text-xs text-gray-300 mt-1 mb-1">
                                                    {agent.description}
                                                </p>
                                            )}
                                            {/* <span className="text-xs text-gray-400">
                                                {agent.historyName}
                                            </span> */}
                                        </div>
                                        {isSelected && (
                                            <i className="fas fa-check-circle text-red-400 text-xl"></i>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {/* Close Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={onClose}
                    className="w-full mt-6 bg-primary-700 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                    Close
                </motion.button>
            </div>
        </Modal>
    );
});

export default HistorySelectionModal;

