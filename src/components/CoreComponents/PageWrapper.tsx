import React from 'react';

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
    return (
        <div 
            className={`bg-primary-900 flex text-gray-200 font-sans overflow-hidden hide-scrollbar ios-scroll ${className}`}
            style={{ 
                height: 'calc(100vh - 122px)',
                marginTop: `122px`,
            }}
        >
            {children}
        </div>
    );
};

export default PageWrapper;
