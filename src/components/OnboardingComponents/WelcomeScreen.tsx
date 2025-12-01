import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import Button from '@/components/CoreComponents/Button';

interface WelcomeScreenProps {
    joinAdventureText: string;
    onJoinAdventure: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = observer(({
    joinAdventureText,
    onJoinAdventure
}) => {
    const { user } = useContext(Context) as IStoreContext;
    
    // Получаем имя пользователя: username, firstName или "Странник"
    const getUserName = () => {
        const userData = user.user;
        if (userData?.username) return userData.username;
        if (userData?.firstName) return userData.firstName;
        return 'Странник';
    };
    
    const userName = getUserName();
    const userLanguage = (user.user?.language || 'en') as 'en' | 'ru';
    
    const greeting = userName;
    const description = userLanguage === 'ru' 
        ? 'Tы стоишь на пороге новой истории. Каждая твоя реплика меняет судьбу.'
        : 'You stand on the threshold of a new story. Every word you say changes destiny.';
    
    return (
        <div className="flex flex-col justify-between h-full p-6 pb-8">
            {/* Welcome Text */}
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Welcome, {greeting}!
                    </h1>
                    <p className="text-lg text-white/90">
                        {description}
                    </p>
                </motion.div>
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
});

export default WelcomeScreen;
