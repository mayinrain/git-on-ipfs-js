var express = require('express')
var router = express.Router()
var hashCode = require('../controllers/hashCodeContorller')
var member = require('../controllers/memberController')
// jwt
const jwt = require('jsonwebtoken')
const jwtKey = 'fasjkldjskladjklaqweasdz'
// 解析json
router.use(express.json())
// 拦截请求信息
const authentication = (req, res, next) => {
    const headers = req.headers
    const token = headers['authorization'].split(' ')[1]
    console.log(token, 'token')
    jwt.verify(token, jwtKey, (err, payload) => {
        if (err) res.sendStatus(401)
        else {
            console.log(payload, 'payload');
            // 将payload传入后续中间件
            req.payload = payload
            next()
        }
    })
}

// 上传单个文件
router.get('/',authentication, hashCode.getHashCode)
router.post('/', authentication, hashCode.addHashCode)
// 更新文件
router.post('/update', authentication, hashCode.updateHashCode)
// 查看更新列表
router.post('/history', authentication, hashCode.getHistory)
// 删除单个文件
router.post('/delete', authentication, hashCode.deleteFile)
// 设置为当前版本
router.post('/setFile', authentication, hashCode.setFile)
// 获取顺序
router.get('/sort', authentication, hashCode.getSort)
// 修改公私有状态
router.post('/private', authentication, hashCode.setPrivate)
/** 以下为登录相关，无需拦截认证  **/

// 用户注册
router.post('/reg', member.register)
// 用户登录
router.get('/logincode', member.loginCode)
router.post('/login', member.login)

module.exports = router
