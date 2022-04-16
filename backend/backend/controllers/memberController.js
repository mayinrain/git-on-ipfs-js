var dbConfig = require('../util/dbconfig')

let uuid = require('uuid')
let md5 = require('md5')
// jwt
const jwt = require('jsonwebtoken')
const jwtKey = 'fasjkldjskladjklaqweasdz'
// 生成验证码包
let svgCaptcha = require('svg-captcha')
// 注册
register = async (req, res) => {
    let { username, pass, pass2 } = req.body
    if (!username || !pass) {
        res.send({
            code: '400',
            msg: '用户名和密码不能为空',
        })
    }
    if (pass !== pass2) {
        res.send({ code: '400', msg: '两次输入密码不一致' })
    }
    // 判断用户名是否在数据库中存在
    // 存在则直接登录，不存在注册
    let sql = `select * from members where username='${username}'`
    var sqlArr = []
    var callBack = (err, data) => {
        // 该用户是否在数据库中存在
        if (data.length>0) {
            res.send({
                code: '400',
                msg: '该用户名已存在，请重新输入用户名或者直接登录',
            })
        } else {
            // 用户未注册
            let mid = uuid.v4() // 用户唯一性
            pass = md5(pass) // 密码加密
            let sql = `INSERT INTO members(id, mid, username, pass) VALUES(0, '${mid}', '${username}', '${pass}')`
            let sqlArr = []
            let callBack = (err, data) => {
                if (err) {
                    console.log(err)
                    res.send({ code: '400', msg: '注册失败' })
                } else {
                    res.send({ code: '200', msg: '注册成功', data: data })
                }
            }
            dbConfig.sqlConnect(sql, sqlArr, callBack)
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 统一验证码接口
loginCode = (req, res) => {
    let Captcha = svgCaptcha.create() //生成验证码
    // 验证码存储到cookie
    res.cookie('code', Captcha.text)
    res.type('svg') //使用svg
    res.send(Captcha.data) //图片数据发给前端
}
// 登录接口
login = async (req, res) => {
    let { username, pass, code } = req.body
    console.log(req.body, 'login info');
    pass = md5(pass)
    if (!username || !pass || !code) {
        res.send({ code: '400', msg: '用户名，密码和验证码不能为空' })
    }
    // 判断用户是否在数据库中存在
    // 存在则登录，不存在则需要注册
    let sql = `select * from members where username = "${username}"`
    let sqlArr = []
    let callBack = (err, data) => {
        if (data.length === 0) {
            // 未注册
            res.send({ code: '400', msg: '用户名不存在' })
        } else {
            // 登录
            // 判断密码
            if (data[0].pass !== pass) {
                // 密码错误
                res.send({ code: '400', msg: '密码错误' })
            } else {
                // 判断验证码
                if (req.cookies.code.toUpperCase() == code.toUpperCase()) {
                    // 成功后返回token和相关数据
                    jwt.sign({ username }, jwtKey, { expiresIn: '600s' }, (err, token) => {
                        if (err) {
                            res.json({
                                code: '401',
                                msg: '登录信息过期'
                            })
                        }
                        else {
                            res.json({
                                username,
                                code: '200',
                                msg: '登录成功',
                                token
                            })
                        }
                        
                    })
                    // res.send({ code: '200', msg: '登陆成功' })
                } else {
                    res.send({ code: '400', msg: '验证码错误' })
                }
            }
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
module.exports = {
    register,
    loginCode,
    login,
}
