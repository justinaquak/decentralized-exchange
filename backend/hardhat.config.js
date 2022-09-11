/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
  defaultNetwork: "goerli",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PRIVATE_KEY}`,
      accounts: [process.env.META_PRIVATE_KEY]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PRIVATE_KEY}`,
      accounts: [process.env.META_PRIVATE_KEY]
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
