import React from 'react';
import WalletStatus from '../components/wallet/WalletStatus';
import TransactionLog from '../components/wallet/TransactionLog';
import { SUPPORTED_CHAINS } from '../utils/constants';

const WalletPage = () => (
  <div className="max-w-3xl mx-auto">
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">Web3 Wallet</h1>
      <p className="text-cz-gray text-sm mt-1">Internal platform wallet for automated DeFi tutorial capture only</p>
    </div>

    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mb-6 flex gap-3">
      <span className="text-yellow-400 flex-shrink-0">⚠️</span>
      <div>
        <p className="text-yellow-400 font-semibold text-sm">Platform Wallet Only</p>
        <p className="text-cz-gray text-xs mt-0.5">This wallet is managed by ClickZoom for automated tutorial capture. It is not a personal wallet and does not hold user funds. All transactions are subject to strict spending limits.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
      <WalletStatus />
      <div className="bg-dark-card border border-dark-border rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Spending Limits</h3>
        <div className="space-y-3">
          {[
            { label: 'Max per transaction', value: '0.01 ETH' },
            { label: 'Daily cap (all chains)', value: '0.10 ETH' },
            { label: 'Per tutorial cap', value: '0.02 ETH' },
            { label: 'Alert threshold', value: '80% of any limit' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-dark-border last:border-0">
              <span className="text-sm text-cz-gray">{label}</span>
              <span className="text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-5">
      <h3 className="font-semibold text-white mb-3">Smart Transaction Rule</h3>
      <p className="text-sm text-cz-gray">For tutorials requiring multiple identical transactions, ClickZoom executes only 1 real transaction to capture the full interface flow. A note is automatically added to the tutorial output at those steps.</p>
      <div className="mt-3 bg-orange-900/20 border border-orange-600/30 rounded-lg p-3 text-xs text-orange-400">
        Example overlay: "Note: You will need to complete this transaction 5 times in total."
      </div>
    </div>

    <TransactionLog />
  </div>
);

export default WalletPage;
