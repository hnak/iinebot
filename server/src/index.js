const { RTMClient } = require('@slack/client');
const dotenv = require('dotenv');
const LoomClient = require('./LoomClient');
const SlackUser = require('./SlackUser');
const CronJob = require('cron').CronJob;
const mysql = require('mysql');
const util = require('util');
const connection = mysql.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : '',
    database : 'iinebot'
});

dotenv.load();

const botToken = process.env.SLACK_BOT_TOKEN || '';

const rtm = new RTMClient(botToken); 
rtm.start();//RTM = Real Time Message

const loom = new LoomClient();
const slack = new SlackUser();
const usersId = slack.getUsersID();


rtm.on('reaction_added', async (event) => {
    let address;//いいねされた人
    let sendAddress;
    console.log(`User ${event.user} reacted with ${event.reaction} item user ${event.item_user}`);
    if (event.user === event.item_user) {//自分に対していいねしたら何も返さない
        return;
    }
    connection.query = util.promisify(connection.query)
    var rus = await connection.query(`SELECT * FROM timestamps where ${event.user} = '${event.item.ts}';`)
    if (rus.length > 0){
        return;
    } else {
        await connection.query(`INSERT INTO timestamps (${event.user}) SELECT '${event.item.ts}' WHERE NOT EXISTS(SELECT * FROM timestamps WHERE ${event.user} = '${event.item.ts}');`)
    }
    slack.getAddressFromSlackId(event.item_user).then((user) => {//いいねされた人が１トークンもらう
        address = user.address;
        loom.send(address)
        .then(() => {
            loom.getBalance(address).then((balance) => {
                const message = 'トークンを獲得しました！' + user.name + ' さんの所持トークン: ' + balance;
                slack.postMessage(message);
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
            });
        })
        .catch((reason) => {
            // 失敗時の処理
            slack.postMessage('ERROR: dappchainへのアクセスが失敗しました。');
        });
    });
    },1000)
});


async function aggregate() {
    let message = 'トークン獲得ランキング\n'
    let results = [];
    let data = [];
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
    connection.connect();
    connection.query('delete from daily');

    for ( i = 0; i<results.length; i++ ) {
        var result = results[i];
        message = message +  [i+1] + "位  " + result.user_balance + ' ' + result.user_name + '\n';
        data = [];
        data.push({name:result.user_name, points:result.user_balance});
        connection.query("INSERT INTO daily set ?", data)
    }//左詰めで桁数が変わるたびに見えにくいので、綺麗にしたい
    connection.end();
    slack.postMessage(message);
};


async function compare(){
    const oldMap = new Map();
    connection.connect();
    connection.query = util.promisify(connection.query) 
    try {
      var rows = await connection.query('SELECT * FROM daily')
      connection.end(); 
    } catch (err) {
      throw new Error(err)
    }
    for (let i = 0; i < rows.length; i++) {
        var oldName = rows[i].name;
        var oldPoints = rows[i].points;
        oldMap.set(oldName, oldPoints);
    };

    const latestMap = new Map();
    const users = slack.getUsers();
    for( var user of users ) {
        await loom.getBalance(user.address).then((balance) => {
            latestMap.set(user.name, balance);
        }); 
    };
    setTimeout(() => {
    let message = '今日のトークン取得数ランキング\n'
    let results = [];
    let oldKeys = [];
    for (let o of oldMap.keys()) { 
        oldKeys.push(o);
    }
    for (let lKey of latestMap.keys()) {
        let number1 = latestMap.get(lKey);
        if (oldKeys.includes(lKey) === false) {
            if (results.includes(lKey) === true) {
                return
            }else{
                results.push({user_name:lKey, user_balance:number1})
            }
        }
        for (let oKey of oldMap.keys()) {    
            let number2 = oldMap.get(oKey);
            let dif = number1 - number2;
            if (oKey === lKey) {    
                if (dif === 0) {
                    results.push({user_name:lKey, user_balance:0});
                    }else{
                    results.push({user_name:lKey, user_balance:dif});
                }
            }
        }
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
    // slack.postMessage(message);
    console.log(message);
    
    },1000);
};

async function confirm () {
    connection.query = util.promisify(connection.query)
    let ids = await connection.query(`SELECT id FROM users;`)
    let dbIds = [];
    if (ids.length === usersId.length){
        return
    } else {
        for (let i = 0; i < ids.length; i++) {
            var dbId = ids[i].id;
            dbIds.push(dbId);
        }
        for (let id of usersId){
            if (dbIds.includes(id)) {
                ;
            }else{
                connection.query(`INSERT INTO users (id) value ('${id}');`)
                connection.query(`ALTER TABLE timestamps ADD COLUMN ${id} varchar(20);`)
            }
        }
    }
};

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

const rank = new CronJob({
    cronTime: '0 0 19 * * *', // 毎日19時に送信
    onTick: compare,confirm,
    start: false,
    timeZone: 'Asia/Tokyo'
});

rank.start();

