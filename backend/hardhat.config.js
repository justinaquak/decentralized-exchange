/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://goerli.infura.io/v3/1d4b501412e44aae912bbcd054bba9c6`,
      accounts: [process.env.META_PRIVATE_KEY_1, process.env.META_PRIVATE_KEY_2],
      gas: 8e6,
      gasPrice: 8e9,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/1d4b501412e44aae912bbcd054bba9c6`,
      accounts: [process.env.META_PRIVATE_KEY_1, process.env.META_PRIVATE_KEY_2]
    },
    localhost: {
      url: `http://127.0.0.1:8545/`,
      chainId: 31337,
      accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"]
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
