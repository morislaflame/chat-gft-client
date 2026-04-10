import React from 'react';
import { observer } from 'mobx-react-lite';
import Modal from '@/components/CoreComponents/Modal';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import type { ProfileInventoryArtifact } from '@/types/types';
import Button from '../ui/button';

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
        const modalDescription = isOwned
            ? descriptionTrimmed
                ? descriptionTrimmed
                : undefined
            : t('artifactLockedMissionSubtitle');

        return (
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                closeOnOverlayClick={true}
                title={title}
                description={modalDescription}
                // headerIcon={<i className="fa-solid fa-gem text-white text-2xl" />}
                // headerIconContainerClassName="bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/30"
                closeAriaLabel={t('close')}
                contentClassName="max-h-[min(55vh,420px)] overflow-y-auto"
                footer={
                    <Button onClick={handleClose} variant="gradient" size="lg" className="w-full">
                        {t('close')}
                    </Button>
                }
            >
                {artifact ? (
                    <div className="flex flex-col gap-4 px-1 pb-4">
                        <div className="flex justify-center">
                            <div className="relative w-44 h-44 flex items-center justify-center rounded-xl border btn-default-silver-border overflow-hidden">
                                {isImage ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt=""
                                            className={`max-w-full max-h-full object-contain ${
                                                isOwned ? '' : 'grayscale brightness-[0.72] contrast-[0.92]'
                                            }`}
                                        />
                                        {!isOwned && (
                                            <>
                                                <div
                                                    className="absolute inset-0 pointer-events-none"
                                                    aria-hidden
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/20">
                                                        <i className="fa-solid fa-lock text-2xl" />
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="relative flex h-full w-full items-center justify-center">
                                        <i
                                            className={`fa-solid fa-gem text-6xl ${
                                                isOwned ? 'text-amber-400/90' : 'text-zinc-600 opacity-80 grayscale'
                                            }`}
                                        />
                                        {!isOwned && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/20">
                                                    <i className="fa-solid fa-lock text-2xl" />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isOwned && !descriptionTrimmed ? (
                            <p className="text-zinc-500 text-sm italic text-center">{t('artifactNoDescription')}</p>
                        ) : null}

                        {!isOwned ? (
                            <p className="text-zinc-300 text-sm text-center leading-relaxed">
                                {t('artifactLockedMissionBody')}
                            </p>
                        ) : null}

                    </div>
                ) : null}
            </Modal>
        );
    }
);

export default ArtifactDetailModal;
