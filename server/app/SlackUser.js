const request = require('request');
const dotenv = require('dotenv');
const { LocalAddress, CryptoUtils } = require('loom-js');
const slack = require('slack');

const targetUsers = [
  'U7D2RH3DH', // 岸卓甫
  'U7D4BAY8H', // tadahisa.tsuruta
  'U7D6LCDJ8', // Hiroto Nakanoya
  'U7DMZKLLU', // murata.harunori
  'U7E7GD1JB', // hongoya.masaki
  'U9U4NPZJN', // ichitaro
  'UABLY8WP8', // 廣田貴久
  'UAZG6P2J0', // 黒田正文
  'UBD6YJKKM', // Kazunobu Ishikawa
  'UBGKZ52JD', // Shinsuke Ihara
  'UBW9SRNMC', // ichikawa.mayu
  'UC4KN7JJE', // fujita.tomoyuki
  'UCB8Z5ZQF', // aizaki.takayuki
  'UCEKW76HY', // 古岩井めぐみ
  'UCL22R1PF', // 岡田雄弥
  'UDT28F7FE', // 三雲晴雄
]
// getSlackUsersメソッドから生成したマスターデータ
const users = [
  { id: 'U7D2RH3DH',
  name: '岸卓甫',
  address: '0xe153bd239a2fff601a3247d9564e0f55df7af526' },
  { id: 'U7D4BAY8H',
  name: 'tadahisa.tsuruta',
  address: '0x54006a8b149a2165ca6f2b9fc8dd4977f091ee24' },
  { id: 'U7D6LCDJ8',
  name: 'Hiroto Nakanoya',
  address: '0x8d3783e7ad8316464fec8925d8da1bb5ed07c649' },
  { id: 'U7DMZKLLU',
  name: 'murata.harunori',
  address: '0x8a1051b86b1e06f4bd6fa781ed745ca7ebfad7e6' },
  { id: 'U7E7GD1JB',
  name: 'hongoya.masaki',
  address: '0xfd11b9e76bf2cf13bf3083ea0fafaa73bbbd19ef' },
  { id: 'U9U4NPZJN',
  name: 'ichitaro',
  address: '0x0ab92494a749d9b2f14384f2fb531f27625fd51d' },
  { id: 'UABLY8WP8',
  name: '廣田貴久',
  address: '0x3293625818b3f3ec9ca88d74b442b3c3cf3cbdd3' },
  { id: 'UAZG6P2J0',
  name: '黒田正文',
  address: '0x80e882d685c053399a6637d3c5f084afcc09cf7b' },
  { id: 'UBD6YJKKM',
  name: 'Kazunobu Ishikawa',
  address: '0xe8ac9079a66332a5add1555288e76a98db3804da' },
  { id: 'UBGKZ52JD',
  name: 'Shinsuke Ihara',
  address: '0xe8285ca8362993dd49bbaa7419b47790b38d034e' },
  { id: 'UBW9SRNMC',
  name: 'ichikawa.mayu',
  address: '0xe3976d3bb7bce7a1b362ec8e5a2c8aac7257af76' },
  { id: 'UC4KN7JJE',
  name: 'fujita.tomoyuki',
  address: '0x722ca40aba4000966a0086d4898f51984f2e4f87' },
  { id: 'UCB8Z5ZQF',
  name: 'aizaki.takayuki',
  address: '0x1db4ad38c6adb3b2a78709035f24c6f884881636' },
  { id: 'UCEKW76HY',
  name: '古岩井めぐみ',
  address: '0xe2f88dd6e3f683304610f2c12c5e64fbc11ca7f9' },
  { id: 'UCL22R1PF',
  name: '岡田雄弥',
  address: '0x936c5b37414c20e221bec542ee53744d1a025460' },
  { id: 'UDT28F7FE',
  name: '三雲晴雄',
  address: '0xd2a429b99c76c1c84e5e2dc87f13db865cedd23c' } 
]

dotenv.load();
const botToken = process.env.SLACK_BOT_TOKEN || '';
const SEND_CHANNEL = 'test';

class SlackUser {
    getAddressFromSlackId(id) {
      for( var user of users ) {
        if (user.id === id) {
          return user
        }
      }
    }

    postMessage(msg) {
      slack.chat.postMessage({
          token: botToken,
          channel: SEND_CHANNEL,
          text: msg
      });
    }

    async getSlackUsers() {
      const res = await slack.users.list({
        token: botToken,
      })
      const array = new Array();
      for( var member of res.members ) {
        if (targetUsers.includes(member.id)) {
          const privateKey = CryptoUtils.generatePrivateKey();
          const publicKey = CryptoUtils.publicKeyFromPrivateKey(privateKey);
          const address = LocalAddress.fromPublicKey(publicKey).toString();
          const user = { id: member.id, name: member.real_name, address: address};
          array.push(user);
        }
      }
      console.log(array)
    }

    getUsers() {
      return users;
    };
}
module.exports = SlackUser;