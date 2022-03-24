require("babel-register");
require("babel-polyfill");

var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "cheese maid advance movie involve rookie loud sword boil element jaguar pigeon";

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*", // Match any network id
        },
        rinkeby: {
            provider: function() { 
             return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/df683e29619a4abab94254e23193cee7");
            },
            network_id: 4,
        }
    },
    contracts_directory: "./src/contracts/",
    contracts_build_directory: "./src/abis/",
    compilers: {
        solc: {
            version: "0.8.12",
            optimizer: {
            enabled: true,
            runs: 200,
            },
        },
    },
    plugins: ["truffle-contract-size"],
};
