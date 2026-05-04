import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, PROFILE_ROUTE } from '@/utils/consts';
import { trackEvent } from '@/utils/analytics';
import { motion } from 'motion/react';

type TabType = 'chat' | 'quests' | 'friends' | 'rewards' | 'profile';

const BottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bottomNavigationRef = useRef<HTMLDivElement>(null);

    const handleTabClick = (tabId: string) => {
        const tab = tabId as TabType;
        
        const routeMap: Record<TabType, string> = {
            'chat': MAIN_ROUTE,
            'quests': QUESTS_ROUTE,
            'friends': FRIENDS_ROUTE,
            'rewards': REWARDS_ROUTE,
            'profile': PROFILE_ROUTE,
        };
        
        const target = routeMap[tab];
        if (target) {
            trackEvent('navigation_tab_click', {
                tab_id: tab,
                from_path: location.pathname,
                to_path: target,
            });
            navigate(target);
        }
    };

    const getActiveTab = (): TabType => {
        if (location.pathname.startsWith('/cases/')) {
            return 'rewards';
        }
        switch (location.pathname) {
            case MAIN_ROUTE:
                return 'chat';
            case QUESTS_ROUTE:
                return 'quests';
            case FRIENDS_ROUTE:
                return 'friends';
            case REWARDS_ROUTE:
                return 'rewards';
            case PROFILE_ROUTE:
                return 'profile';
            default:
                /* Подразделы профиля (/profile/story/...) и т.п. */
                if (location.pathname.startsWith(PROFILE_ROUTE + '/') || location.pathname === PROFILE_ROUTE) {
                    return 'profile';
                }
                return 'chat';
        }
    };

    return (
        <motion.div 
            ref={bottomNavigationRef}
            className="flex justify-center z-20 w-full fixed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <Navigation 
                activeTab={getActiveTab()}
                onTabChange={handleTabClick}
            />
        </motion.div>
    );
};

export default BottomNavigation;

