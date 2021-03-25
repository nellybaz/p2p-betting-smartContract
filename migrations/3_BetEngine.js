const BetEngine = artifacts.require("BetEngine");

module.exports = function (deployer) {
  deployer.deploy(BetEngine, "0x2502a3015B3665C820d75A2c5297F91A981C960e");
};
