import React from 'react';
import Button from './Button';

interface EmptyPageProps {
    icon: string;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
}

const EmptyPage: React.FC<EmptyPageProps> = ({ 
    icon, 
    title, 
    description, 
    actionText, 
    onAction 
}) => {
    return (
        <div className="p-4 overflow-y-auto flex items-center justify-center flex-1">
            <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-800 border border-primary-700 flex items-center justify-center">
                    <i className={`${icon} text-3xl text-gray-400`}></i>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    {title}
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                    {description}
                </p>
                
                {actionText && onAction && (
                    <Button
                        onClick={onAction}
                        variant="secondary"
                        size="lg"
                    >
                        {actionText}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default EmptyPage;
