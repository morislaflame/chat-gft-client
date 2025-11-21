import React from 'react';
import { observer } from 'mobx-react-lite';
import ChatContainer from '@/components/MainPageComponents/ChatContainer';
import PageWrapper from '@/components/CoreComponents/PageWrapper';

const MainPage: React.FC = observer(() => {
    return (
        <PageWrapper>
            <ChatContainer />
        </PageWrapper>
    );
});

export default MainPage;