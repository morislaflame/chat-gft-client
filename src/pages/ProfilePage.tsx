import React from 'react';
import ProfileContainer from '@/components/ProfilePageComponents/ProfileContainer';
import PageWrapper from '@/components/CoreComponents/PageWrapper';

const ProfilePage: React.FC = () => {
    return (
        <PageWrapper>
            <ProfileContainer />
        </PageWrapper>
    );
};

export default ProfilePage;
