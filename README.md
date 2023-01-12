Hine 聊天软件服务器

努力开发中......

## 接口文档

> 注意：由于本人是前后端并行开发的，所以只将输入规范校验放在了前端

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

| 字段   | 类型   | 说明                      |
| ------ | ------ | ------------------------- |
| status | int    | 状态码                    |
| msg    | String | 该用户名用户数量/错误信息 |

示例：

```json
{
    "status": 0,
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

| 字段   | 类型   | 说明                        |
| ------ | ------ | --------------------------- |
| status | int    | 状态码                      |
| msg    | String | 该邮箱地址用户数量/错误信息 |

示例：

```json
{
    "status": 0,
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
    "status": 0,
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

| 字段   | 类型        | 说明                                      |
| ------ | ----------- | ----------------------------------------- |
| status | int         | 状态码，0登录成功，1错误，2账号或密码错误 |
| msg    | String/JSON | 错误信息/用户名+头像链接+token            |

示例：

```json
{
    "status": 0,
    "msg": {
    	name: 'zs',
        imgUrl: 'user.png',
        token: 'xxxxx...'
    }
}
```

---

接下来的所有接口请求头都需要有token

---

2. 获取用户信息

> 地址：/signin/getuserinfo
>
> 请求方式：GET

参数：

| 请求头 | 说明  | 必需 |
| ------ | ----- | ---- |
| token  | token | 是   |

返回值：

| 字段   | 类型 | 说明                       |
| ------ | ---- | -------------------------- |
| status | int  | 状态码                     |
| msg    | JSON | 用户信息：用户名、头像链接 |

示例：

```json
{
    "status": 0,
    "msg": {
    	name: 'zs',
        imgUrl: 'user.png'
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
    "status": 0,
    "msg": [
        {
            _id: 'asdafafwaf'
            name: 'zs',
            email: 'zs@qq.com',
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

| 字段   | 类型   | 说明                                   |
| ------ | ------ | -------------------------------------- |
| status | int    | 状态码，0好友、2申请中、3非好友、1错误 |
| msg    | String | 好友关系描述信息                       |

示例：

```json
{
    "status": 2,
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
    "status": 0,
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

| 字段   | 类型   | 说明                                |
| ------ | ------ | ----------------------------------- |
| status | int    | 状态码，0在群内、2非群内成员、1错误 |
| msg    | String | 群和用户关系的描述信息              |

示例：

```json
{
    "status": 2,
    "msg": '非群内成员'
}
```



#### 好友

1. 申请添加

> 地址：/friend/apply
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| userId   | String | 申请方id   | 是   |
| friendId | String | 被申请方id | 是   |
| content  | String | 验证信息   | 否   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 0,
    "msg": '发送成功'
}
```

2. 同意申请

> 地址：/friend/agree
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| userId   | String | 被申请方id | 是   |
| friendId | String | 申请方id   | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 0,
    "msg": '同意成功'
}
```

3. 拒绝申请

> 地址：/friend/reject
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| userId   | String | 被申请方id | 是   |
| friendId | String | 申请方id   | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 0,
    "msg": '请求成功'
}
```

4. 删除好友

> 地址：/friend/delete
>
> 请求方式： POST

参数：

| 字段     | 类型    | 说明                     | 必需 |
| -------- | ------- | ------------------------ | ---- |
| userId   | String  | 用户id                   | 是   |
| friendId | String  | 被删除好友id             | 是   |
| delete   | Boolean | 是否删除聊天记录（单向） | 否   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 0,
    "msg": '请求成功'
}
```

5. 获取好友列表

> 地址：/friend/getfriends
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明     |
| ------ | ----- | -------- |
| status | int   | 状态码   |
| msg    | Array | 好友信息 |

示例：

```json
{
    "status": 0,
    "msg": [
        {
            _id: 'asfasfa',
            name: 'zs',
            imgUrl: 'user.png'
        }
    ]
}
```

6. 获取好友申请列表

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
    "status": 0,
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

1. 获取所有好友发送的消息

> 地址：/chat/getallfriendmsgs
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明               |
| ------ | ----- | ------------------ |
| status | int   | 状态码             |
| msg    | Array | 所有好友发送的消息 |

示例：

```json
{
    "status": 0,
    "msg": [
    	{
            userId: 'asfasfa',
            friendMsgs: [
                {
                    content: '你好',
                    types: '0',
                    time: '',
                    state: 1
                }
            ]
        }
    ]
}
```

2. 获取所有已发送的消息

> 地址：/chat/getallmymsgs
>
> 请求方式： GET

参数：无

返回值：

| 字段   | 类型  | 说明             |
| ------ | ----- | ---------------- |
| status | int   | 状态码           |
| msg    | Array | 所有已发送的消息 |

示例：

```json
{
    "status": 0,
    "msg": [
    	{
            friendId: 'asfasfa',
            myMsgs: [
                {
                    content: '你好',
                    types: '0',
                    time: '',
                    state: 1
                }
            ]
        }
    ]
}
```

3. 已读单个好友的所有消息

> 地址：/chat/readfriendmsgs
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明       | 必需 |
| -------- | ------ | ---------- | ---- |
| userId   | String | 用户id     | 是   |
| friendId | String | 对象好友id | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 0,
    "msg": '请求成功'
}
```

4. 发送消息

> 地址：/chat/readfriendmsgs
>
> 请求方式： POST

参数：

| 字段     | 类型   | 说明                      | 必需 |
| -------- | ------ | ------------------------- | ---- |
| userId   | String | 用户id                    | 是   |
| friendId | String | 对象好友id                | 是   |
| content  | String | 文本消息                  | 是   |
| types    | String | 消息类型，0文本、1图片... | 是   |

返回值：

| 字段   | 类型   | 说明     |
| ------ | ------ | -------- |
| status | int    | 状态码   |
| msg    | String | 描述信息 |

示例：

```json
{
    "status": 0,
    "msg": '请求成功'
}
```

