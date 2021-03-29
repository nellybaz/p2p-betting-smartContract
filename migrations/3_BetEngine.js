const BetEngine = artifacts.require("BetEngine");

module.exports = function (deployer) {
  deployer.deploy(BetEngine, "0x8d4192DE5eb5803e2Ecc0F9d6672e7BaeF3F502E");
};
