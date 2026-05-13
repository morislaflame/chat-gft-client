import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { PROFILE_ROUTE, buildProfileStoryPath } from '@/utils/consts';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

/**
 * После финальной миссии арки без полного сбора артефактов уровня — подсказка открыть профиль.
 */
const NextLevelArtifactsGateModal: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const navigate = useNavigate();
    const { hapticImpact } = useHapticFeedback();

    const gate = chat.nextLevelArtifactsGate;
    const isOpen = gate != null;
    const level = gate?.completedLevel ?? 1;
    const body = t('nextLevelArtifactsGateBody').replace('{level}', String(level));
    const body2 = t('nextLevelArtifactsGateBody2');
    const handleClose = () => {
        chat.closeNextLevelArtifactsGate();
    };

    const handleOpenProfile = () => {
        hapticImpact('soft');
        chat.closeNextLevelArtifactsGate();
        const hn = user.user?.selectedHistoryName?.trim();
        if (hn) {
            navigate(`${buildProfileStoryPath(hn)}#artifact-level-${level}`);
        } else {
            navigate(PROFILE_ROUTE);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={t('nextLevelArtifactsGateTitle')}
            footer={
                <Button onClick={handleOpenProfile} variant="gradient" size="lg" className="w-full" icon="fa-solid fa-user">
                    {t('openProfileForArtifacts')}
                </Button>
            }
        >
            <div className="px-4 pb-2">
                <p className="text-sm leading-relaxed text-zinc-200">- {body}</p><br />
                <p className="text-sm leading-relaxed text-zinc-200">- {body2}</p>
            </div>
        </Modal>
    );
});

export default NextLevelArtifactsGateModal;
