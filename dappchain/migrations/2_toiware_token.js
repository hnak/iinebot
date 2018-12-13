var ToiwareToken = artifacts.require('./ToiwareToken.sol');

module.exports = function(deployer) {
  deployer.deploy(ToiwareToken)
}
