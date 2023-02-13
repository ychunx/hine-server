Hine 聊天软件服务器

努力开发中......

## 接口文档

> 注意：由于本人是前后端并行开发的，所以只将输入规范校验放在了前端
>
> ##### 接口
>
> 1. 注册登录
>
>    用户名占用、邮箱占用、注册、登录、获取用户信息
>
> 2. 搜索
>
>    搜索用户、获取好友关系、搜索群组、获取群关系
>
> 3. 好友管理
>
>    拒绝添加好友、删除好友、获取好友列表、获取好友申请列表、获取好友资料
>
> 4. 聊天
>
>    获取聊天记录、已读好友所有消息
>
> 5. 
>
> ##### socket.io
>
> 1. 好友管理
>
>    1）申请添加好友，如果在线则更新对方好友申请列表
>
>    2）同意添加好友，如果在线则发送消息且更新对方好友列表
>
> 2. 聊天
>
>    1）发信息，需判断双方是否为好友，更新对方消息列表
>
>    2）在聊天页面则在收到消息后已读好友消息
>
> 3. 群
>
>    1）加入群聊
>
>    2）发送消息

#### 注册
1. 查询用户名是否已被占用
> 地址：/signup/nameinuse
>
> 请求方式：GET

参数：

| 字段 | 类型   | 说明   | 必需 |
| ---- | ------ | ------ | ---- |
| name | String | 用户名 | 是   |

返回值：

| 字段   | 类型   | 说明             |
| ------ | ------ | ---------------- |
| status | int    | 状态码           |
| msg    | String | 该用户名用户数量 |

示例：

```json
{
    "status": 200,
    "msg": "0"
}
```

2. 查询邮箱是否已被占用

> 地址：/signup/emailinuse
>
> 请求方式：GET

参数：

| 字段  | 类型   | 说明         | 必需 |
| ----- | ------ | ------------ | ---- |
| email | String | 电子邮件地址 | 是   |

返回值：

| 字段   | 类型   | 说明               |
| ------ | ------ | ------------------ |
| status | int    | 状态码             |
| msg    | String | 该邮箱地址用户数量 |

示例：

```json
{
    "status": 200,
    "msg": "0"
}
```

3. 注册

> 地址：/signup/adduser
>
> 请求方式：POST

参数：

| 字段  | 类型   | 说明         | 必需 |
| ----- | ------ | ------------ | ---- |
| name  | String | 用户名       | 是   |
| email | String | 电子邮件地址 | 是   |
| psw   | String | 密码         | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": "注册成功"
}
```

#### 登录

1. 登录

> 地址：/signin/login
>
> 请求方式：POST

参数：

| 字段  | 类型   | 说明         | 必需   |
| ----- | ------ | ------------ | ------ |
| name  | String | 用户名       | 二选一 |
| email | String | 电子邮件地址 | 二选一 |
| psw   | String | 密码         | 是     |

返回值：

| 字段   | 类型   | 说明                                   |
| ------ | ------ | -------------------------------------- |
| status | int    | 状态码，200登录成功，201账号或密码错误 |
| msg    | String | token                                  |

示例：

```json
{
    "status": 200,
    "msg": 'xxxxxxx'
}
```

---

接下来的所有接口请求头都需要有token

---

2. 获取用户信息

> 地址：/signin/getuserinfo
>
> 请求方式：GET

参数：无

返回值：

| 字段   | 类型 | 说明     |
| ------ | ---- | -------- |
| status | int  | 状态码   |
| msg    | JSON | 用户信息 |

示例：

```json
{
    "status": 200,
    "msg": {
    	name: 'zs',
        email: 'xxx@xx.com'
        imgUrl: 'user.png',
        sex: '',
        birth: ''
        ...
    }
}
```

#### 搜索

1. 搜索用户

> 地址：/search/user
>
> 请求方式：POST

参数：

| 字段 | 类型   | 说明                   | 必需 |
| ---- | ------ | ---------------------- | ---- |
| key  | String | 用户名或邮箱地址关键词 | 是   |

返回值：

| 字段   | 类型     | 说明           |
| ------ | -------- | -------------- |
| status | int      | 状态码         |
| msg    | 对象数组 | 关键词用户信息 |

示例：

```json
{
    "status": 200,
    "msg": [
        {
            _id: 'asdafafwaf'
            name: 'zs',
            email: 'zs@xx.com',
            imgUrl: 'user,png'
        },
    ]
}
```

2. 获取好友关系

> 地址：/search/relation
>
> 请求方式：POST

参数：

| 字段     | 类型   | 说明           | 必需 |
| -------- | ------ | -------------- | ---- |
| userId   | String | 当前用户id     | 是   |
| friendId | String | 查询对象用户id | 是   |

返回值：

| 字段   | 类型   | 说明                                                     |
| ------ | ------ | -------------------------------------------------------- |
| status | int    | 状态码，200好友、201申请中、202对方已发出申请、203非好友 |
| msg    | String | 好友关系描述信息                                         |

示例：

```json
{
    "status": 201,
    "msg": '申请中'
}
```

3. 搜索群组

> 地址：/search/group
>
> 请求方式：POST

参数：

| 字段 | 类型   | 说明         | 必需 |
| ---- | ------ | ------------ | ---- |
| key  | String | 群名称关键词 | 是   |

返回值：

| 字段   | 类型     | 说明           |
| ------ | -------- | -------------- |
| status | int      | 状态码         |
| msg    | 对象数组 | 关键词群组信息 |

示例：

```json
{
    "status": 200,
    "msg": [
        {
            _id: 'jafhkjsafwq'
            name: '幸福一家人',
            imgUrl: 'user,png'
        },
    ]
}
```

4. 查询用户是否在群内

> 地址：/search/isingroup
>
> 请求方式：POST

参数：

| 字段    | 类型   | 说明         | 必需 |
| ------- | ------ | ------------ | ---- |
| userId  | String | 当前用户id   | 是   |
| groupId | String | 查询对象群id | 是   |

返回值：

| 字段   | 类型   | 说明                             |
| ------ | ------ | -------------------------------- |
| status | int    | 状态码，200在群内、201非群内成员 |
| msg    | String | 群和用户关系的描述信息           |

示例：

```json
{
    "status": 201,
    "msg": '非群内成员'
}
```



#### 好友

1. 拒绝申请

> 地址：/friend/reject
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明     | 必需 |
| -------- | ------ | -------- | ---- |
| friendId | String | 申请方id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '拒绝成功'
}
```

