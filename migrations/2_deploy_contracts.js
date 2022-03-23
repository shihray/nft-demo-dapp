const CryptoBoys = artifacts.require("CryptoBoys");
const Market = artifacts.require("Market");

const admin1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const admin2 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

module.exports = function(deployer)  {
    deployer.deploy(Market).then(function() {
        return deployer.deploy(CryptoBoys, admin1, admin2, Market.address)
    });
};