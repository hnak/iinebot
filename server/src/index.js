const { RTMClient } = require('@slack/client');//
const dotenv = require('dotenv');//
const LoomClient = require('./LoomClient');
const SlackUser = require('./SlackUser');
const CronJob = require('cron').CronJob;

dotenv.load();//

const botToken = process.env.SLACK_BOT_TOKEN || '';//

const rtm = new RTMClient(botToken); //bottokenを規定
rtm.start();//RTM = Real Time Message

const loom = new LoomClient();
const slack = new SlackUser();
const map  = new Map();

rtm.on('reaction_added', (event) => {//addedはslcakの機能、eventはslackからもらう引数
    let address;//いいねされた人
    let sendAddress;
    console.log(`User ${event.user} reacted with ${event.reaction} item user ${event.item_user}`);
    //アクションした人、そのアクション、アクションされた人を呼び出す
    if (event.user === event.item_user) {//自分に対して何かしたら何も返さない
        return//ここで終了下には行かない　
    }
    let array = map.get(event.user)//配列を定義
    if (array === undefined) {//配列がなかったら
        array = new Array　
        map.set(event.user, array)//valueに配列追加
    }
    if (array.includes(event.item.ts) === true) {//タイムスタンプあったらリターン
        return
    } else {
        array.push(event.item.ts)//なければタイムスタンプを配列に追加
    }
    slack.getAddressFromSlackId(event.item_user).then((user) => {//いいねされた人が１トークンもらう
        address = user.address;//addressにユーザー名を入れる
        loom.send(address)//アドレスを元にトークンに１足す
        .then(() => {//成功したらこれ
            loom.getBalance(address).then((balance) => {//アドレスを元にバランスを取得し
                const message = 'トークンを獲得しました！' + user.name + ' さんの所持トークン: ' + balance;
                // slack.postMessage(message);//メッセージをslackに送信
                console.log(message);
                
            });
        })
        .catch((reason) => {
            // 失敗時の処理
            slack.postMessage('ERROR: dappchainへのアクセスが失敗しました。');
        });
    });
    
    // いいねした人にもトークン付与
    slack.getAddressFromSlackId(event.user).then((user) => {//いいねした人が0.5トークンもらう
        sendAddress = user.address;//addressにユーザー名を入れる
        loom.harfSend(sendAddress)
        .then(() => {//成功したらこれ
            loom.getBalance(sendAddress).then((balance) => {//アドレスを元にバランスを取得し
                const message = 'トークンを獲得しました！' + user.name + ' さんの所持トークン: ' + balance;
                // slack.postMessage(message);//メッセージをslackに送信
                console.log(message);
            });
        })
        .catch((reason) => {
            // 失敗時の処理
            slack.postMessage('ERROR: dappchainへのアクセスが失敗しました。');
        });
    });
    // aggregate();
});

async function aggregate() {
    let message = 'トークン獲得ランキング\n'//{}内のみ有効
    let results = [];
    const users = slack.getUsers();//usersに全員の名前を入れる
    for( var user of users ) {//usersをuserに入れて全員分回す
        await loom.getBalance(user.address).then((balance) => {
            results.push({user_name:user.name, user_balance:balance}); //集計結果を配列に代入
        }); 
    }
    results.sort(function (user1, user2) {//降順にソート
        let user_balance1 = user1["user_balance"];
        let user_balance2 = user2["user_balance"];
        return user_balance2 - user_balance1;
    });
    for ( i = 0; i<results.length; i++ ) {
        var result = results[i];
        message = message +  [i+1] + "位  " + result.user_balance + ' ' + result.user_name + '\n';
    }
    console.log(message);
    // slack.postMessage(message);//slackに表示する　　　
}


const job = new CronJob({//定時でやる作業
    /*
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 0-11
    Day of Week: 0-6
    */
    cronTime: '0 0 9 * * *', // 毎日午前9時に送信
    onTick: aggregate,
    start: false,
    timeZone: 'Asia/Tokyo'
});

job.start();

