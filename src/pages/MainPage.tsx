import React, { useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import ChatContainer from '@/components/ChatContainer';
import PageWrapper from '@/components/PageWrapper';

const MainPage: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    

    useEffect(() => {
        const loadUserData = async () => {
            try {
                await user.fetchMyInfo();
                await user.loadEnergy();
                await user.loadLanguage();
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, [user]);


    return (
        <PageWrapper>
        <h1 className="text-2xl font-bold">MainPage</h1>
            <ChatContainer />
        </PageWrapper>
    );
});

export default MainPage;