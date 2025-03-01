import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// ABI for the ERC20 token interface - minimal version for balanceOf
const tokenABI = [
  // Read-only functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

function App() {
  const [balance, setBalance] = useState<string>('0');
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('DTK');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [networkName, setNetworkName] = useState<string>('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  
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

  const initializeTokenContract = (provider: ethers.BrowserProvider) => {
    try {
      const contract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, provider);
      setTokenContract(contract);
      
      // Get token symbol
      contract.symbol().then((symbol: string) => {
        setTokenSymbol(symbol);
      }).catch(console.error);
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
    } catch (error) {
      console.error('Error getting token balance:', error);
      setError('Error fetching token balance');
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
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            >
              {loading ? 'Refreshing...' : 'Refresh Balance'}
            </button>
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
