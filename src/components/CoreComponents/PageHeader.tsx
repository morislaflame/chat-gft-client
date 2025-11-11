import React from 'react';

interface PageHeaderProps {
    title: string;
    icon?: string;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, className = '' }) => {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {icon && <i className={icon}></i>}
                {title}
            </h2>
        </div>
    );
};

export default PageHeader;

