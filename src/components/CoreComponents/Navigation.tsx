import React from 'react';
import { useTranslate } from '@/utils/useTranslate';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE } from '@/utils/consts';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslate();
    
    const tabs = [
        { id: 'chat', icon: 'fas fa-comments', label: t('chat'), route: MAIN_ROUTE },
        { id: 'quests', icon: 'fas fa-tasks', label: t('quests'), route: QUESTS_ROUTE },
        { id: 'friends', icon: 'fas fa-user-friends', label: t('friends'), route: FRIENDS_ROUTE },
        { id: 'rewards', icon: 'fas fa-gift', label: t('loot'), route: REWARDS_ROUTE },
        { id: 'store', icon: 'fas fa-store', label: t('store'), route: STORE_ROUTE }
    ];

    const handleTabClick = (tabId: string) => {
        onTabChange(tabId);
    };

    return (
        <div className="bg-primary-800 px-1 border-t border-primary-700 w-full py-4 pb-8 ">
            <div className="flex justify-around">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex flex-col items-center w-1/5 cursor-pointer ${
                            activeTab === tab.id ? '' : 'opacity-70'
                        }`}
                    >
                        <i className={`${tab.icon} text-xl mb-1 ${
                            activeTab === tab.id ? 'text-secondary-400' : 'text-gray-400'
                        }`}></i>
                        <div className={`text-xs font-medium ${
                            activeTab === tab.id ? 'text-secondary-400' : 'text-gray-400'
                        }`}>
                            {tab.label}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Navigation;
