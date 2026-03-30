import React, { useEffect, useState } from 'react';
import { walletService } from '../../services/apiService';
import { formatDate } from '../../utils/helpers';

const statusColors = {
  confirmed: 'text-neon-mint',
  pending: 'text-yellow-400',
  rejected: 'text-red-400',
  limit_exceeded: 'text-orange-400',
};

const TransactionLog = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletService.getTransactions().then(r => setTxs(r.data?.transactions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 animate-pulse bg-dark-card rounded-xl" />;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5">
      <h3 className="font-semibold text-white mb-4">Transaction Log</h3>
      {txs.length === 0 ? (
        <p className="text-cz-gray text-sm text-center py-6">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {txs.slice(0, 10).map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
              <div>
                <p className="text-sm text-white font-medium">{tx.chain}</p>
                <p className="text-xs text-cz-gray truncate max-w-[160px]">{tx.transactionHash || 'Pending'}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${statusColors[tx.status] || 'text-cz-gray'}`}>{tx.status}</p>
                <p className="text-xs text-cz-gray">{tx.amount} ETH</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionLog;
