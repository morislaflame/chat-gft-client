import React from 'react';
import { motion } from 'motion/react';
import Button from '@/components/CoreComponents/Button';

interface WelcomeScreenProps {
    welcomeText: string;
    joinAdventureText: string;
    onJoinAdventure: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
    welcomeText,
    joinAdventureText,
    onJoinAdventure
}) => {
    return (
        <div className="flex flex-col justify-between h-full p-6 pb-8">
            {/* Welcome Text */}
            <div className="flex-1 flex items-center justify-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-white text-center"
                >
                    {welcomeText}
                </motion.h1>
            </div>

            {/* Join Adventure Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Button
                    onClick={onJoinAdventure}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    icon="fas fa-rocket"
                >
                    {joinAdventureText}
                </Button>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;

