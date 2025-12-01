import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { STORE_ROUTE, REWARDS_ROUTE } from '@/utils/consts';


const Header: React.FC = observer(() => {
    const { user, chat } = useContext(Context) as IStoreContext;
    const navigate = useNavigate();
    
    // Получаем аватар текущей истории
    const avatarUrl = chat.avatar?.url;
    
    const handleStarsClick = () => {
        navigate(STORE_ROUTE);
    }

    const handleGemsClick = () => {
        navigate(REWARDS_ROUTE);
    }

    const handleAvatarClick = () => {
        // Открываем онбординг на этапе выбора истории
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const openHistorySelection = (window as any).openHistorySelection;
        if (openHistorySelection) {
            openHistorySelection();
        }
    }

    return (
        <div className="fixed top-0 left-0 w-full z-20 transition-transform duration-300 flex flex-col justify-center items-center header">
            {/* App Header */}
            <div className=" py-1 px-4 flex items-center justify-between w-full">
                <div className="flex items-center space-x-3 cursor-pointer backdrop-blur-sm rounded-full p-2"
                onClick={handleAvatarClick}>
                    <div className="relative">
                        <div 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center cursor-pointer hover:from-red-500 hover:to-red-700 transition-all overflow-hidden p-1"
                        >
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt="History avatar" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <i className="fas fa-mask text-xs text-white"></i>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="text-white text-xs font-medium">
                                {(() => {
                                    const historyName = user.user?.selectedHistoryName || 'starwars';
                                    const historyDisplayNames: Record<string, { en: string; ru: string }> = {
                                        starwars: { en: 'Star Wars', ru: 'Звёздные Войны' },
                                    };
                                    const userLanguage = (user.user?.language || 'en') as 'en' | 'ru';
                                    const displayName = historyDisplayNames[historyName];
                                    if (displayName) {
                                        return displayName[userLanguage];
                                    }
                                    return historyName.charAt(0).toUpperCase() + historyName.slice(1);
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleGemsClick}
                        className="backdrop-blur-sm rounded-full h-8 w-12 rounded-full hover:bg-primary-600 transition relative cursor-pointer"
                    >
                        <i className="fa-solid fa-gem text-amber-400 text-lg"></i>
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                            {user.user?.balance || 0}
                        </div>
                    </button>
                        <button 
                            onClick={handleStarsClick}
                            className="backdrop-blur-sm rounded-full h-8 w-12 rounded-full hover:bg-primary-600 transition relative cursor-pointer"
                        >
                            <i className="fa-solid fa-bolt text-purple-400 text-lg"></i>
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                            {user.energy}
                        </div>
                        </button>
                        {/* <button 
                            onClick={() => {}}
                            className="bg-primary-700 h-8 w-12 rounded-full hover:bg-primary-600 transition flex items-center justify-center space-x-1 cursor-pointer"
                        >
                            <i className="fas fa-globe text-gray-300 text-sm "></i>
                            <span className="text-xs">{user.user?.language?.toUpperCase() || 'EN'}</span>
                        </button> */}
                </div>
            </div>
        </div>
    );
});

export default Header;
