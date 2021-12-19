require("@nomiclabs/hardhat-waffle");
require("./tasks/index.ts");
require("dotenv").config();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    localhost: {
      url: "http://localhost:8545"
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      chainId: 4,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
