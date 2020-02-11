const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
app.use(express.json())
const { User } = require('./models')

const auth = async (req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop()
    const { _id } = jwt.verify(raw, 'fdafafe24r43rf4')
    req.user = await User.findById(_id)
    next()
}


app.get('/api/users', async (req, res) => {
    res.send(await User.find())
})

app.post('/api/register', async (req, res) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
    })
    res.send(user)
})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username,
    })
    if (!user) {
        return res.status(422).send({
            massage: '用户名不存在'
        })
    }
    const isPasswordValid = require('bcrypt').compareSync(
        req.body.password,
        user.password
    )
    if (!isPasswordValid) {
        return res.status(422).send({
            message: '密码错误'
        })
    }
    //生成token

    const token = jwt.sign({
        _id: String(user._id),
    }, 'fdafafe24r43rf4')
    res.send({
        user,
        token
    })
})

app.get('/api/profile', auth, async (req, res) => {
    res.send(req.user)
})















app.listen(3000, () => {
    console.log('http://localhost:3000');
})

