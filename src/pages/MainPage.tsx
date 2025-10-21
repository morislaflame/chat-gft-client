import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import ChatContainer from '@/components/ChatContainer';
import QuestsContainer from '@/components/QuestsContainer';
import FriendsContainer from '@/components/FriendsContainer';
import RewardsContainer from '@/components/RewardsContainer';
import StoreContainer from '@/components/StoreContainer';
import AppLoader from '@/components/AppLoader';
import { Context, type IStoreContext } from '@/store/StoreProvider';

const MainPage: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const [activeTab, setActiveTab] = useState('chat');
    const [showLoader, setShowLoader] = useState(true);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                await user.fetchMyInfo();
                await user.loadBalance();
                await user.loadLanguage();
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();

        // Simple loader timeout
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [user]);


    const handleStarsClick = () => {
        setActiveTab('store');
    };

    const handleLanguageToggle = () => {
        setShowLanguageSelector(true);
    };

    const handleLanguageSelect = (selectedLanguage: 'en' | 'ru') => {
        user.updateLanguage(selectedLanguage);
        setShowLanguageSelector(false);
    };

    const handleStart = () => {
        setShowLoader(false);
    };

    if (showLoader) {
        return (
            <AppLoader
                onStart={handleStart}
                onLanguageSelect={handleLanguageSelect}
                showLanguageSelector={showLanguageSelector}
            />
        );
    }

    return (
        <div className="bg-primary-900 text-gray-200 font-sans overflow-hidden">
            <Header
                onStarsClick={handleStarsClick}
                onLanguageToggle={handleLanguageToggle}
                language={user.user?.language || 'en'}
            />
            
            <Navigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {activeTab === 'chat' && <ChatContainer />}
            {activeTab === 'quests' && <QuestsContainer />}
            {activeTab === 'friends' && <FriendsContainer />}
            {activeTab === 'rewards' && <RewardsContainer />}
            {activeTab === 'store' && <StoreContainer />}
        </div>
    );
});

export default MainPage;