const Web3 = require('web3');
const { Client, LocalAddress, CryptoUtils, LoomProvider } = require('loom-js');
const ToiwareToken = require('../abi/ToiwareToken.json');

const privateKeyBase64 =
  '4J4On/kqG74sNyI/aaf7e5599fb7G+d69HIj7yQ/W/UsKkUhUjIG+H7luSNZrnb4dtVeLy5O1m7UaXtCBr/W5g==';
const privateKey = CryptoUtils.B64ToUint8Array(privateKeyBase64);
const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
// loom接続クライアントを作成
const client = new Client(
    // For Local
    // 'default',
    // 'ws://127.0.0.1:46658/websocket',
    // 'ws://127.0.0.1:46658/queryws'
    // For Test
    'default',
    'wss://bazaar.community/websocket',
    'wss://bazaar.community/queryws'
    // For extdev
    // 'extdev-plasma-us1',
    // 'wss://extdev-plasma-us1.dappchains.com/websocket',
    // 'wss://extdev-plasma-us1.dappchains.com/queryws'
);
// 関数呼び出し元のアドレス
const from = LocalAddress.fromPublicKey(publicKey).toString();
// LoomProviderを使って、web3クライアントをインスタンス化
const web3 = new Web3(new LoomProvider(client, privateKey));

const contractAddress = '0xf8cb75a430db19ed86dec67f58e67a936dc4207c';

// Instantiate the contract and let it ready to be used
const contract = new web3.eth.Contract(ToiwareToken.abi, contractAddress, {
    from
});

class LoomClient {
    async getBalance(address) {
      return await contract.methods.balanceOf(address).call();
    }
  
    async send(to) {
      await contract.methods.transfer(to, 1).send();
    }
}
module.exports = LoomClient;