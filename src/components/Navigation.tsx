import React from 'react';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'chat', icon: 'fas fa-comments', label: 'Chat' },
        { id: 'quests', icon: 'fas fa-tasks', label: 'Quests' },
        { id: 'friends', icon: 'fas fa-user-friends', label: 'Friends' },
        { id: 'rewards', icon: 'fas fa-gift', label: 'Rewards' },
        { id: 'store', icon: 'fas fa-store', label: 'Store' }
    ];

    return (
        <div className="bg-primary-800 px-1 py-2 border-b border-primary-700">
            <div className="flex justify-around">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
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
