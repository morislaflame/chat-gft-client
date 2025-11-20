import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { MAIN_ROUTE } from '@/utils/consts';

interface PageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
    const location = useLocation();
    const isMainPage = location.pathname === MAIN_ROUTE;
    const headerHeight = isMainPage ? 64 : 122;

    return (
        <motion.div 
            className={`bg-primary-900 flex text-gray-200 font-sans overflow-hidden hide-scrollbar ios-scroll ${className}`}
            style={{ 
                height: `calc(100vh - ${headerHeight}px)`,
                marginTop: `${headerHeight}px`,
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