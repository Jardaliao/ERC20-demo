import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config({path: __dirname + '/.env'});

const { ALCHEMY_API_KEY, MNEMONIC } = process.env;


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
    },
  },
};

export default config;
