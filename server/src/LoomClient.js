const Web3 = require('web3');
const { Client, LocalAddress, CryptoUtils, LoomProvider } = require('loom-js');
const ToiwareToken = require('../abi/ToiwareToken.json');

const privateKeyBase64 =
  'd3HS0RqXRyiXX3vYpHnXpmr0FA/0bjMbtnUhkDuGN5JjMqRrUMiJ/ucXYDdbffXEoyPhLoii0JyHwH+75ZZSkg==';
const privateKey = CryptoUtils.B64ToUint8Array(privateKeyBase64);
const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
// loom接続クライアントを作成
const client = new Client(
    // For Local
    'default',
    'ws://127.0.0.1:46658/websocket',
    'ws://127.0.0.1:46658/queryws'
    // For Test
    // 'default',
    // 'wss://bazaar.organic/websocket',
    // 'wss://bazaar.organic/queryws'
    // For extdev
    // 'extdev-plasma-us1',
    // 'wss://extdev-plasma-us1.dappchains.com/websocket',
    // 'wss://extdev-plasma-us1.dappchains.com/queryws'
);
// 関数呼び出し元のアドレス
const from = LocalAddress.fromPublicKey(publicKey).toString();
// LoomProviderを使って、web3クライアントをインスタンス化
const web3 = new Web3(new LoomProvider(client, privateKey));

const contractAddress = '0x7ff73b5501Fa620BA286c1C777Dd4E1278045AC1';

// Instantiate the contract and let it ready to be used
const contract = new web3.eth.Contract(ToiwareToken.abi, contractAddress, {
    from
});

class LoomClient {
    async getBalance(address) {
      return await contract.methods.balanceOf(address).call();
    }
  
    async send(to) {
      await contract.methods.transfer(to, 1).send();//トークンを１送る
    }
    async harfSend(to) {
      await contract.methods.transfer(to, 1).send();//トークンを1送る。本当は０.5など1以外にしたかった
    }
    // async comeback(from) {誰かにトークンを送る機能をつけたかったが、Solidityを変えないといけないっぽいので断念。後ほど
    //   await contract.methods.transfer(from, contractAddress, 1).send();
    // }
}
module.exports = LoomClient;



