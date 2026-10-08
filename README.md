# Hine Server

Hine Server 是即时通讯应用 [Hine](https://github.com/ychunx/hine) 的 Node.js 后端。它用 Express 提供注册登录、资料、好友、群组和聊天记录接口，用 Socket.IO 推送在线状态和消息，用 MongoDB 保存用户、关系、私聊和群聊数据。私聊分为普通消息和加密消息：注册时服务端生成 RSA 密钥对，加密正文由前端完成，本服务负责入库并按是否加密分别存取和转发。

## 功能

- 用户名与邮箱查重、注册、登录。登录账号可以是用户名或邮箱，密码以 bcrypt 哈希保存。
- JWT 鉴权。除注册和登录外，`/api` 下的接口都要在请求头携带 `token`，有效期见 `config/tokenConfig.js` 的 `expiresIn`（`168h`）。
- 修改用户名、邮箱、密码、性别、出生日期、个性签名、头像和好友备注；按用户 id 查询资料。
- 按用户名或邮箱搜索用户，按群名搜索群组，并查询好友关系、用户是否在群内。
- 好友申请与同意走 Socket.IO；拒绝、删除、好友列表和申请列表走 HTTP。删除好友时同时删除双方聊天记录。
- 普通私聊与加密私聊分开拉取、标已读和删除。群消息可整群拉取，并按成员记录未读数。
- 建群，修改群头像、群名、公告和群内昵称，邀请成员、移除成员、退群、解散群。
- 上传用户头像、群头像、私聊图片和群聊图片，文件放在 `public` 下并由 Express 静态托管。
- 同一账号新连接上线时，向旧连接推送 `forceOffline`。
- 注册成功后通过 QQ 邮箱发送一封欢迎邮件。邮件失败只写日志，不影响注册结果。

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 运行时 | Node.js（CommonJS） |
| HTTP | Express 4 |
| 实时通信 | Socket.IO 2 |
| 数据库 | MongoDB，Mongoose 6 |
| 鉴权 | jsonwebtoken |
| 密码 | bcryptjs |
| 密钥与加密消息配套 | jsrsasign（注册时生成 1024 位 RSA）、crypto-js（用密码做 AES） |
| 邮件 | nodemailer，QQ 邮箱 SMTP |
| 上传 | formidable 2 |

`package.json` 没有 `start` 脚本。入口文件是 `hine.js`。

## 项目结构

```
hine.js                  入口：HTTP 3000，Socket.IO 3001
config/db.js             MongoDB 连接
config/tokenConfig.js    JWT 密钥与过期时间
config/secret.js         QQ 邮箱凭据（自行创建，已被 gitignore）
model/dbmodel.js         User、Friend、Message、Group、GroupMember、GroupMessage
dao/dbserver.js          数据访问
dao/socketserver.js      Socket.IO 事件
dao/emailserver.js       注册欢迎邮件
dao/mkdirs.js            创建上传目录
router/index.js          跨域、token 校验，挂到 /api
router/modules/          注册、登录、搜索、好友、聊天、资料、上传、群组
public/                  静态文件；默认头像 user.png，上传图片也写到这里
```

用户文档字段包括邮箱、用户名、密码哈希、公钥、私钥、性别、生日、签名、头像和注册时间。好友关系是双向记录，`state` 为 `0`（好友）、`1`（申请方）、`2`（被申请方）。消息 `types` 为 `0`（文字）或 `1`（图片），并用 `encrypted` 区分普通消息和加密消息。

## 本地运行

需要本机已安装 Node.js、npm，以及监听 `127.0.0.1:27017` 的 MongoDB。仓库没有环境变量，也没有数据库初始化脚本。库名 `hine` 会在第一次写入时由 MongoDB 创建。

```bash
git clone https://github.com/ychunx/hine-server.git
cd hine-server
npm install
```

启动前准备三个写在源码里的配置。

**数据库。** `config/db.js` 连接 `mongodb://127.0.0.1:27017/hine`。地址或库名不同时，改这一行。

**JWT。** 签发和校验使用 `config/tokenConfig.js` 的 `jwtSecretKey`。给别人演示或部署前，换成只有你自己知道的字符串，并保持 `expiresIn` 与预期登录时长一致。

**邮件。** `dao/emailserver.js` 在加载时就会读取 `config/secret.js`。该文件不在仓库里（`.gitignore` 已忽略 `/config/secret.js`）。缺少它时进程无法启动。在 `config` 目录新建：

```js
module.exports = {
  qq: {
    user: "你的QQ邮箱",
    pass: "QQ邮箱SMTP授权码",
  },
};
```

`pass` 是 QQ 邮箱的 SMTP 授权码。发件人写在 `dao/emailserver.js` 的 `from` 字段，需要和 `user` 属于同一邮箱，欢迎信才能发出。暂时不需要发信时，仍要保留这个文件，否则 `require` 会失败；凭据无效时，注册接口仍可成功，只是控制台会打印邮件发送失败。

`hine.js` 直接依赖 `body-parser`。它没有写进 `package.json` 的 `dependencies`，由 Express 间接安装，`npm install` 之后可以解析到。

```bash
node hine.js
```

看到数据库连接成功，以及 `Hine 服务器已在 3000 端口启动！`，即表示 HTTP 已在 3000 端口监听。Socket.IO 在 3001 端口。静态资源示例：`http://localhost:3000/user.png`。

上传接口返回的图片地址前缀写死为 `http://localhost:3000`（`router/modules/uploadFile.js`）。改端口时要一起改这里，以及模型里默认头像所用的同一主机名。

## 接口概览

业务路由都挂在 `/api` 下。响应体由 `res.cc` 生成，形如 `{ "status": 200, "msg": ... }`。这里的 `status` 是业务码，成功为 `200`；这条响应的 HTTP 状态码通常仍是 200。未匹配的路径走 404，未捕获的异常走 500。`msg` 在成功时可能是字符串、对象或数组。

跨域允许任意来源，允许的请求头为 `Content-Type` 和 `token`。路径里包含 `signup` 或 `login` 的接口不校验 token，其余接口从请求头 `token` 读取 JWT，并把用户 id 放到后续处理里。

### 注册与登录

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/signup/nameinuse/:name` | 返回该用户名已有的用户数 |
| GET | `/api/signup/emailinuse/:email` | 返回该邮箱已有的用户数 |
| POST | `/api/signup/adduser` | 注册。正文 `name`、`email`、`pwd` |
| POST | `/api/signin/login` | 登录。正文 `acct`（用户名或邮箱）、`pwd`。成功时 `msg` 为 token |
| GET | `/api/signin/getUserInfo` | 当前登录用户资料 |

### 搜索

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/search/user` | 正文 `key`，按用户名或邮箱检索，结果不含自己 |
| POST | `/api/search/relation` | 正文 `userId`、`friendId`。`200` 好友，`201` 申请中，`202` 对方已申请，`203` 非好友 |
| POST | `/api/search/group` | 正文 `key`，按群名检索 |
| POST | `/api/search/isingroup` | 正文 `userId`、`groupId`。`200` 在群内，`201` 不在 |

### 好友

好友申请和同意不在下表，见 Socket.IO。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/friend/reject` | 正文 `friendId`，拒绝申请 |
| POST | `/api/friend/delete` | 正文 `friendId`，删除好友和双方聊天记录 |
| GET | `/api/friend/getfriends` | 好友列表，含备注 |
| GET | `/api/friend/getfriendapplys` | 收到的好友申请及验证消息 |

### 聊天记录

实时收发走 Socket.IO。下表只负责历史记录。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/chat/getallmsgs` | 全部普通私聊及好友信息、未读数 |
| GET | `/api/chat/getallencryptedmsgs` | 全部加密私聊 |
| POST | `/api/chat/readfriendmsgs` | 正文 `friendId`，普通消息标已读 |
| POST | `/api/chat/readfriendencryptedmsgs` | 正文 `friendId`，加密消息标已读 |
| POST | `/api/chat/delete` | 正文 `friendId`，删除普通私聊记录 |
| POST | `/api/chat/deleteencrypted` | 正文 `friendId`，删除加密私聊记录 |
| GET | `/api/chat/getallgroupmsgs` | 当前用户所在群的消息、群资料和成员信息 |
| POST | `/api/chat/readgroupmsgs` | 正文 `groupId`，该成员的群未读数清零 |

### 资料

修改用户名、邮箱、密码时，正文要带当前密码 `pwd`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/detail/name` | `pwd`、`newName` |
| POST | `/api/detail/email` | `pwd`、`newEmail` |
| POST | `/api/detail/pwd` | `pwd`、`newPwd` |
| POST | `/api/detail/sex` | `newSex` |
| POST | `/api/detail/birth` | `newBirth` |
| POST | `/api/detail/signature` | `newSignature` |
| POST | `/api/detail/portrait` | `newPortraitUrl`，只更新资料里的头像地址 |
| POST | `/api/detail/nickname` | `userId`、`friendId`、`newNickname` |
| POST | `/api/detail/getuserinfobyid` | `userId`。不返回密码和密钥 |

### 上传

`multipart/form-data`，且需要 `token`。非图片返回业务码 `201`。成功时 `msg` 为 `http://localhost:3000/...` 形式的地址。

| 方法 | 路径 | 表单字段 | 保存目录 |
| --- | --- | --- | --- |
| POST | `/api/upload/portrait` | `portraitFile` | `public/portraitImages` |
| POST | `/api/upload/groupportrait` | `groupPortraitFile` | `public/groupPortraitImages` |
| POST | `/api/upload/image` | `uploadImgFile` | `public/msgImages` |
| POST | `/api/upload/groupimage` | `uploadGroupImgFile` | `public/msgGroupImages` |

### 群组

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/group/nameinuse/:name` | 返回该群名已有的群数量 |
| POST | `/api/group/build` | `name`、`friends`（成员 id 数组）、可选 `imgUrl`。创建者会加入成员列表，并写入一条「创建群组」消息 |
| POST | `/api/group/getgroupinfobyid` | `groupId`，返回群资料和成员 |
| POST | `/api/group/updateportrait` | `groupId`、`imgUrl` |
| POST | `/api/group/updatename` | `groupId`、`newName` |
| POST | `/api/group/updatenotice` | `groupId`、`newNotice` |
| POST | `/api/group/invite` | `groupId`、`userId`。已在群内时业务码 `201` |
| POST | `/api/group/removegroupmember` | `groupId`、`memberId` |
| POST | `/api/group/updatenickname` | `groupId`、`newNickName` |
| POST | `/api/group/exitgroup` | `groupId`。退出不删除群聊天记录 |
| POST | `/api/group/breakgroup` | `groupId`，解散群 |

群头像、群名、公告的更新条件带有群主 id。字段名以本表为准。

### Socket.IO

前端连接 `http://localhost:3001`。连接本身不校验 token，事件载荷里的用户 id 由客户端传入。

| 客户端发送 | 载荷要点 | 服务端行为 | 推送给在线客户端 |
| --- | --- | --- | --- |
| `online` | 用户 id | 记录 socket，同一用户只保留最新连接 | 旧连接收到 `forceOffline` |
| `offline` | 用户 id | 从在线表移除 | 无 |
| `friendApply` | `friendId`、`userId`、`content`、`types` | 尚无关系时建立双向申请，并写入验证消息。`content` 为空时使用「请求添加好友」 | 对方 `receiveApply` |
| `agreeApply` | `friendId`、`userId` | 仅被申请方可以把关系改为好友，并写入一条系统私聊 | 双方 `acceptedApply` |
| `groupApply` | `groupId`、`userId`、`content`、`types` | 直接加入群并写入一条群消息。`content` 为空时使用「加入了群组」 | 在线成员 `newGroupMemberJoin` |
| `sendMsg` | 消息对象，含 `friendId`、`encrypted` | 写入私聊。`encrypted` 为真时走加密通道 | `receiveMsg` 或 `receiveEncryptedMsg` |
| `sendGroupMsg` | 消息对象，含 `groupId` | 写入群消息并增加其他成员未读数 | 其他在线成员 `receiveGroupMsg` |

## 与前端 hine 的配合

配套界面在 [ychunx/hine](https://github.com/ychunx/hine)，是 Vue 2、Vue Router 和 Vuex 项目。它不代理接口，而是在浏览器里直连本服务：

- `src/api/request.js` 把 axios 的 `baseURL` 设为 `http://localhost:3000/api`。请求拦截器从 `localStorage` 读取 token，写入请求头 `token`。页面使用的路径与本仓库 `router/modules` 一致，例如登录 `POST /signin/login`、当前用户 `GET /signin/getUserInfo`。
- 登录成功后，前端把响应里的 token 存入 `localStorage`，再拉取用户资料。退出登录只清本地状态，本仓库没有登出接口；下线时前端发送 Socket 事件 `offline`。
- `src/main.js` 用仓库内的 `weapp.socket.io.js` 连接 `http://localhost:3001`。`App.vue` 监听 `receiveMsg`、`receiveEncryptedMsg`、`receiveGroupMsg`、`receiveApply`、`acceptedApply`、`newGroupMemberJoin` 和 `forceOffline`，并在拿到用户 id 后发送 `online`。
- 加密会话在 `src/pages/Msg/EncryptedDialog`：用 jsencrypt 分别用对方公钥和自己的公钥加密正文，以 `|` 拼成一条 `content`，再 `sendMsg`，并带 `encrypted: true`。本服务不解密，只按该标记存储和推送。好友列表接口会带回对方公钥，供这次加密使用。

本地同时跑两端时，先启动 MongoDB 和 `node hine.js`，再在 hine 仓库执行 `npm run serve`。两端都假定接口在 3000、Socket 在 3001。

## 许可

ISC。
