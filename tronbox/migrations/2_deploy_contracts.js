var SecretToken = artifacts.require("./SecretToken.sol");

module.exports = function (deployer) {
  deployer.deploy(SecretToken, "test token", "TEST");
};
