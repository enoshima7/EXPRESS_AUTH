const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
app.use(express.json())
const { User } = require('./models')

//中间件：jwt把header中的token拿来验证解密拿到用户id
const auth = async (req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop()
    const { _id } = jwt.verify(raw, 'fdafafe24r43rf4')
    req.user = await User.findById(_id)//中间件中把信息放入req中，后面才可以使用
    next()
}

//获取所有用户数据接口
app.get('/api/users', async (req, res) => {
    res.send(await User.find())
})
//注册接口
app.post('/api/register', async (req, res) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
    })
    res.send(user)
})
//登录接口
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({//通过输入的用户名找数据库中的用户
        username: req.body.username,
    })
    if (!user) {//判断是否有此用户
        return res.status(422).send({
            massage: '用户名不存在'
        })
    }
    const isPasswordValid = require('bcrypt').compareSync(//通过bcrypt对比输入的密码与数据库中用户密码
        req.body.password,
        user.password
    )
    if (!isPasswordValid) {
        return res.status(422).send({//如果对比失败就密码错误
            message: '密码错误'
        })
    }
    //生成token

    const token = jwt.sign({//通过jwt生成token，并把用户id封入token中
        _id: String(user._id),
    }, 'fdafafe24r43rf4')//要通过一个secret密钥
    res.send({
        user,
        token
    })
})

app.get('/api/profile', auth, async (req, res) => {//要想获取用户信息等，需要经过中间件auth，拿token验证获取用户id
    res.send(req.user)//通过用户id拿到用户信息
})















app.listen(3000, () => {
    console.log('http://localhost:3000');
})

