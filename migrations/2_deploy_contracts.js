const CryptoBoys = artifacts.require("CryptoBoys");
const Market = artifacts.require("Market");

const admin1 = "0xE590042B4c07F320ECd18013bA59E0374094c968";
const admin2 = "0x63EE8e4aA3A2195Afd253d0b47ec31E2421177d8";

module.exports = async function(deployer)  {
    await deployer.deploy(Market).then(function() {
        return deployer.deploy(CryptoBoys, admin1, admin2, Market.address)
    });
};