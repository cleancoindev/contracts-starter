const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config({ path: `./.env.prod` });

module.exports = {
  networks: {
    xdai: {
      provider: () =>
        new HDWalletProvider(
          process.env.deployer_mnemonic,
          `https://dai.poa.network/`
        ),
      networkId: 100,
      gas: 12487794,
      gasPrice: 1e9,
    },
  },
};