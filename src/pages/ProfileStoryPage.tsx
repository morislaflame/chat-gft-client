import React from 'react';
import PageWrapper from '@/components/CoreComponents/PageWrapper';
import ProfileStoryDetailContainer from '@/components/ProfilePageComponents/ProfileStoryDetailContainer';

const ProfileStoryPage: React.FC = () => {
    return (
        <PageWrapper>
            <ProfileStoryDetailContainer />
        </PageWrapper>
    );
};

export default ProfileStoryPage;
