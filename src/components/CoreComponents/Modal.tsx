import React, { type ReactNode } from 'react';

import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  swipeToClose?: boolean;

  title?: ReactNode;
  description?: ReactNode;
  headerIcon?: ReactNode;
  headerIconContainerClassName?: string;

  /** Rendered inside drawer footer (typically action buttons) */
  footer?: ReactNode;
  footerClassName?: string;

  /** Scrollable content wrapper inside the drawer */
  contentClassName?: string;

  /** Disable top-right close button */
  hideCloseButton?: boolean;
  closeDisabled?: boolean;
  closeAriaLabel?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  overlayClassName = '',
  closeOnOverlayClick = true,
  swipeToClose = true,
  title,
  description,
  headerIcon,
  headerIconContainerClassName = '',
  footer,
  footerClassName = '',
  contentClassName = '',
  hideCloseButton = false,
  closeDisabled = false,
  closeAriaLabel = 'Close',
}) => {
  if (typeof document === 'undefined') return null;

  // Vaul: `dismissible` toggles overlay click + escape + drag-to-close together.
  // We set it based on swipeToClose (drag), while overlay click is controlled separately.
  const dismissible = swipeToClose;

  const overlayProps = closeOnOverlayClick
    ? // If dismissible=true, Vaul will already close on overlay click.
      // If dismissible=false, we close manually.
      (dismissible ? undefined : { onClick: onClose })
    : { style: { pointerEvents: 'none' as const } };

  const hasHeader = !!(title || description || headerIcon || (!hideCloseButton && !closeDisabled) || (!hideCloseButton && closeDisabled));

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="bottom"
      dismissible={dismissible}
      modal
      shouldScaleBackground={false}
    >
      <DrawerContent
        overlayClassName={overlayClassName}
        overlayProps={overlayProps}
        className={cn('max-h-[85vh] overflow-hidden', className)}
      >
        <div className="mx-auto w-full max-w-md h-full flex flex-col">
          {hasHeader ? (
            <div className="px-4 pb-8">
              <div className="flex items-center flex-col gap-3 relative">
                {headerIcon ? (
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center shrink-0',
                      headerIconContainerClassName
                    )}
                  >
                    {headerIcon}
                  </div>
                ) : null}

                <div className="min-w-0 flex-1 pt-1 text-center items-center flex-col gap-2 flex">
                  {title ? (
                    <DrawerTitle className="text-white text-3xl font-bold leading-tight">
                      {title}
                    </DrawerTitle>
                  ) : null}
                  {description ? (
                    <DrawerDescription className="text-gray-400 text-sm mt-1 max-w-[80%]">
                      {description}
                    </DrawerDescription>
                  ) : null}
                </div>

                {!hideCloseButton ? (
                  closeDisabled ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 min-w-8 rounded-full absolute top-0 right-0"
                      aria-label={closeAriaLabel}
                      disabled
                      icon="fas fa-times"
                    />
                  ) : (
                    <DrawerClose asChild>
                      <Button
                        variant="nav"
                        size="icon"
                        className="w-8 h-8 min-w-8 rounded-full absolute top-0 right-0"
                        aria-label={closeAriaLabel}
                        icon="fas fa-times"
                      />
                    </DrawerClose>
                  )
                ) : null}
              </div>
            </div>
          ) : null}

          <div className={cn('flex-1 overflow-y-auto px-4 pb-4 ios-scroll', contentClassName)}>
            {children}
          </div>

          {footer ? (
            <DrawerFooter className={cn('pt-8 pb-8', footerClassName)}>
              {footer}
            </DrawerFooter>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default Modal;

