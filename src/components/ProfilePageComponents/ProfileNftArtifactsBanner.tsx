import React from 'react';
import { Card } from '@/components/ui/card';

export type ProfileNftArtifactsBannerProps = {
    title: string;
    description: string;
    onOpen: () => void;
};

const ProfileNftArtifactsBanner: React.FC<ProfileNftArtifactsBannerProps> = ({
    title,
    description,
    onOpen,
}) => {
    return (
        <Card
            onClick={onOpen}
            className="w-full text-left flex flex-col gap-3 cursor-pointer transition-colors hover:bg-primary-700/50"
        >
            <span className="text-xl text-zinc-100 font-semibold">{title}</span>
            <p className="text-sm text-zinc-300 leading-snug">{description}</p>
        </Card>
    );
};

export default ProfileNftArtifactsBanner;
