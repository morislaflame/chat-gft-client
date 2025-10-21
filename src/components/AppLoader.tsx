import React from 'react';

interface AppLoaderProps {
    onStart: () => void;
    onLanguageSelect: (language: 'en' | 'ru') => void;
    showLanguageSelector: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({ 
    onStart, 
    onLanguageSelect, 
    showLanguageSelector 
}) => {
    return (
        <div className="fixed inset-0 bg-black z-[9999] opacity-100 transition-opacity duration-300 flex items-end justify-center overflow-hidden">
            <img 
                src="/images/loader.png" 
                alt="Loading..." 
                className="absolute inset-0 w-full h-full max-w-full max-h-full object-cover object-center pointer-events-none"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                }}
            />
            
            {/* Language selector */}
            {showLanguageSelector && (
                <div className="absolute top-6 z-10 bg-black/60 backdrop-blur-sm rounded-2xl p-4 w-[90%] max-w-sm border border-white/10">
                    <div className="text-center text-gray-200 text-sm mb-3">
                        Choose your language / Выберите язык
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onLanguageSelect('en')}
                            className="px-3 py-2 rounded-lg bg-primary-800 hover:bg-primary-700 border border-white/10"
                        >
                            English
                        </button>
                        <button
                            onClick={() => onLanguageSelect('ru')}
                            className="px-3 py-2 rounded-lg bg-primary-800 hover:bg-primary-700 border border-white/10"
                        >
                            Русский
                        </button>
                    </div>
                </div>
            )}
            
            {/* Bottom CTA */}
            <div className="relative z-10 w-full px-6 pb-10 pt-6 pointer-events-auto">
                <div className="max-w-sm mx-auto">
                    <button
                        onClick={onStart}
                        className="cta-button w-full select-none"
                    >
                        <span className="cta-shine"></span>
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppLoader;
