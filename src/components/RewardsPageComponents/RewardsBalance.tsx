import React from 'react';

type RewardsBalanceProps = {
    balanceLabel: string;
    balance: number;
};

const RewardsBalance: React.FC<RewardsBalanceProps> = ({ balanceLabel, balance }) => {
    return (
        <div className="bg-card border border-primary-700 rounded-xl p-3">
            <div className="text-sm text-gray-400 text-center flex items-center justify-center gap-1">
                <i className="fas fa-wallet"></i>
                <span>{balanceLabel} {balance}</span>
                <i className="fa-solid fa-gem text-white"></i>
            </div>
        </div>
    );
};

export default RewardsBalance;
