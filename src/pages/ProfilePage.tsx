import React from 'react';
import ProfileContainer from '@/components/ProfilePageComponents/ProfileContainer';
import PageWrapper from '@/components/CoreComponents/PageWrapper';

const ProfilePage: React.FC = () => {
    return (
        <PageWrapper>
            <div className="flex flex-1 flex-col min-h-0 w-full overflow-hidden">
                <ProfileContainer />
            </div>
        </PageWrapper>
    );
};

export default ProfilePage;
