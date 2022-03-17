const zombieToken = artifacts.require("ZombieToken");

module.exports = function (deployer) {
  deployer.deploy(zombieToken, "ZombieToken", "ZOMBIES");
};
