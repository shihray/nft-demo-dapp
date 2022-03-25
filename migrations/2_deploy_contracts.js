const CryptoBoys = artifacts.require("CryptoBoys");
const Market = artifacts.require("Market");

const admin1 = "0xE590042B4c07F320ECd18013bA59E0374094c968";
const admin2 = "0x63EE8e4aA3A2195Afd253d0b47ec31E2421177d8";

const baseUrl = "ipfs://QmPopnyhv5dtJYT7wNP5hdxkkQsvEoj8zu8JnVSjKXnJxx/";

const dist_fee = 1;
const market_fee = 3;

module.exports = async function(deployer)  {
    
    await deployer.deploy(CryptoBoys, baseUrl, 10000, admin1, admin2);

    await deployer.deploy(Market, CryptoBoys.address, dist_fee, market_fee);
    
};