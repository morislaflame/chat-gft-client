import React from 'react';
import { motion } from 'motion/react';

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {

    // const navigationHeight = 125;

    return (
        <motion.div 
            className={`bg-primary-900 flex flex-col min-h-0 h-screen text-gray-200 font-sans overflow-hidden w-full hide-scrollbar ios-scroll ${className}`}
            style={{ 
                // paddingBottom: `${navigationHeight}px`,
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;