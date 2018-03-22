module.exports = {
  networks: {
    ropsten: {
      provider: () => {
        return require("@daonomic/trezor-web3-provider")("http://ether-dev:8545", "m/44'/1'/0'/3/0");
      },
      network_id: 3,
      from: "0x1a65c05c7873ee1c5445a0e147feefbe1e773f48",
//      gas: 2000000,//sale/token
      gas: 100000,//small transactions
	  gasPrice: 10000000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};