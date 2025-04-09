# cumtb-login-script

给 CUMTBer 的一个简易校园网登录脚本。

## Compile

确保你安装了 `bun` ，这个项目是基于 `bun` 开发的。

[如何安装？](https://bun.sh/docs/installation)

然后 clone 这个项目：
```sh
$ git clone https://github.com/APicebar/cumtb-login-script.git
```

然后执行

```sh
$ cd cumtb-login-script
$ bun make
```

二进制文件在 `dist` 目录下。

## Usage

启动程序，程序会在当前目录下生成账号配置文件，修改即可。

或者在当前目录下手动创建 `account.json`：
```json
{
    "account": "校园网账号",
    "password": "校园网密码"
}
```

保存配置文件后启动程序，程序在完成登录后会自动退出。