/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

const { readFileSync } = require('fs')
const LoomTruffleProvider = require('loom-truffle-provider')
const privateKey = readFileSync('./private_key', 'utf-8')

module.exports = {
  networks: {
    local_chain: {
      provider: function () {
        const chainId = 'default'
        const writeUrl = 'http://127.0.0.1:46658/rpc'
        const readUrl = 'http://127.0.0.1:46658/query'
        return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
      },
      network_id: '*'
    },
    testenv_chain: {
      provider: function () {
        const chainId = 'default'
        const writeUrl = 'http://35.227.57.155:46658/rpc'
        const readUrl = 'http://35.227.57.155:46658/query'
        return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
      },
      network_id: '*'
    },
    extdev_plasma_us1: {
      provider: function() {
        const chainId = 'extdev-plasma-us1'
        const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc'
        const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query'
        return new LoomTruffleProvider(chainId, writeUrl, readUrl, privateKey)
      },
      network_id: 'extdev-plasma-us1'
    }
  },
}