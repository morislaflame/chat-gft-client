import React, { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import Navigation from './Navigation';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE } from '@/utils/consts';


const Header: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('chat');
    
    useEffect(() => {
        switch (location.pathname) {
            case MAIN_ROUTE:
                setActiveTab('chat');
                break;
            case QUESTS_ROUTE:
                setActiveTab('quests');
                break;
            case FRIENDS_ROUTE:
                setActiveTab('friends');
                break;
            case REWARDS_ROUTE:
                setActiveTab('rewards');
                break;
            case STORE_ROUTE:
                setActiveTab('store');
                break;
            default:
                setActiveTab('chat');
        }
    }, [location.pathname]);
    
    const handleStarsClick = () => {
        setActiveTab('store');
    }


    return (
        <div className="fixed top-0 left-0 w-full z-20 transition-transform duration-300">
            {/* App Header */}
            <div className="bg-primary-800 py-3 px-4 flex items-center justify-between border-b border-primary-700">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                            <span className="font-bold text-xl">DV</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-primary-800"></div>
                    </div>
                    <div>
                        <div className="font-bold text-gray-300 text-sm mb-1">
                            {user.user?.firstName || user.user?.username || 'Dark Lord'}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                            <div className="w-16 h-1.5 bg-primary-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-400 to-red-600 energy-fill" 
                                    style={{ width: `${user.user?.energy || 0}%` }}
                                >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button className="bg-primary-700 p-1.5 rounded-full hover:bg-primary-600 transition">
                        <i className="fa-solid fa-gem text-amber-400 text-lg"></i>
                    </button>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={handleStarsClick}
                            className="bg-primary-700 p-1.5 rounded-full hover:bg-primary-600 transition relative"
                        >
                            <i className="fa-solid fa-bolt text-purple-400 text-lg"></i>
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                            {user.energy}
                        </div>
                        </button>
                        <button 
                            onClick={() => {}}
                            className="bg-primary-700 px-2 py-1 rounded-full hover:bg-primary-600 transition flex items-center space-x-1"
                        >
                            <i className="fas fa-globe text-gray-300 text-sm"></i>
                            <span className="text-xs">{user.user?.language?.toUpperCase() || 'EN'}</span>
                        </button>
                    </div>
                </div>
            </div>
            <Navigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
        </div>
    );
});

export default Header;
