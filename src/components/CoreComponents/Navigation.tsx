import React from 'react';
import { useTranslate } from '@/utils/useTranslate';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE } from '@/utils/consts';
import { observer } from 'mobx-react-lite';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import Button from '@/components/ui/button';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = observer(({ activeTab, onTabChange }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    
    const tabs = [
        { id: 'chat', icon: 'fas fa-comments', label: t('chat'), route: MAIN_ROUTE },
        { id: 'quests', icon: 'fas fa-tasks', label: t('quests'), route: QUESTS_ROUTE },
        { id: 'friends', icon: 'fas fa-user-friends', label: t('friends'), route: FRIENDS_ROUTE },
        { id: 'rewards', icon: 'fas fa-gift', label: t('loot'), route: REWARDS_ROUTE },
        { id: 'store', icon: 'fas fa-store', label: t('store'), route: STORE_ROUTE }
    ];

    const handleTabClick = (tabId: string) => {
        if (activeTab !== tabId) {
            hapticImpact('soft');
        }
        onTabChange(tabId);
    };

    return (
        <div className="px-4 w-full py-4 pb-8 fixed bottom-0 left-0 right-0 z-20" > 
            
            <div className="flex justify-around gap-1">
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        variant="nav"
                        size="sm"
                        className={`flex-1 min-w-0 py-2.5 px-1 h-auto rounded-full ${activeTab === tab.id ? 'is-active brightness-110' : 'opacity-90'}`}
                    >
                        <span className="flex flex-col items-center gap-0.5">
                            <i className={`${tab.icon} text-lg ${activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}`} />
                            <span className="text-xs font-medium leading-tight">{tab.label}</span>
                        </span>
                    </Button>
                ))}
            </div>
        </div>
    );
});

export default Navigation;
