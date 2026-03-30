import React, { useEffect, useState } from 'react';
import { walletService } from '../../services/apiService';
import { SUPPORTED_CHAINS } from '../../utils/constants';

const WalletStatus = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletService.getStatus().then(r => setWallet(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-24 animate-pulse bg-dark-card rounded-xl" />;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-mint animate-pulse" />
          ClickZoom Internal Wallet
        </h3>
        <span className="text-xs bg-neon-mint/10 text-neon-mint px-2 py-1 rounded-full">Active</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-deep-dark rounded-lg p-3">
          <p className="text-xs text-cz-gray mb-1">ETH Balance</p>
          <p className="text-white font-semibold">{wallet?.balance?.eth || '0.0000'} ETH</p>
        </div>
        <div className="bg-deep-dark rounded-lg p-3">
          <p className="text-xs text-cz-gray mb-1">Daily Remaining</p>
          <p className="text-white font-semibold">{wallet?.limits?.dailyRemaining || '0.10'} ETH</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-cz-gray mb-2">Supported chains</p>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTED_CHAINS.map(chain => (
            <span key={chain} className="text-xs bg-dark-border text-cz-gray px-2 py-0.5 rounded-full">{chain}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletStatus;
