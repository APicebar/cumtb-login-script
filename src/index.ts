import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";
import { exit } from "process";
import type { Account } from "./def";
import { generateCallback, parseJSONP } from "./util";
import { encrypt } from "./lib/encrypt";
import { createHash, createHmac } from "crypto";

const base = "http://login.cumtb.edu.cn"
const info_api = "/cgi-bin/rad_user_info"
const challenge_api = '/cgi-bin/get_challenge';
const login_api = '/cgi-bin/srun_portal'

const default_data: Account = {
    account: '',
    password: ''
}

// TODO： 账号池支持

const main = async () => {
    // Part 0: Check & init config.
    const data: Account = await readFile('account.json')
        .then((raw => JSON.parse(raw.toString())))
        .catch(() => {
            console.log("No config found, auto generating config.");
            console.log("Please fill the config, and restart the script.")
            writeFile('account.json', JSON.stringify(default_data))
                .catch(() => {
                    console.log("Generate failed, please create config manually!");
                    exit(1);
                })
            exit(1);
        });
    if (!(data satisfies Account)) {
        console.log("Config invaild, please check!");
        exit(1);
    };

    console.log("Config load done.\n")

    // Part 1: Get client ip.
    console.log("Part 1: Get LAN IP")

    const getLANIP = async () => await fetch(
        base + info_api + '?' + new URLSearchParams({
            callback: generateCallback(),
            _: Date.now().toString()
        }), { cache: 'no-store' }
    ).then(res => res.text())
        .then(res => parseJSONP(res))
        .then((a) => a ? a.online_ip : a)
        .catch(() => null);

    let ip = await getLANIP();
    let retry_cnt = 0;
    while (!ip) {
        console.log(ip);
        console.log(`Get LAN IP failed... Retry: ${++retry_cnt}`);
        ip = await getLANIP();
    }

    console.log(`Got LAN IP: ${ip}`);

    // Part 2: Get challenge token.
    console.log("Part 2: Get challenge token");

    const getChallenge = async (account: Account) => await fetch(
        base + challenge_api + '?' + new URLSearchParams({
            callback: generateCallback(),
            _: Date.now().toString(),
            username: account.account,
            ip: ip
        }).toString()
    ).then(res => res.text())
        .then(res => parseJSONP(res))
        .then(res => res.res === 'ok' ? res.challenge : res)
        .catch(() => null);

    let token = await getChallenge(data);
    retry_cnt = 0;
    while (!token) {
        console.log(`Get challenge token failed... Retry: ${++retry_cnt}`);
        token = await getChallenge(data);
    }

    console.log(`Got token: ${token}`);

    // Part 3: Login.
    console.log("Part 3: Login");

    const login = async (account: Account, token: string) => {
        const i = encrypt({
            username: account.account,
            password: account.password,
            ip: ip,
            acid: '1',
            enc_ver: 'srun_bx1'
        }, token)

        const hmd5 = createHmac('md5', token).update(account.password).digest('hex');

        const str = token + account.account
            + token + hmd5
            + token + '1'
            + token + ip
            + token + '200'
            + token + '1'
            + token + i;

        const sha1 = createHash('sha1').update(str).digest('hex');

        console.log(`Using account: ${account.account}`);

        const query = new URLSearchParams({
            callback: generateCallback(),
            action: 'login',
            username: account.account,
            password: '{MD5}' + hmd5,
            os: 'Windows 10',
            name: 'Windows',
            double_stack: '0',
            chksum: sha1,
            info: i,
            ac_id: '1',
            ip: ip,
            n: '200',
            type: '1',
            _: Date.now().toString()
        })

        return await fetch(
            base + login_api + '?' + query.toString()
        ).then(res => res.text())
            .then(res => parseJSONP(res))
            .then(res => res.suc_msg ? res.suc_msg : res.error)
            .catch(() => null);
    }

    const res = await login(data, token);
    switch (res) {
        case 'login_ok': 
            console.log("Login success!"); break;
        case 'ip_already_online_error':
            console.log("You've already online!"); break;
        default:
            console.log('Login failed...');
            console.log(`Reason: ${res}`);
            break;
    }
}

main();
