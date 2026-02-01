import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '../CoreComponents/Button';

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

    const getHistoryDisplayName = (agentItem: { historyName: string; displayName?: string | null; displayNameEn?: string | null }, lang: 'en' | 'ru'): string => {
        const fallback = agentItem.historyName.charAt(0).toUpperCase() + agentItem.historyName.slice(1);
        if (lang === 'en') return agentItem.displayNameEn || agentItem.displayName || fallback;
        return agentItem.displayName || fallback;
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
                                <motion.div
                                    key={agentItem.id}
                                    initial={{ opacity: 0, y: 0 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                  <Button
                                    onClick={() => handleSelectHistory(agentItem.historyName)}
                                    disabled={agent.saving || isSelected}
                                    variant="default"
                                    size="md"
                                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 [&>span]:w-full [&>span]:justify-start ${
                                      isSelected
                                        ? 'bg-gradient-to-r from-red-500/30 to-red-700/30 border-2 border-red-500 cursor-default'
                                        : 'bg-primary-700/50 hover:bg-primary-700 border-2 border-primary-600 hover:border-red-500 cursor-pointer'
                                    } ${agent.saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <div className="flex items-center justify-between gap-2 w-full">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-white">
                                            {getHistoryDisplayName(agentItem, language)}
                                          </span>
                                        </div>
                                        {(language === 'en' ? (agentItem.descriptionEn || agentItem.description) : agentItem.description) && (
                                          <p className="text-xs text-gray-300 mt-1 mb-1">
                                            {language === 'en' ? (agentItem.descriptionEn || agentItem.description) : agentItem.description}
                                          </p>
                                        )}
                                      </div>
                                      {isSelected && (
                                        <i className="fas fa-check-circle text-red-400 text-xl"></i>
                                      )}
                                    </div>
                                  </Button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Close Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={onClose}
                    variant="default"
                    size="md"
                    className="w-full mt-6 bg-primary-700 hover:bg-primary-600 text-white"
                  >
                    {t('close')}
                  </Button>
                </motion.div>
            </div>
        </Modal>
    );
});

export default HistorySelectionModal;

