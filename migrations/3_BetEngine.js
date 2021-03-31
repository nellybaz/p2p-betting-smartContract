const BetEngine = artifacts.require("BetEngine");

module.exports = function (deployer) {
  deployer.deploy(BetEngine, "0x72CBDeB79f5e8dF250caDae9d44F7EACfbb454F0");
};
