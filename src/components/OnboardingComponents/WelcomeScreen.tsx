import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
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
    const { t } = useTranslate();
    
    // Получаем имя пользователя: username, firstName или "Странник"/"Wanderer"
    const getUserName = () => {
        const userData = user.user;
        if (userData?.firstName) return userData.firstName;
        if (userData?.username) return userData.username;
        return t('wanderer');
    };
    
    const userName = getUserName();
    
    return (
        <div className="flex flex-col justify-between h-full p-6 pb-8 ">
            {/* Welcome Text */}
            <div className="flex-1 flex items-center justify-center ">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center "
                >
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {t('welcome')} {userName}!
                    </h1>
                    <div className="text-lg text-white/90">
                        <p>{t('welcomeDescription')}</p>
                        <p>{t('welcomeDescription2')}</p>
                    </div>
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
