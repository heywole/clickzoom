const { ethers } = require('ethers');
const WalletTransaction = require('../../models/WalletTransaction');

const PROVIDERS = {
  ethereum: 'https://eth-mainnet.g.alchemy.com/v2/demo',
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  polygon: 'https://polygon-rpc.com',
  bsc: 'https://bsc-dataseed.binance.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
};

const getWallet = (chainName = 'ethereum') => {
  const rpc = PROVIDERS[chainName.toLowerCase()] || PROVIDERS.ethereum;
  const provider = new ethers.JsonRpcProvider(rpc);
  const privateKey = process.env.CLICKZOOM_WALLET_PRIVATE_KEY;
  if (!privateKey) throw new Error('Wallet private key not configured');
  return new ethers.Wallet(privateKey, provider);
};

const getBalance = async (chainName = 'ethereum') => {
  try {
    const wallet = getWallet(chainName);
    const balance = await wallet.provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch (err) {
    console.error('[Wallet] Balance check failed:', err.message);
    return '0.0';
  }
};

const getWalletAddress = () => {
  try {
    const wallet = new ethers.Wallet(process.env.CLICKZOOM_WALLET_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey);
    return wallet.address;
  } catch {
    return null;
  }
};

/**
 * Execute a single transaction for tutorial capture
 * Enforces the "1 real tx" smart rule
 */
const executeTransaction = async ({ tutorialId, stepId, chain, to, value, data }) => {
  const MAX_TX = parseFloat(process.env.CLICKZOOM_WALLET_MAX_TX_AMOUNT || '0.01');
  const txAmount = parseFloat(ethers.formatEther(value || '0'));

  if (txAmount > MAX_TX) {
    await WalletTransaction.create({ tutorialId, stepId, chain, toAddress: to, amount: String(txAmount), status: 'limit_exceeded', limitApplied: 'max_per_tx' });
    throw new Error(`Transaction amount ${txAmount} ETH exceeds limit of ${MAX_TX} ETH`);
  }

  try {
    const wallet = getWallet(chain);
    const tx = await wallet.sendTransaction({ to, value: value || '0', data: data || '0x' });
    const receipt = await tx.wait();

    await WalletTransaction.create({
      tutorialId, stepId, chain,
      transactionHash: receipt.hash,
      fromAddress: wallet.address,
      toAddress: to,
      amount: String(txAmount),
      status: 'confirmed',
    });

    return { hash: receipt.hash, status: 'confirmed' };
  } catch (err) {
    await WalletTransaction.create({ tutorialId, stepId, chain, toAddress: to, amount: String(txAmount), status: 'rejected' });
    throw err;
  }
};

/**
 * Detect if a contract is a known honeypot
 */
const isHoneypot = async (contractAddress, chain) => {
  // In production: check against honeypot detection APIs
  // For now: basic validation only
  if (!ethers.isAddress(contractAddress)) return true;
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  if (contractAddress === zeroAddress) return true;
  return false;
};

module.exports = { getWallet, getBalance, getWalletAddress, executeTransaction, isHoneypot };
