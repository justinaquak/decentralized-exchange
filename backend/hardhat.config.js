/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    hardhat: {},
    goerli: {
      url: `https://goerli.infura.io/v3/aa3955c0486d4e6d9f784b5dd3e405c6`,
      // accounts: [
      //   process.env.META_PRIVATE_KEY_1,
      //   process.env.META_PRIVATE_KEY_2,
      //   process.env.META_PRIVATE_KEY_3,
      // ],
      gas: 8e6,
      gasPrice: 8e9,
      gasLimit: 1e10,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: `http://127.0.0.1:8545/`,
      chainId: 31337,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      ],
      gas: 8e6,
      gasPrice: 8e9,
      gasLimit: 1e10,
      allowUnlimitedContractSize: true,
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
