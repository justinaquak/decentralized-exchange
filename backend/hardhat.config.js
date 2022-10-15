/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

module.exports = {
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://goerli.infura.io/v3/1d4b501412e44aae912bbcd054bba9c6`,
      accounts: [process.env.META_PRIVATE_KEY_1, process.env.META_PRIVATE_KEY_2],
      gas: 21000,
      gasPrice: 1e9,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/1d4b501412e44aae912bbcd054bba9c6`,
      accounts: [process.env.META_PRIVATE_KEY_1, process.env.META_PRIVATE_KEY_2]
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
