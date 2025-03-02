import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// ABI for the ERC20 token interface - extended with claim and transfer functions
const tokenABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function claim(address to) external",
  // Additional view functions
  "function getLastClaimed(address addr) view returns (uint256)",
  "function getClaimUnit() view returns (uint256)"
];

function App() {
  const [balance, setBalance] = useState<string>('0');
  const [account, setAccount] = useState<string>('');
  const [, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('DTK');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [networkName, setNetworkName] = useState<string>('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [claimStatus, setClaimStatus] = useState<string>('');
  const [nextClaimTime, setNextClaimTime] = useState<string>('');
  
  // Sepolia testnet chainId
  const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia in hex

  // You would replace this with your actual deployed token address
  const TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS; // Replace with actual address

  useEffect(() => {
    // Check if wallet is already connected
    checkIfWalletIsConnected();
    
    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      // Clean up listener when component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    // Get token balance when account changes
    if (account && tokenContract) {
      getTokenBalance();
    }
  }, [account, tokenContract]);

  const handleChainChanged = () => {
    // Reload the page when network changes
    window.location.reload();
  };
  
  const checkNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);
      setNetworkName(network.name);
      
      if (chainId === SEPOLIA_CHAIN_ID) {
        setIsCorrectNetwork(true);
      } else {
        setIsCorrectNetwork(false);
      }
      
      return chainId === SEPOLIA_CHAIN_ID;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };
  
  // Network switching functionality has been removed
  
  const checkIfWalletIsConnected = async () => {
    try {
      // Check if window.ethereum is available (MetaMask or similar wallet)
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        // Check network
        await checkNetwork(browserProvider);
        
        // Check if already connected
        const accounts = await browserProvider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          initializeTokenContract(browserProvider);
        }
      } else {
        setError('Please install MetaMask or another Ethereum wallet');
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setError('Error connecting to wallet');
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        // Request account access
        const accounts = await browserProvider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
        setProvider(browserProvider);
        
        // Check if on Sepolia network
        const isOnSepolia = await checkNetwork(browserProvider);
        
        if (isOnSepolia) {
          initializeTokenContract(browserProvider);
        }
      } else {
        setError('Please install MetaMask or another Ethereum wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Error connecting to wallet');
    } finally {
      setLoading(false);
    }
  };

  const initializeTokenContract = async (provider: ethers.BrowserProvider) => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, signer);
      setTokenContract(contract);
      
      // Get token symbol
      contract.symbol().then((symbol: string) => {
        setTokenSymbol(symbol);
      }).catch(console.error);
      
      // Check claim status if account is connected
      if (account) {
        checkClaimStatus(contract, account);
      }
    } catch (error) {
      console.error('Error initializing token contract:', error);
    }
  };

  const getTokenBalance = async () => {
    try {
      if (!tokenContract || !account) return;
      
      setLoading(true);
      const decimals = await tokenContract.decimals();
      const rawBalance = await tokenContract.balanceOf(account);
      
      // Format the balance with proper decimals
      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
      setBalance(formattedBalance);
      
      // Also check claim status when refreshing balance
      await checkClaimStatus(tokenContract, account);
    } catch (error) {
      console.error('Error getting token balance:', error);
      setError('Error fetching token balance');
    } finally {
      setLoading(false);
    }
  };
  
  const checkClaimStatus = async (contract: ethers.Contract, userAddress: string) => {
    try {
      const lastClaimedTimestamp = await contract.getLastClaimed(userAddress);
      const claimUnit = await contract.getClaimUnit();
      const decimals = await contract.decimals();
      const formattedClaimUnit = ethers.formatUnits(claimUnit, decimals);
      
      // If lastClaimedTimestamp is 0, user has never claimed
      if (lastClaimedTimestamp.toString() === '0') {
        setClaimStatus('You can claim tokens now!');
        setNextClaimTime('');
        return;
      }
      
      // Calculate next claim time
      const claimInterval = 24 * 60 * 60; // 1 day in seconds
      const nextClaimTimestamp = Number(lastClaimedTimestamp) + claimInterval;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      if (currentTimestamp >= nextClaimTimestamp) {
        setClaimStatus(`You can claim ${formattedClaimUnit} ${tokenSymbol} now!`);
        setNextClaimTime('');
      } else {
        const timeRemaining = nextClaimTimestamp - currentTimestamp;
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        
        setClaimStatus('You have already claimed today.');
        setNextClaimTime(`Next claim available in ${hours}h ${minutes}m`);
      }
    } catch (error) {
      console.error('Error checking claim status:', error);
      setClaimStatus('Error checking claim status');
    }
  };
  
  const handleClaim = async () => {
    try {
      if (!tokenContract || !account || !isCorrectNetwork) return;
      
      setLoading(true);
      setError('');
      
      // Call the claim function
      const tx = await tokenContract.claim(account);
      await tx.wait();
      
      // Update balance and claim status
      await getTokenBalance();
      setClaimStatus('Tokens claimed successfully!');
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      
      // Handle specific error for claiming too early
      if (error.message.includes('ClaimTooEarly')) {
        setError('You have already claimed tokens today. Please try again tomorrow.');
      } else {
        setError('Error claiming tokens. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleTransfer = async () => {
    try {
      if (!tokenContract || !account || !isCorrectNetwork) return;
      if (!transferAddress || !transferAmount) {
        setError('Please enter a valid address and amount');
        return;
      }
      
      setLoading(true);
      setError('');
      
      // Convert amount to wei
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.parseUnits(transferAmount, decimals);
      
      // Call the transfer function
      const tx = await tokenContract.transfer(transferAddress, amountInWei);
      await tx.wait();
      
      // Reset form and update balance
      setTransferAddress('');
      setTransferAmount('');
      await getTokenBalance();
      
      // Show success message
      setError(`Successfully transferred ${transferAmount} ${tokenSymbol} to ${transferAddress}`);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      setError('Error transferring tokens. Please check the address and amount.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">DemoToken</h1>
          <p className="text-gray-600 mt-2">Check your DemoToken (DTK) balance</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Sepolia Testnet
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {networkName && (
          <div className={`text-center p-2 rounded-lg ${isCorrectNetwork ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <p className={`text-sm ${isCorrectNetwork ? 'text-green-800' : 'text-yellow-800'}`}>
              {isCorrectNetwork 
                ? `Connected to Sepolia Testnet` 
                : `Connected to ${networkName}. This app works on Sepolia Testnet`}
            </p>
          </div>
        )}
        
        {!account ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Connect your wallet to view your token balance</p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Connected Account</p>
              <p className="text-gray-800 font-mono text-sm truncate">{account}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Token Balance</p>
              <div className="flex items-center justify-center">
                <p className="text-3xl font-bold text-gray-800">
                  {loading ? 'Loading...' : balance}
                </p>
                <span className="ml-2 text-gray-600">{tokenSymbol}</span>
              </div>
            </div>

            <button
              onClick={getTokenBalance}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out mb-4"
            >
              {loading ? 'Refreshing...' : 'Refresh Balance'}
            </button>
            
            {/* Claim Section */}
            <div className="border-t pt-4 mt-2">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Claim Daily Tokens</h3>
              {claimStatus && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-blue-800">{claimStatus}</p>
                  {nextClaimTime && <p className="text-xs text-blue-600 mt-1">{nextClaimTime}</p>}
                </div>
              )}
              <button
                onClick={handleClaim}
                disabled={loading || (nextClaimTime !== '')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Claim Tokens'}
              </button>
            </div>
            
            {/* Transfer Section */}
            <div className="border-t pt-4 mt-2">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Transfer Tokens</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="transferAddress" className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                  <input
                    id="transferAddress"
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="flex">
                    <input
                      id="transferAmount"
                      type="text"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                      {tokenSymbol}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleTransfer}
                  disabled={loading || !transferAddress || !transferAmount}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Transfer Tokens'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}