2. 删除好友

> 地址：/friend/delete
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明         | 必需 |
| -------- | ------ | ------------ | ---- |
| friendId | String | 被删除好友id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '删除成功'
}
```

3. 获取好友列表

> 地址：/friend/getfriends
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明         |
| ------ | ----- | ------------ |
| status | int   | 状态码       |
| msg    | Array | 好友列表信息 |

示例：

```json
{
    "status": 200,
    "msg": [
        {
            _id: 'asfasfa',
            name: 'zs',
            imgUrl: 'user.png'，
            nickname: 'xiaozhang'
        }
    ]
}
```

4. 获取好友申请列表

> 地址：/friend/getfriendapplys
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明             |
| ------ | ----- | ---------------- |
| status | int   | 状态码           |
| msg    | Array | 好友申请列表信息 |

示例：

```json
{
    "status": 200,
    "msg": [
    	{
            name: 'zs',
            imgUrl: 'user.png',
            friendId: 'safafasf',
            msgs: [
                {
                    content: '你好啊',
                    time: '',	// 发送时间
                }
            ]
        }
    ]
}
```

#### 聊天

1. 获取所有非加密聊天记录

> 地址：/chat/getallmsgs
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明                       |
| ------ | ----- | -------------------------- |
| status | int   | 状态码                     |
| msg    | Array | 所有聊天记录和对应好友信息 |

示例：

```json
{
    "status": 200,
    "msg": [
    	{
            friendId: 'asfasdasfa',
            name: 'zs',
            nickname: 'xiaozhang',
            imgUrl: 'user.png',
            unReadNum: 1
            allMsgs: [
                {
                    content: '你好',
                    types: '0',
                    time: '',
                    read: false,
                    encrypted: false,
                    userId: ''	// 发送方id
                    friendId: ''	// 接收方id
                }
            ]
        }
    ]
}
```

2. 已读单个好友的所有非加密消息

> 地址：/chat/readfriendmsgs
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| friendId | String | 对象好友id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '请求成功'
}
```

3. 获取所有加密聊天记录

> 地址：/chat/getallencryptedmsgs
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明                           |
| ------ | ----- | ------------------------------ |
| status | int   | 状态码                         |
| msg    | Array | 所有加密聊天记录和对应好友信息 |

示例：

