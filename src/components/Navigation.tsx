import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE } from '@/utils/consts';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const navigate = useNavigate();
    
    const tabs = [
        { id: 'chat', icon: 'fas fa-comments', label: 'Chat', route: MAIN_ROUTE },
        { id: 'quests', icon: 'fas fa-tasks', label: 'Quests', route: QUESTS_ROUTE },
        { id: 'friends', icon: 'fas fa-user-friends', label: 'Friends', route: FRIENDS_ROUTE },
        { id: 'rewards', icon: 'fas fa-gift', label: 'Rewards', route: REWARDS_ROUTE },
        { id: 'store', icon: 'fas fa-store', label: 'Store', route: STORE_ROUTE }
    ];

    const handleTabClick = (tabId: string, route: string) => {
        onTabChange(tabId);
        navigate(route);
    };

    return (
        <div className="bg-primary-800 px-1 py-2 border-b border-primary-700">
            <div className="flex justify-around">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id, tab.route)}
                        className={`flex flex-col items-center w-1/5 ${
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
                        <div className={`tab-active-indicator mt-1 ${
                            activeTab === tab.id ? 'bg-secondary-400' : ''
                        }`}></div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Navigation;
