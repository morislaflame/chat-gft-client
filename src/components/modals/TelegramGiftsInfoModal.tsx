import React from 'react';
import Modal from '@/components/CoreComponents/Modal';
import Button, { motionInteractiveSurfaceProps } from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { motion } from 'motion/react';

export type TelegramGiftsMarketplace = {
    /** Без ведущего @ */
    telegramUsername: string;
    /** Отображаемая подпись, напр. @Portals */
    label: string;
    /** Иконка в public, напр. /portals.jpg */
    iconSrc: string;
};

export const TELEGRAM_GIFT_MARKETPLACES: TelegramGiftsMarketplace[] = [
    { telegramUsername: 'Portals', label: 'Portals', iconSrc: '/portals.jpg' },
    { telegramUsername: 'Tonnel_Network_bot', label: 'TonnelMarket', iconSrc: '/tonnel.jpg' },
    { telegramUsername: 'mrkt', label: 'mrkt', iconSrc: '/mrkt.jpg' },
];

export type TelegramGiftsInfoModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const TelegramGiftsInfoModal: React.FC<TelegramGiftsInfoModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();

    const handleClose = () => {
        hapticImpact('soft');
        onClose();
    };

    const openMarketUsername = (username: string) => {
        hapticImpact('soft');
        const url = `https://t.me/${username.replace(/^@/, '')}`;
        const tg = window.Telegram?.WebApp;
        if (tg?.openTelegramLink) tg.openTelegramLink(url);
        else window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            closeAriaLabel={t('close')}
            title={t('telegramGiftsModalTitle')}
            // description={t('telegramGiftsModalSubtitle')}
            footer={
                <Button onClick={handleClose} variant="gradient" size="lg" className="w-full">
                    {t('gotIt')}
                </Button>
            }
            contentClassName="max-h-[min(60vh,480px)]"
        >
            <div className="space-y-3 text-[15px] leading-relaxed text-zinc-200">
                <p>- {t('telegramGiftsModalP1')}</p>
                <p>- {t('telegramGiftsModalP2')}</p>
                <p className="text-sm font-semibold tracking-wide text-zinc-400 pt-1">
                    {t('telegramGiftsMarketplacesHeading')}
                </p>
                <ul className="flex flex-col gap-2">
                    {TELEGRAM_GIFT_MARKETPLACES.map((m) => (
                        <li key={m.telegramUsername}>
                            <motion.button
                                type="button"
                                onClick={() => openMarketUsername(m.telegramUsername)}
                                className="flex w-full items-center gap-3 text-left text-sm font-semibold cursor-pointer"
                                {...motionInteractiveSurfaceProps}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img
                                    src={m.iconSrc}
                                    alt=""
                                    width={24}
                                    height={24}
                                    className="shrink-0 rounded-full object-cover ring-1 ring-white/10"
                                />
                                <span className="min-w-0 flex-1 text-white">{m.label}</span>
                                <i className="fa-solid fa-arrow-up-right-from-square shrink-0 text-xs text-zinc-500" aria-hidden />
                            </motion.button>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

export default TelegramGiftsInfoModal;
