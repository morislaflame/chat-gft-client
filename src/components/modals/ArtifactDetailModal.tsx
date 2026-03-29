import React from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { ProfileInventoryArtifact } from '@/types/types';

type ArtifactDetailModalProps = {
    isOpen: boolean;
    onClose: () => void;
    artifact: ProfileInventoryArtifact | null;
    /** Локализованное имя для заголовка */
    title: string;
    /** Локализованное описание (передаётся снаружи) */
    description: string;
    ownedQty: number;
};

const ArtifactDetailModal: React.FC<ArtifactDetailModalProps> = observer(
    ({ isOpen, onClose, artifact, title, description, ownedQty }) => {
        const { t } = useTranslate();
        const { hapticImpact } = useHapticFeedback();

        const handleClose = () => {
            hapticImpact('soft');
            onClose();
        };

        const previewUrl = artifact?.media?.url;
        const previewMime = artifact?.media?.mimeType ?? '';
        const isImage = Boolean(previewUrl && previewMime.startsWith('image/'));
        const isOwned = ownedQty > 0;
        const descriptionTrimmed = description.trim();
        const modalDescription = descriptionTrimmed ? descriptionTrimmed : undefined;

        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                closeOnOverlayClick={true}
                title={title}
                description={modalDescription}
                headerIcon={<i className="fa-solid fa-gem text-white text-2xl" />}
                headerIconContainerClassName="bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/30"
                closeAriaLabel={t('close')}
                contentClassName="max-h-[min(55vh,420px)] overflow-y-auto"
            >
                {artifact ? (
                    <div className="flex flex-col gap-4 px-1">
                        <div className="flex justify-center">
                            <div className="w-44 h-44 flex items-center justify-center rounded-xl bg-primary-800/60 border border-primary-600/40 overflow-hidden">
                                {isImage ? (
                                    <img
                                        src={previewUrl}
                                        alt=""
                                        className={`max-w-full max-h-full object-contain ${isOwned ? '' : 'brightness-0'}`}
                                    />
                                ) : (
                                    <i
                                        className={`fa-solid fa-gem text-6xl ${isOwned ? 'text-amber-400/90' : 'text-zinc-600'}`}
                                    />
                                )}
                            </div>
                        </div>

                        {!descriptionTrimmed ? (
                            <p className="text-zinc-500 text-sm italic text-center">{t('artifactNoDescription')}</p>
                        ) : null}

                        <div
                            className={`text-center text-xs font-medium rounded-lg py-2 px-3 border ${
                                isOwned
                                    ? 'text-amber-300 bg-amber-500/10 border-amber-500/25'
                                    : 'text-zinc-500 bg-primary-800/50 border-primary-600/40'
                            }`}
                        >
                            {isOwned ? (
                                <>
                                    {t('artifactInInventory')}: ×{ownedQty}
                                </>
                            ) : (
                                t('artifactNotInInventory')
                            )}
                        </div>
                    </div>
                ) : null}
            </Modal>
        );
    }
);

export default ArtifactDetailModal;