```json
{
    "status": 200,
    "msg": [
    	{
            friendId: 'asfasdasfa',
            name: 'zs',
            nickname: 'xiaozhang',
            imgUrl: 'user.png',
            unReadNum: 1
            allMsgs: [
                {
                    content: '你好',
                    types: '0',
                    time: '',
                    read: true,
                    encrypted: true,
                    userId: ''	// 发送方id
                    friendId: ''	// 接收方id
                }
            ]
        }
    ]
}
```

4. 已读单个好友的所有加密消息

> 地址：/chat/readfriendencryptedmsgs
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| friendId | String | 对象好友id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '请求成功'
}
```

5. 删除非加密聊天记录

> 地址：/chat/delete
>
> 请求方式：POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| friendId | String | 对象好友id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '删除成功'
}
```

6. 删除加密聊天记录

> 地址：/chat/deleteencrypted
>
> 请求方式：POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| friendId | String | 对象好友id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '删除成功'
}
```

7. 已读群组所有消息

> 地址：/chat/readgroupmsgs
>
> 请求方式： POST

参数：

| 字段    | 类型   | 说明       | 必需 |
| ------- | ------ | ---------- | ---- |
| groupId | String | 对象群组id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '请求成功'
}
```

8. 获取所有群组消息和群成员信息

> 地址：/chat/getallgroupmsgs
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型   | 说明                     |
| ------ | ------ | ------------------------ |
| status | int    | 状态码                   |
| msg    | String | 所有群组消息和群成员信息 |

示例：

```JSON
{
    "status": 200,
    "msg": {
        "groupMsgs": [
            {
                "groupId": "63e8f1a7437fb9398cc7ff7b",
                "unReadNum": 1,
                "joinTime": "2023-02-12T14:03:19.287Z",
                "name": "1",
                "userId": "63e734b3f354781166cafa05",
                "imgUrl": "http://localhost:3000/user.png",
                "time": "2023-02-12T14:03:19.287Z",
                "allMsgs": [
                    {
                        "_id": "63e8f1a7437fb9398cc7ff7f",
                        "groupId": "63e8f1a7437fb9398cc7ff7b",
                        "userId": "63e734b3f354781166cafa05",
                        "content": "创建群组",
                        "types": "0",
                        "time": "2023-02-12T14:03:19.297Z",
                        "__v": 0
                    }
                ]
            },
        ],
        "userInfos": [
            {
                "groupId": "63e8f1a7437fb9398cc7ff7b",
                "memberInfos": [
                    {
                        "_id": "63e734b3f354781166cafa05",
                        "name": "1",
                        "imgUrl": "http://localhost:3000/user.png"
                    },
                    {
                        "_id": "63e734b8f354781166cafa0b",
                        "name": "2",
                        "imgUrl": "http://localhost:3000/user.png"
                    }
                ]
            },
        ]
    }
}
```

#### 资料

1. 修改用户名

> 地址：/detail/name
>
> 请求方式： POST

参数：

| 字段    | 类型   | 说明     | 必需 |
| ------- | ------ | -------- | ---- |
| pwd     | String | 密码     | 是   |
| newName | String | 新用户名 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 202,
    "msg": '用户名已被占用'
}
```

2. 修改邮箱地址

> 地址：/detail/email
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| pwd      | String | 密码       | 是   |
| newEmail | String | 新邮箱地址 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '修改成功'
}
```

3. 修改密码

> 地址：/detail/pwd
>
> 请求方式： POST

参数：

| 字段   | 类型   | 说明   | 必需 |
| ------ | ------ | ------ | ---- |
| pwd    | String | 密码   | 是   |
| newPwd | String | 新密码 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 201,
    "msg": '原密码错误'
}
```

4. 修改性别

> 地址：/detail/sex
>
> 请求方式： POST

参数：

| 字段   | 类型   | 说明   | 必需 |
| ------ | ------ | ------ | ---- |
| newSex | String | 新性别 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '修改成功'
}
```

5. 修改出生日期

> 地址：/detail/birth
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| newBirth | String | 新出生日期 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '修改成功'
}
```

6. 修改个性签名

> 地址：/detail/signature
>
> 请求方式： POST

参数：

| 字段         | 类型   | 说明       | 必需 |
| ------------ | ------ | ---------- | ---- |
| newSignature | String | 新个性签名 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '修改成功'
}
```

7. 修改头像

> 地址：/detail/portrait
>
> 请求方式： POST

