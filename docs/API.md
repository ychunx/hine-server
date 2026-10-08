# Hine Server 接口说明

本文按当前代码整理 HTTP 与 Socket.IO 的调用约定。HTTP 业务路由挂在 `http://localhost:3000/api`。Socket.IO 挂在 `http://localhost:3001`。静态文件由同一 Express 应用托管在 `http://localhost:3000/`（例如 `public/user.png`）。

配套前端 [hine](https://github.com/ychunx/hine) 的 axios `baseURL` 为 `http://localhost:3000/api`，socket 客户端连接 `http://localhost:3001`。

## 通用约定

### 响应体

业务接口通过 `res.cc` 返回 JSON：

```json
{
  "status": 200,
  "msg": "注册成功"
}
```

`status` 是业务码，不是 HTTP 状态码。`res.cc` 使用 `res.send`，HTTP 状态码通常仍是 200。`msg` 可以是字符串、数字、对象或数组。未传入业务码时默认为 500。

未匹配的路径由兜底中间件返回 HTTP 404，正文是纯文本 `Not Found`，不是上面的 JSON。路由处理函数抛出的异常同样走兜底中间件：HTTP 500（或错误对象上的 `status`），正文是纯文本错误信息。

常见业务码因接口而异，不能跨接口套用同一个含义。下文每个接口单独列出。

### 鉴权

除路径中包含 `signup` 或 `login` 的接口外，请求头必须带登录返回的 JWT。头名称是 `token`，不是 `Authorization`。

```http
token: <登录接口返回的 JWT>
```

校验通过后，服务端把 token 里的用户 id 放到后续处理中（代码里的 `req.jwt_id`）。token 缺失、过期或签名不对时：

```json
{
  "status": 500,
  "msg": "token 已失效，<校验错误信息>"
}
```

签发时写入的载荷是用户 `_id` 和 `loginTime`。过期时间由 `config/tokenConfig.js` 的 `expiresIn` 决定，当前代码是 `168h`。签名密钥也在该文件，不要把密钥写进客户端仓库。

`/api` 下统一设置：

| 响应头 | 值 |
| --- | --- |
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Headers` | `Content-Type, token` |
| `Access-Control-Allow-Methods` | `*` |
| `Content-Type` | `application/json;charset=utf-8` |

JSON 接口的请求体用 `Content-Type: application/json`。上传接口用 `multipart/form-data`。

Socket.IO 连接本身不校验 token。事件里的用户 id 由客户端传入。

### 文档字段

用户（`User`）。`getUserInfo` 会去掉 `pwd`，但仍返回两个密钥字段。按 id 查询用户时，`pwd`、`privateKey`、`publicKey` 都会去掉。

| 字段 | 说明 |
| --- | --- |
| `_id` | MongoDB id |
| `email` | 邮箱，唯一 |
| `name` | 用户名，唯一 |
| `pwd` | bcrypt 哈希，接口不回传 |
| `privateKey` | 注册时用密码做 AES 后的 PKCS8 私钥 |
| `publicKey` | 注册时写入的 PEM。代码用私钥对象调用 `getPEM`，没有改用公钥对象 |
| `sex` | 默认 `你猜猜~` |
| `birth` | 日期。注册时写成当时的服务器时间 |
| `signature` | 默认 `ta很懒，什么都没有留下~` |
| `imgUrl` | 默认 `http://localhost:3000/user.png` |
| `registerTime` | 注册时间 |

好友关系（`Friend`）是双向各一条。`state`：`0` 好友，`1` 申请方，`2` 被申请方。

| 字段 | 说明 |
| --- | --- |
| `userId` | 这条记录所属的用户 |
| `friendId` | 对方用户 |
| `nickname` | 拥有者给对方的备注 |
| `time` | 关系变更时间 |
| `state` | `0` / `1` / `2` |

私聊消息（`Message`）：

| 字段 | 说明 |
| --- | --- |
| `userId` | 发送方 |
| `friendId` | 接收方 |
| `content` | 正文。加密消息由客户端加密后再提交，服务端不解密 |
| `types` | 字符串。模型注释约定 `0` 文字、`1` 图片，服务端不校验 |
| `time` | 发送时间 |
| `read` | 是否已读，默认 `false` |
| `encrypted` | 是否加密消息，默认 `false` |

群（`Group`）：

| 字段 | 说明 |
| --- | --- |
| `_id` | 群 id |
| `name` | 群名，唯一 |
| `userId` | 群主 id |
| `imgUrl` | 默认 `http://localhost:3000/user.jpg` |
| `notice` | 默认 `无` |
| `time` | 创建时间 |

群成员（`GroupMember`）。群内昵称存在字段 `name`，不是 `nickName`。

| 字段 | 说明 |
| --- | --- |
| `groupId` | 群 id |
| `userId` | 用户 id |
| `name` | 群内昵称 |
| `unReadNum` | 未读数，默认 `0` |
| `time` | 加入时间 |

群消息（`GroupMessage`）字段为 `groupId`、`userId`、`content`、`types`、`time`。没有已读标记，未读数记在群成员上。

下文示例省略了 Mongoose 自动带上的 `__v`。

## 注册

这三个接口的路径包含 `signup`，不校验 token。

### 查询用户名是否占用

`GET /api/signup/nameinuse/:name`

用户名在路径里，不在查询字符串。

| 字段 | 位置 | 类型 | 说明 |
| --- | --- | --- | --- |
| `name` | path | string | 用户名 |

`msg` 是该用户名已有的文档数量（数字）。

```json
{
  "status": 200,
  "msg": 0
}
```

### 查询邮箱是否占用

`GET /api/signup/emailinuse/:email`

邮箱在路径里。`@` 需要做 URL 编码。

| 字段 | 位置 | 类型 | 说明 |
| --- | --- | --- | --- |
| `email` | path | string | 邮箱 |

```json
{
  "status": 200,
  "msg": 0
}
```

### 注册

`POST /api/signup/adduser`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | body | string | 是 | 用户名 |
| `email` | body | string | 是 | 邮箱 |
| `pwd` | body | string | 是 | 明文密码。入库前改为 bcrypt 哈希 |

服务端另外写入：当前时间作为 `birth` 和 `registerTime`；1024 位 RSA。`privateKey` 是用本次密码对 PKCS8 PEM 做 AES 后的密文。`publicKey` 是 `KEYUTIL.getPEM(私钥对象)` 的 PEM 文本，注册时不再加密。成功后尝试发送欢迎邮件，发送失败只打日志，不影响本响应。用户名或邮箱与已有唯一索引冲突时，`status` 为 500，`msg` 为数据库错误信息。

```json
{
  "status": 200,
  "msg": "注册成功"
}
```

## 登录

### 登录

`POST /api/signin/login`

路径包含 `login`，不校验 token。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `acct` | body | string | 是 | 用户名或邮箱。匹配 `/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/` 时按邮箱查，否则按用户名查 |
| `pwd` | body | string | 是 | 明文密码 |

| status | msg |
| --- | --- |
| 200 | JWT 字符串 |
| 201 | `账号或密码错误`（没有这个账号，或密码不对） |

```json
{
  "status": 200,
  "msg": "<jwt>"
}
```

### 当前用户信息

`GET /api/signin/getUserInfo`

需要 `token`。路径是 `getUserInfo`，大小写敏感。没有请求参数，用户 id 来自 token。返回用户文档，只去掉 `pwd`，`privateKey` 和 `publicKey` 仍在。

```json
{
  "status": 200,
  "msg": {
    "_id": "64ab0c0e0c0e0c0e0c0e0c0e",
    "email": "a@example.com",
    "name": "a",
    "sex": "你猜猜~",
    "birth": "2023-02-12T06:24:51.026Z",
    "signature": "ta很懒，什么都没有留下~",
    "imgUrl": "http://localhost:3000/user.png",
    "registerTime": "2023-02-12T06:24:51.026Z",
    "publicKey": "<pem>",
    "privateKey": "<aes ciphertext>"
  }
}
```

## 搜索

以下接口都需要 `token`。

### 搜索用户

`POST /api/search/user`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `key` | body | string | 是 | 对用户名和邮箱做正则匹配 |

结果只含 `_id`、`name`、`email`、`imgUrl`，并去掉当前用户自己。

```json
{
  "status": 200,
  "msg": [
    {
      "_id": "64ab0c0e0c0e0c0e0c0e0c0f",
      "name": "b",
      "email": "b@example.com",
      "imgUrl": "http://localhost:3000/user.png"
    }
  ]
}
```

### 好友关系

`POST /api/search/relation`

查询条件就是请求体，服务端不会把 token 里的 id 填进去。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `userId` | body | string | 是 | 关系记录上的 `userId` |
| `friendId` | body | string | 是 | 关系记录上的 `friendId` |

| status | msg |
| --- | --- |
| 200 | `双方是好友`（`state` 为 `0`） |
| 201 | `申请中`（`state` 为 `1`） |
| 202 | `对方已发出申请`（其余已有记录，含 `state` 为 `2`） |
| 203 | `双方非好友`（没有记录） |

```json
{
  "status": 201,
  "msg": "申请中"
}
```

### 搜索群组

`POST /api/search/group`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `key` | body | string | 是 | 对群名做正则匹配 |

结果只含 `_id`、`name`、`imgUrl`。

```json
{
  "status": 200,
  "msg": [
    {
      "_id": "64ab0c0e0c0e0c0e0c0e0c10",
      "name": "群名",
      "imgUrl": "http://localhost:3000/user.jpg"
    }
  ]
}
```

### 是否在群内

`POST /api/search/isingroup`

查询条件就是请求体。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `userId` | body | string | 是 | 用户 id |
| `groupId` | body | string | 是 | 群 id |

| status | msg |
| --- | --- |
| 200 | `用户在群内` |
| 201 | `非群内成员` |

```json
{
  "status": 201,
  "msg": "非群内成员"
}
```

## 好友

申请和同意走 Socket.IO。下面四个接口需要 `token`。用户 id 取自 token，不从正文读取。

### 拒绝申请

`POST /api/friend/reject`

删除双方的好友关系记录，不删除聊天记录。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `friendId` | body | string | 是 | 申请方 id |

```json
{
  "status": 200,
  "msg": "拒绝成功"
}
```

### 删除好友

`POST /api/friend/delete`

先删除双方全部私聊（含加密和未加密），再删除双方好友关系。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `friendId` | body | string | 是 | 对方 id |

```json
{
  "status": 200,
  "msg": "删除成功"
}
```

### 好友列表

`GET /api/friend/getfriends`

没有请求参数。返回 `state` 为 `0` 的好友。每一项是对方的用户文档（去掉 `pwd` 和 `privateKey`，保留 `publicKey`）再加上 `nickname`。

```json
{
  "status": 200,
  "msg": [
    {
      "_id": "64ab0c0e0c0e0c0e0c0e0c0f",
      "name": "b",
      "email": "b@example.com",
      "imgUrl": "http://localhost:3000/user.png",
      "publicKey": "<pem>",
      "sex": "你猜猜~",
      "birth": "2023-02-12T06:24:51.026Z",
      "signature": "ta很懒，什么都没有留下~",
      "registerTime": "2023-02-12T06:24:51.026Z",
      "nickname": "备注"
    }
  ]
}
```

### 好友申请列表

`GET /api/friend/getfriendapplys`

没有请求参数。返回当前用户作为被申请方（`state` 为 `2`）的记录。`msgs` 是对方发给当前用户的私聊，只含 `content`、`time` 以及文档 `_id`。

```json
{
  "status": 200,
  "msg": [
    {
      "name": "b",
      "imgUrl": "http://localhost:3000/user.png",
      "friendId": "64ab0c0e0c0e0c0e0c0e0c0f",
      "msgs": [
        {
          "_id": "64ab0c0e0c0e0c0e0c0e0c11",
          "content": "请求添加好友",
          "time": "2023-02-12T08:00:00.000Z"
        }
      ]
    }
  ]
}
```

## 聊天记录

收发实时消息走 Socket.IO。这里只覆盖历史记录，都需要 `token`。用户 id 取自 token。

只保留仍是好友（`state` 为 `0`）的会话。`unReadNum` 统计 `read` 不为真、且 `friendId` 等于当前用户的消息（对方发给我的）。`allMsgs` 是完整的私聊文档。

### 普通私聊

`GET /api/chat/getallmsgs`

`encrypted` 为 `false` 的消息。

```json
{
  "status": 200,
  "msg": [
    {
      "friendId": "64ab0c0e0c0e0c0e0c0e0c0f",
      "name": "b",
      "nickname": "备注",
      "imgUrl": "http://localhost:3000/user.png",
      "unReadNum": 1,
      "allMsgs": [
        {
          "_id": "64ab0c0e0c0e0c0e0c0e0c12",
          "userId": "64ab0c0e0c0e0c0e0c0e0c0f",
          "friendId": "64ab0c0e0c0e0c0e0c0e0c0e",
          "content": "你好",
          "types": "0",
          "time": "2023-02-12T08:00:00.000Z",
          "read": false,
          "encrypted": false
        }
      ]
    }
  ]
}
```

没有消息时 `msg` 为 `[]`。

### 加密私聊

`GET /api/chat/getallencryptedmsgs`

与上一接口相同，只是 `encrypted` 为 `true`。`content` 保持客户端提交的密文。

### 普通消息标已读

`POST /api/chat/readfriendmsgs`

把对方发给我、且 `encrypted` 为 `false` 的未读消息标为已读。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `friendId` | body | string | 是 | 对方 id |

```json
{
  "status": 200,
  "msg": "请求成功"
}
```

### 加密消息标已读

`POST /api/chat/readfriendencryptedmsgs`

同上，`encrypted` 为 `true`。正文同样是 `friendId`。成功时 `msg` 为 `请求成功`。

### 删除普通私聊

`POST /api/chat/delete`

删除双方之间 `encrypted` 为 `false` 的消息，不删除加密消息，也不删除好友关系。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `friendId` | body | string | 是 | 对方 id |

```json
{
  "status": 200,
  "msg": "删除成功"
}
```

### 删除加密私聊

`POST /api/chat/deleteencrypted`

同上，只删除 `encrypted` 为 `true` 的消息。正文是 `friendId`。成功时 `msg` 为 `删除成功`。

### 群消息和成员

`GET /api/chat/getallgroupmsgs`

没有请求参数。`msg` 是对象，不是字符串。

`groupMsgs` 的每一项：

| 字段 | 说明 |
| --- | --- |
| `groupId` | 群 id |
| `nickName` | 当前用户在该群的群内昵称（来自群成员的 `name`） |
| `unReadNum` | 当前用户在该群的未读数 |
| `joinTime` | 当前用户加入时间 |
| `name` | 群名 |
| `userId` | 群主 id |
| `imgUrl` | 群头像 |
| `notice` | 群公告 |
| `time` | 群创建时间 |
| `allMsgs` | 该群的群消息数组 |

`userInfos` 的每一项是 `{ groupId, memberInfos }`。`memberInfos` 含 `_id`、`name`（用户名）、`imgUrl`、`nickName`（群内昵称）。

某个已加入的群没有任何消息时，组装过程读取空数组的第一项会抛错，此时 `status` 为 500，`msg` 为错误信息。

```json
{
  "status": 200,
  "msg": {
    "groupMsgs": [
      {
        "groupId": "64ab0c0e0c0e0c0e0c0e0c10",
        "nickName": "我的群昵称",
        "unReadNum": 1,
        "joinTime": "2023-02-12T14:03:19.287Z",
        "name": "群名",
        "userId": "64ab0c0e0c0e0c0e0c0e0c0e",
        "imgUrl": "http://localhost:3000/user.jpg",
        "notice": "无",
        "time": "2023-02-12T14:03:19.287Z",
        "allMsgs": [
          {
            "_id": "64ab0c0e0c0e0c0e0c0e0c13",
            "groupId": "64ab0c0e0c0e0c0e0c0e0c10",
            "userId": "64ab0c0e0c0e0c0e0c0e0c0e",
            "content": "创建群组",
            "types": "0",
            "time": "2023-02-12T14:03:19.297Z"
          }
        ]
      }
    ],
    "userInfos": [
      {
        "groupId": "64ab0c0e0c0e0c0e0c0e0c10",
        "memberInfos": [
          {
            "_id": "64ab0c0e0c0e0c0e0c0e0c0e",
            "name": "a",
            "imgUrl": "http://localhost:3000/user.png",
            "nickName": "我的群昵称"
          }
        ]
      }
    ]
  }
}
```

### 群消息标已读

`POST /api/chat/readgroupmsgs`

把当前用户在该群的 `unReadNum` 写成 `0`。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |

```json
{
  "status": 200,
  "msg": "请求成功"
}
```

## 资料

都需要 `token`。除好友备注外，被修改的用户是 token 里的 id。

修改用户名、邮箱、密码时要带当前明文密码 `pwd`。

### 修改用户名

`POST /api/detail/name`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `pwd` | body | string | 是 | 当前密码 |
| `newName` | body | string | 是 | 新用户名 |

| status | msg |
| --- | --- |
| 200 | `修改成功` |
| 201 | `密码错误` |
| 202 | `用户名已被占用` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 修改邮箱

`POST /api/detail/email`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `pwd` | body | string | 是 | 当前密码 |
| `newEmail` | body | string | 是 | 新邮箱。格式与登录所用正则相同 |

| status | msg |
| --- | --- |
| 200 | `修改成功` |
| 201 | `密码错误` |
| 202 | `邮箱已被占用` |
| 203 | `邮箱格式错误` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 修改密码

`POST /api/detail/pwd`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `pwd` | body | string | 是 | 原密码 |
| `newPwd` | body | string | 是 | 新密码 |

原密码正确时：用原密码对 `privateKey` 和 `publicKey` 做 AES 解密，再用新密码加密后写回，并把 `pwd` 更新为新密码的 bcrypt 哈希。注册时 `publicKey` 存的是未加密 PEM，这里仍会按密文去解密。

| status | msg |
| --- | --- |
| 200 | `修改成功` |
| 201 | `原密码错误` |

```json
{
  "status": 201,
  "msg": "原密码错误"
}
```

### 修改性别

`POST /api/detail/sex`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `newSex` | body | string | 是 | 写入 `sex` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 修改出生日期

`POST /api/detail/birth`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `newBirth` | body | string | 是 | 交给 `new Date()` 后写入 `birth` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 修改个性签名

`POST /api/detail/signature`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `newSignature` | body | string | 是 | 写入 `signature` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 修改头像地址

`POST /api/detail/portrait`

只改资料里的 URL，不接收文件。文件先走上传接口。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `newPortraitUrl` | body | string | 是 | 写入 `imgUrl` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 修改好友备注

`POST /api/detail/nickname`

更新条件来自正文里的 `userId` 和 `friendId`，不会改成 token 里的 id。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `userId` | body | string | 是 | 关系记录上的 `userId` |
| `friendId` | body | string | 是 | 关系记录上的 `friendId` |
| `newNickname` | body | string | 是 | 写入 `nickname` |

```json
{
  "status": 200,
  "msg": "修改成功"
}
```

### 按 id 获取用户

`POST /api/detail/getuserinfobyid`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `userId` | body | string | 是 | 用户 id |

`msg` 是用户文档，不含 `pwd`、`privateKey`、`publicKey`。

```json
{
  "status": 200,
  "msg": {
    "_id": "64ab0c0e0c0e0c0e0c0e0c0f",
    "email": "b@example.com",
    "name": "b",
    "sex": "你猜猜~",
    "birth": "2023-02-12T06:24:51.026Z",
    "signature": "ta很懒，什么都没有留下~",
    "imgUrl": "http://localhost:3000/user.png",
    "registerTime": "2023-02-12T06:24:51.026Z"
  }
}
```

## 文件上传

四个接口都是 `POST`，`multipart/form-data`，且需要 `token`。`mimetype` 中包含 `image` 才接受，否则：

```json
{
  "status": 201,
  "msg": "上传文件非图片"
}
```

成功时 `msg` 是文件 URL，前缀写死为 `http://localhost:3000`。文件名使用 formidable 生成的新文件名，扩展名取自原始文件名。

| 方法与路径 | 表单字段 | 保存目录 |
| --- | --- | --- |
| `POST /api/upload/portrait` | `portraitFile` | `public/portraitImages` |
| `POST /api/upload/groupportrait` | `groupPortraitFile` | `public/groupPortraitImages` |
| `POST /api/upload/image` | `uploadImgFile` | `public/msgImages` |
| `POST /api/upload/groupimage` | `uploadGroupImgFile` | `public/msgGroupImages` |

```json
{
  "status": 200,
  "msg": "http://localhost:3000/portraitImages/a1b2c3.png"
}
```

缺少上表对应的文件字段时，处理函数会抛错，响应变为 HTTP 500 的纯文本，而不是 `{ status, msg }`。

上传成功不会自动修改用户或群的 `imgUrl`。用户头像还要再调 `POST /api/detail/portrait`，群头像再调 `POST /api/group/updateportrait`。

## 群组

都需要 `token`。群主身份取自 token，除非某个字段另有说明。

### 群名是否占用

`GET /api/group/nameinuse/:name`

群名在路径里。需要 token（路径里没有 `signup` / `login`）。

| 字段 | 位置 | 类型 | 说明 |
| --- | --- | --- | --- |
| `name` | path | string | 群名 |

`msg` 是该群名已有的文档数量（数字）。

```json
{
  "status": 200,
  "msg": 0
}
```

### 创建群组

`POST /api/group/build`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | body | string | 是 | 群名 |
| `imgUrl` | body | string | 否 | 不传则使用模型默认值 |
| `friends` | body | string[] | 是 | 其他成员的用户 id。服务端会把当前用户插到数组开头 |

成功时写入一条 `types` 为 `0`、正文为 `创建群组` 的群消息。响应不含新群 id。群名冲突时 `status` 为 500，`msg` 为数据库错误信息。`friends` 不是数组时会抛错，变成 HTTP 500 纯文本。

成员记录是异步保存的，接口在这些保存结束前就返回：

```json
{
  "status": 200,
  "msg": "创建成功"
}
```

### 按 id 获取群

`POST /api/group/getgroupinfobyid`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |

`msg` 是 `{ groupInfo, memberInfos }`，不是扁平的群文档。`groupInfo` 为群文档。`memberInfos` 每一项只有 `_id`、`name`、`imgUrl`，没有群内昵称。

```json
{
  "status": 200,
  "msg": {
    "groupInfo": {
      "_id": "64ab0c0e0c0e0c0e0c0e0c10",
      "name": "群名",
      "userId": "64ab0c0e0c0e0c0e0c0e0c0e",
      "imgUrl": "http://localhost:3000/group.png",
      "notice": "无",
      "time": "2023-02-12T14:03:19.287Z"
    },
    "memberInfos": [
      {
        "_id": "64ab0c0e0c0e0c0e0c0e0c0e",
        "name": "a",
        "imgUrl": "http://localhost:3000/user.png"
      }
    ]
  }
}
```

### 更改群头像

`POST /api/group/updateportrait`

更新条件是群 `_id` 与群主 `userId`（当前用户）同时匹配。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |
| `imgUrl` | body | string | 是 | 新头像 URL |

数据库没有抛错时就返回「更新成功」，包括没有匹配到文档（当前用户不是群主）的情况。数据库抛错时 `status` 为 500，`msg` 为 `无权或修改失败，<错误信息>`。

```json
{
  "status": 200,
  "msg": "更新成功"
}
```

### 更改群名

`POST /api/group/updatename`

条件同样是群 `_id` 加群主 id。未匹配到文档时，只要数据库没抛错，响应仍是「更新成功」。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |
| `newName` | body | string | 是 | 新群名 |

```json
{
  "status": 200,
  "msg": "更新成功"
}
```

### 更改群公告

`POST /api/group/updatenotice`

正文字段是 `newNotice`。条件同样是群 `_id` 加群主 id。数据库抛错时 `msg` 为错误信息本身，没有「无权或修改失败」前缀。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |
| `newNotice` | body | string | 是 | 新公告 |

```json
{
  "status": 200,
  "msg": "更新成功"
}
```

### 邀请成员

`POST /api/group/invite`

不检查调用者是不是群主或成员。`userId` 是被邀请人，来自正文。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |
| `userId` | body | string | 是 | 被邀请用户 id |

| status | msg |
| --- | --- |
| 200 | `邀请成功` |
| 201 | `该用户已在群组中` |

```json
{
  "status": 200,
  "msg": "邀请成功"
}
```

### 移除成员

`POST /api/group/removegroupmember`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |
| `memberId` | body | string | 是 | 被移除的用户 id |

数据层用 `{ groupId, userId: 当前用户 }` 在 `Group` 集合上计数，大于 0 才删除该成员，并删除 `userId` 等于 `memberId` 的群消息。群文档的主键字段是 `_id`，没有 `groupId`，因此这个计数匹配不到群，删除不会发生。回调没有抛错时，路由不返回数据层的「没有权限」，固定响应：

```json
{
  "status": 200,
  "msg": "移除成功"
}
```

### 更改群内昵称

`POST /api/group/updatenickname`

更新当前用户自己的群成员文档，写入字段 `name`。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |
| `newNickName` | body | string | 是 | 新的群内昵称 |

```json
{
  "status": 200,
  "msg": "更新成功"
}
```

### 退出群组

`POST /api/group/exitgroup`

删除当前用户的群成员记录，不删除群消息。

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |

```json
{
  "status": 200,
  "msg": "退出成功"
}
```

### 解散群组

`POST /api/group/breakgroup`

| 字段 | 位置 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- | --- |
| `groupId` | body | string | 是 | 群 id |

路由在回调无错误时准备返回 `{ "status": 200, "msg": "解散成功" }`。数据层 `deleteGroup` 只在数据库报错或后续清理抛错时调用这个回调；删除语句没有报错时不调用回调，客户端收不到「解散成功」。删除条件是 `{ groupId, userId }`。清理群消息和群成员时使用的字段名是 `grouId`。

## Socket.IO

连接 `http://localhost:3001`。不校验 token。同一用户 id 只保留最后一次 `online` 的 socket。

服务端发给客户端的事件都没有单独的确认响应。下面「推送」列是其他在线连接会收到的事件。

### 上线

客户端发送 `online`。参数是用户 id 字符串，不是对象。

若该 id 已有连接，先向旧连接推送无参数的 `forceOffline`，再记下新连接。

### 下线

客户端发送 `offline`。参数是用户 id 字符串。服务端从在线表删除该 id。没有推送。

### 申请添加好友

客户端发送 `friendApply`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | string | 申请方 id。关系记录要用它 |
| `friendId` | string | 被申请方 id。也用来找对方的 socket |
| `content` | string | 验证消息。仅当值为空字符串时改成 `请求添加好友` |
| `types` | string | 会随这条验证消息一起入库，模型约定 `0` 为文字 |

尚不存在这条单向关系时，写入两条好友记录：申请方 `state` 为 `1`，对方为 `2`。无论是否新建关系，都会再插入一条私聊，并把 `time` 设为服务器当前时间。

对方在线时推送无参数的 `receiveApply`。

### 同意好友申请

客户端发送 `agreeApply`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | string | 被申请方（当前用户）id |
| `friendId` | string | 申请方 id |

用这两个字段查找好友记录。只有 `state` 为 `2` 时才把双方改成 `0`，并插入一条 `types` 为 `0` 的私聊，正文为 `我们已经成为好友，可以开始聊天了！`。

推送不等待数据库结束：调用方自己会收到无参数的 `acceptedApply`；`friendId` 在线时，对方也会收到同样的无参数事件。

### 加入群组

客户端发送 `groupApply`。服务端直接写入成员，没有单独的审批接口。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `groupId` | string | 群 id |
| `userId` | string | 加入者 id |
| `content` | string | 入群消息。仅当值为空字符串时改成 `加入了群组` |
| `types` | string | 入群消息的类型 |

先保存群成员（`time` 为当前时间），再保存一条群消息。然后查询成员列表，向其中在线的连接推送无参数的 `newGroupMemberJoin`。使用的是 `socket.to`，当前这条连接不会收到自己发出的事件。成员保存是异步的，随后那次成员查询不一定已经包含刚加入的用户。

### 发送私聊

客户端发送 `sendMsg`。整个对象会按 `Message` 的字段入库，并用同一个对象推送。路由看 `friendId`，事件名看 `encrypted` 的真值：真则 `receiveEncryptedMsg`，否则 `receiveMsg`。对方不在线时只入库，不推送。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | string | 发送方 |
| `friendId` | string | 接收方 |
| `content` | string | 正文。加密会话由客户端加密 |
| `types` | string | `0` 文字，`1` 图片，服务端不校验 |
| `time` | string | 客户端传入的时间。本事件不会改写它 |
| `encrypted` | boolean | 真则走加密通道 |
| `read` | boolean | 可不传，入库默认 `false` |

加密正文的格式由前端决定。hine 的加密会话用对方公钥和自己的公钥各加密一次，再用 `|` 拼进 `content`。

### 发送群消息

客户端发送 `sendGroupMsg`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `groupId` | string | 群 id |
| `userId` | string | 发送方。未读数会先给全体成员加 1，再把发送方改回 `0` |
| `content` | string | 正文 |
| `types` | string | 消息类型 |
| 其他字段 |  | 原样出现在推送里。入库前服务端会把 `time` 写成当前时间，因此推送对象上的 `time` 也是这个值 |

入库后，向该群其他在线成员推送 `receiveGroupMsg`，参数就是这份 `data`（不是空参数）。发送方自己不会收到。
