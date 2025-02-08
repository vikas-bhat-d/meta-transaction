const MetaTransactionStorage = artifacts.require("MetaTransactionStorage");

module.exports = function (deployer) {
  deployer.deploy(MetaTransactionStorage);
};