参数：

| 字段           | 类型   | 说明       | 必需 |
| -------------- | ------ | ---------- | ---- |
| newPortraitUrl | String | 新头像链接 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '修改成功'
}
```

8. 修改好友备注

> 地址：/detail/nickname
>
> 请求方式：POST

参数：

| 字段        | 类型   | 说明       | 必需 |
| ----------- | ------ | ---------- | ---- |
| userId      | String | 用户id     | 是   |
| friendId    | String | 好友id     | 是   |
| newNickname | String | 新好友备注 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": '修改成功'
}
```

9. 根据 id 获取用户信息

> 地址：/detail/getuserinfobyid
>
> 请求方式：POST

参数：

| 字段   | 类型   | 说明    | 必需 |
| ------ | ------ | ------- | ---- |
| userId | String | 用户 id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": {
        "_id": "63e734b3f35478xxxcafa05",
        "email": "1@1.1",
        "name": "1",
        "sex": "男",
        "birth": "2023-12-31T16:00:00.000Z",
        "signature": "ta很懒，什么都没有留下~",
        "imgUrl": "http://xxx/portraitImages/a32b42xxx11f2e3a586800.jpg",
        "registerTime": "2023-12-31T06:24:51.026Z",
    }
}
```

#### 文件上传

1. 上传用户头像

> 地址：/upload/portrait
>
> 请求方式： POST

参数：

| 字段         | 类型 | 说明             | 必需 |
| ------------ | ---- | ---------------- | ---- |
| portraitFile | File | 用户头像图像文件 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 文件路径 |

示例：

```json
{
    "status": 200,
    "msg": 'http://xxx.com/xxx/xxx.png'
}
```

2. 上传群组头像

> 地址：/upload/groupportrait
>
> 请求方式： POST

参数：

| 字段              | 类型 | 说明           | 必需 |
| ----------------- | ---- | -------------- | ---- |
| groupPortraitFile | File | 群头像图像文件 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 文件路径 |

示例：

```json
{
    "status": 200,
    "msg": 'http://xxx.com/xxx/xxx.png'
}
```

3. 上传聊天图片

> 地址：/upload/image
>
> 请求方式： POST

参数：

| 字段          | 类型 | 说明         | 必需 |
| ------------- | ---- | ------------ | ---- |
| uploadImgFile | File | 聊天图像文件 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 文件路径 |

示例：

```json
{
    "status": 200,
    "msg": 'http://xxx.com/xxx/xxx.png'
}
```

4. 上传群组聊天图片

> 地址：/upload/groupimage
>
> 请求方式： POST

参数：

| 字段               | 类型 | 说明             | 必需 |
| ------------------ | ---- | ---------------- | ---- |
| uploadGroupImgFile | File | 群组聊天图像文件 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 文件路径 |

示例：

```json
{
    "status": 200,
    "msg": 'http://xxx.com/xxx/xxx.png'
}
```

#### 群组

1. 查询群组名称是否已被占用

> 地址：/group/nameinuse
>
> 请求方式： GET

参数：

| 字段 | 类型   | 说明     | 必需 |
| ---- | ------ | -------- | ---- |
| name | String | 群组名称 | 是   |

返回值：

| 字段   | 类型   | 说明           |
| ------ | ------ | -------------- |
| status | int    | 状态码         |
| msg    | String | 该名称群组数量 |

示例：

```JSON
{
    "status": 200,
    "msg": '0'
}
```

2. 创建群组

> 地址：/group/build
>
> 请求方式： POST

参数：

| 字段    | 类型   | 说明           | 必需 |
| ------- | ------ | -------------- | ---- |
| name    | String | 群组名称       | 是   |
| imgUrl  | String | 群头像         | 否   |
| friends | Array  | 群成员 id 数组 | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```JSON
{
    "status": 200,
    "msg": '创建成功'
}
```

3. 根据 id 获取群组信息

> 地址：/group/getgroupinfobyid
>
> 请求方式：POST

参数：

| 字段    | 类型   | 说明    | 必需 |
| ------- | ------ | ------- | ---- |
| groupId | String | 群组 id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 200,
    "msg": {
        "_id": "63e8f1a7437xxx8cc7ff7b",
        "name": "mygroup",
        "userId": "63e734b3f3xxx1166cafa05",	// 群主 id
        "imgUrl": "http://xxx/group.png",
        "time": "2023-12-31T14:03:19.287Z",
    }
}
```
