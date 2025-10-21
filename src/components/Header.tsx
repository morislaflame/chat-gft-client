import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';

interface HeaderProps {
    onStarsClick: () => void;
    onLanguageToggle: () => void;
    language: 'en' | 'ru';
}

const Header: React.FC<HeaderProps> = observer(({ onStarsClick, onLanguageToggle, language }) => {
    const { user: userStore } = useContext(Context) as IStoreContext;

    // Balance is loaded in MainPage, no need to load it here
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
                        <div className="font-bold">
                            {userStore.user?.firstName || userStore.user?.username || 'Dark Lord'}
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                            <div className="w-16 h-1.5 bg-primary-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-400 to-red-600 energy-fill" 
                                    style={{ width: `${userStore.user?.energy || 0}%` }}
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
                            onClick={onStarsClick}
                            className="bg-primary-700 p-1.5 rounded-full hover:bg-primary-600 transition relative"
                        >
                            <i className="fa-solid fa-bolt text-purple-400 text-lg"></i>
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                            {userStore.balance}
                        </div>
                        </button>
                        <button 
                            onClick={onLanguageToggle}
                            className="bg-primary-700 px-2 py-1 rounded-full hover:bg-primary-600 transition flex items-center space-x-1"
                        >
                            <i className="fas fa-globe text-gray-300 text-sm"></i>
                            <span className="text-xs">{language.toUpperCase()}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Header;
