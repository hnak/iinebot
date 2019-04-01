const { RTMClient } = require('@slack/client');
const dotenv = require('dotenv');
const LoomClient = require('./LoomClient');
const SlackUser = require('./SlackUser');
const CronJob = require('cron').CronJob;

dotenv.load();

const botToken = process.env.SLACK_BOT_TOKEN || '';

const rtm = new RTMClient(botToken); 
rtm.start();//RTM = Real Time Message

const loom = new LoomClient();
const slack = new SlackUser();
const map  = new Map();

rtm.on('reaction_added', (event) => {
    let address;//いいねされた人
    let sendAddress;
    console.log(`User ${event.user} reacted with ${event.reaction} item user ${event.item_user}`);
    if (event.user === event.item_user) {//自分に対していいねしたら何も返さない
        return
    }
    let array = map.get(event.user)
    if (array === undefined) {
        array = new Array　
        map.set(event.user, array)
    }
    if (array.includes(event.item.ts) === true) {
        return
    } else {
        array.push(event.item.ts)//初めてのいいねならタイムスタンプを配列に追加（DBを使ってないのでloom止まれば消える）
    }

    slack.getAddressFromSlackId(event.item_user).then((user) => {//いいねされた人が１トークンもらう
        address = user.address;
        loom.send(address)
        .then(() => {
            loom.getBalance(address).then((balance) => {
                const message = 'トークンを獲得しました！' + user.name + ' さんの所持トークン: ' + balance;
                slack.postMessage(message);
                console.log(message);
            });
        })
        .catch((reason) => {
            // 失敗時の処理
            slack.postMessage('ERROR: dappchainへのアクセスが失敗しました。');
        });
    });
    setTimeout(() => {//ほぼ同時にいいねすると反応できないので１秒後に次の動作をする
        slack.getAddressFromSlackId(event.user).then((user) => {//いいねした人が１トークンもらう
            sendAddress = user.address;
            loom.harfSend(sendAddress)
            .then(() => {
                loom.getBalance(sendAddress).then((balance) => {
                    const message = 'トークンを獲得しました！' + user.name + ' さんの所持トークン: ' + balance;
                    slack.postMessage(message);
                    console.log(message);
                });
            })
            .catch((reason) => {
                // 失敗時の処理
                slack.postMessage('ERROR: dappchainへのアクセスが失敗しました。');
            });
        });
    },1000)
    console.log(map.get(event.user));
});

async function aggregate() {
    let message = 'トークン獲得ランキング\n'
    let results = [];
    const users = slack.getUsers();
    for( var user of users ) {
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
    }//左詰めで桁数が変わるたびに見えにくいので、綺麗にしたい
    slack.postMessage(message);
};

    // 誰かにトークンを送る機能をつけたかったが、Solidityを変えないといけないっぽいので断念。後ほど
    // let address = "0x82631fcbcb046f5f1742bee36740af117ea2579c";
    //     loom.comeback(address)
    //     .then(() => {
    //         loom.getBalance(address).then((balance) => {
    //             const mess =  balance　+ " " + 'トークンを返しました';
    //             // slack.postMessage(message);
    //             console.log(mess);
    //         });
    //     })
    //     .catch((reason) => {
    //         // 失敗時の処理
    //         // slack.postMessage('ERROR: dappchainへのアクセスが失敗しました。');
    //         console.log("miss");
    //     });　　

const job = new CronJob({
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

