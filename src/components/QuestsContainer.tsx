import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import type { Quest } from '@/types/types';
import { Context, type IStoreContext } from '@/store/StoreProvider';

const QuestsContainer: React.FC = observer(() => {
    const { quest } = useContext(Context) as IStoreContext;

    useEffect(() => {
        // Load quests when component mounts
        quest.loadQuests();
    }, [quest]);

    const handleQuestComplete = async (questId: string) => {
        await quest.completeQuest(questId);
    };

    const handleQuestClick = (quest: Quest) => {
        if (quest.url) {
            window.open(quest.url, '_blank');
        }
    };
    const getQuestIcon = (type: string) => {
        switch (type) {
            case 'daily':
                return 'fas fa-calendar-day';
            case 'subscribe':
                return 'fas fa-bullhorn';
            case 'join':
                return 'fas fa-users';
            default:
                return 'fas fa-star';
        }
    };

    const getQuestGradient = (type: string) => {
        switch (type) {
            case 'daily':
                return 'from-amber-500 to-orange-600';
            case 'subscribe':
                return 'from-blue-500 to-indigo-600';
            case 'join':
                return 'from-emerald-500 to-teal-600';
            default:
                return 'from-purple-500 to-violet-600';
        }
    };

    return (
        <div className="pt-24 pb-32 px-4 overflow-y-auto chat-scrollbar h-screen">
            <div className="max-w-2xl mx-auto w-full space-y-3 mt-3">
                <div className="text-center mb-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-800 border border-primary-700 text-[11px] uppercase tracking-wider text-gray-400">
                        Quests
                    </div>
                </div>

                {quest.quests.map((quest) => (
                    <div
                        key={quest.id}
                        className={`bg-primary-800 border border-primary-700 rounded-xl p-3 flex items-center justify-between quest-item hover:bg-primary-700/50 transition ${
                            quest.url ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => quest.url && handleQuestClick(quest)}
                        title={quest.url ? 'Open link' : ''}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getQuestGradient(quest.type)} flex items-center justify-center`}>
                                <i className={`${getQuestIcon(quest.type)} text-white text-sm`}></i>
                            </div>
                            <div>
                                <div className="text-sm font-semibold">{quest.title}</div>
                                <div className="text-xs text-gray-400">Reward: +{quest.reward} energy</div>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQuestComplete(quest.id);
                            }}
                            disabled={quest.completed}
                            className={`px-3 py-1.5 text-xs rounded-full transition ${
                                quest.completed
                                    ? 'bg-green-500 text-white'
                                    : 'bg-secondary-500 hover:bg-secondary-400'
                            }`}
                        >
                            {quest.completed ? 'Completed' : 'Check'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default QuestsContainer;
