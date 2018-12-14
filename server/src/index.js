const { RTMClient } = require('@slack/client');
const dotenv = require('dotenv');
const LoomClient = require('./LoomClient');
const SlackUser = require('./SlackUser');
const CronJob = require('cron').CronJob;

dotenv.load();

const botToken = process.env.SLACK_BOT_TOKEN || '';

const rtm = new RTMClient(botToken);
rtm.start();

const loom = new LoomClient();
const slack = new SlackUser();
// slack.getSlackUsers();

rtm.on('reaction_added', (event) => {
    let address;
    console.log(`User ${event.user} reacted with ${event.reaction} item user ${event.item_user}`);
    if (event.user === event.item_user) {
        return
    }
    slack.getAddressFromSlackId(event.item_user).then((user) => {
        address = user.address;
        loom.send(address).then(() => {
            loom.getBalance(address).then((balance) => {
                const message = 'トークンを獲得しました！' + user.name + ' さんの所持トークン: ' + balance;
                console.log(message);
            });
        });
    });
});
async function aggregate() {
    let message = 'トークン集計結果\n'
    const users = slack.getUsers();
    for( var user of users ) {
        await loom.getBalance(user.address).then((balance) => {
            message = message + user.name + ' ' + balance + '\n';
        });
    }
    console.log(message);
    slack.postMessage(message);
}
const job = new CronJob({
    /*
    Seconds: 0-59
    Minutes: 0-59
    Hours: 0-23
    Day of Month: 1-31
    Months: 0-11
    Day of Week: 0-6
    */
    cronTime: '0 * * * * *', // 毎日午前9時に送信
    onTick: aggregate,
    start: false,
    timeZone: 'Asia/Tokyo'
});
job.start();