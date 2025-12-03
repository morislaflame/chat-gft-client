import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';

interface HistorySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HistorySelectionModal: React.FC<HistorySelectionModalProps> = observer(({ isOpen, onClose }) => {
    const { user, agent } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();

    useEffect(() => {
        if (isOpen) {
            agent.fetchPublicAgents();
        }
    }, [isOpen, agent]);

    const handleSelectHistory = async (historyName: string) => {
        if (agent.saving) return;
        
        try {
            await agent.selectHistory(historyName);
            onClose();
        } catch (err) {
            console.error('Failed to set history:', err);
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
                        {t('selectHistory')}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t('selectHistoryDesc')}
                    </p>
                </div>

                {/* Error Message */}
                {agent.error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {agent.error}
                        <button
                            onClick={() => agent.fetchPublicAgents()}
                            className="ml-2 underline hover:text-red-300"
                        >
                            {t('retry')}
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {agent.loading ? (
                    <div className="text-center py-8 flex w-full justify-center">
                        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    /* Histories List */
                    <div className="space-y-2 max-h-[300px] overflow-y-auto hide-scrollbar">
                        {agent.agents.map((agentItem, index) => {
                            const isSelected = agentItem.historyName === currentHistory;
                            return (
                                <motion.button
                                    key={agentItem.id}
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleSelectHistory(agentItem.historyName)}
                                    disabled={agent.saving || isSelected}
                                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-red-500/30 to-red-700/30 border-2 border-red-500 cursor-default'
                                            : 'bg-primary-700/50 hover:bg-primary-700 border-2 border-primary-600 hover:border-red-500 cursor-pointer'
                                    } ${agent.saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-white">
                                                    {getHistoryDisplayName(agentItem.historyName, language)}
                                                </span>
                                                {/* {isSelected && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-500/30 text-red-300 rounded">
                                                        {t.current}
                                                    </span>
                                                )} */}
                                            </div>
                                            {agentItem.description && (
                                                <p className="text-xs text-gray-300 mt-1 mb-1">
                                                    {agentItem.description}
                                                </p>
                                            )}
                                            {/* <span className="text-xs text-gray-400">
                                                {agentItem.historyName}
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
                    {t('close')}
                </motion.button>
            </div>
        </Modal>
    );
});

export default HistorySelectionModal;

