import React from 'react';
import type { UserInfo } from '@/types/types';

export type ProfileUserHeaderProps = {
    user: UserInfo | null | undefined;
    displayNickname: string;
};

const ProfileUserHeader: React.FC<ProfileUserHeaderProps> = ({ user: u, displayNickname }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden btn-default-silver-border flex-shrink-0 bg-primary-800">
                {u?.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <i className="fas fa-user text-3xl text-zinc-500" />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-white break-words">{displayNickname}</h1>
            </div>
        </div>
    );
};

export default ProfileUserHeader;
