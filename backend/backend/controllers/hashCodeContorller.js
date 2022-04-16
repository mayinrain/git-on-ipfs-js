var dbConfig = require('../util/dbconfig')
/* 状态一览 */
// status： 0为当前版本， 1为以往版本
// new：0为无多个版本， 1为有多个版本
// private：1为私有， 0为公有

// 获取单文件列表
// 检索不是私有且为当前版本的文件（private: 0, status: 0）
// 和
// 私有且为当前版本，但是用户匹配的文件
getHashCode = (req, res) => {
    console.log(req.payload.username, 'req')
    var sql = `select * from hashCode where (status = 0 and private = 0) or (user_name = '${req.payload.username}' and status = 0 and private = 1)`
    var sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
            console.log(err)
        } else {
            res.send({
                list: data,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 添加单个文件信息
// 新文件默认为公有
addHashCode = (req, res) => {
    console.log(req, 'req.body')
    let sql = `INSERT INTO hashcode(id, hashcode, status, create_time, file_name, user_name, uid, new, last, private) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.filename}', '${req.payload.username}', '${req.body.uid}', '${req.body.new}', '${req.body.last}', '0'); INSERT INTO sort(id, uid, user_name, private) VALUES(0,'${req.body.uid}', '${req.payload.username}', '0')`
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
            console.log(err)
        } else {
            res.send({
                mes: '插入成功',
                statuscode: '1',
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 获取文件夹列表
getFolder = (req, res) => {
    var sql = 'select * from folderlist'
    var sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
        } else {
            res.send({
                list: data,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 添加文件夹信息
addFolder = (req, res) => {
    console.log(req, 'req.body')
    let sql = `INSERT INTO hashcode(id, hashcode, status, create_time, folder_name, user_name) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.foldername}', '${req.body.username}')`
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
            console.log(err)
        } else {
            res.send({
                mes: '添加成功',
                statuscode: '1',
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 需要传入当前文件的公私有状态
// 更新单个文件
updateHashCode = (req, res) => {
    console.log(req, 'req.body')
    let sql = `UPDATE hashcode SET status = 1 WHERE uid = '${req.body.uid}' AND status = 0; INSERT INTO hashcode(id, hashcode, status, create_time, file_name, user_name, uid, new, last, private) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.filename}', '${req.payload.username}', '${req.body.uid}', '${req.body.new}', '${req.body.last}', '${req.body.private}'); `
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
            console.log(err)
        } else {
            res.send({
                mes: '更新成功',
                statuscode: '1',
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 设置为正在使用的版本
setFile = (req, res) => {
    console.log(req, 'req')
    let sql = `UPDATE hashcode SET status = 1 WHERE uid = '${req.body.uid}' AND status = '0' AND user_name = '${req.payload.username}'; UPDATE hashcode SET status = 0 WHERE uid = '${req.body.uid}' AND id = '${req.body.id}' AND user_name = '${req.payload.username}'`
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
            console.log(err)
        } else {
            res.send({
                mes: '设置成功',
                statuscode: '1',
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 获取历史版本列表
getHistory = (req, res) => {
    console.log(req)
    let sql = `select * from hashCode where uid = '${req.body.uid}'`
    var sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
        } else {
            res.send({
                list: data,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 删除单个文件
// 前端不应该对非owner显示对应操作
// 如果通过其他方式操作，数据库根据token的payload判断用户并进行相应操作
deleteFile = (req, res) => {
    console.log(req)
    let sql
    if (req.body.all === '1') {
        // 删除所有相关版本
        sql = `delete from hashCode where uid = '${req.body.uid}' and user_name = '${req.payload.username}'; delete from sort where uid = '${req.body.uid}' and user_name = '${req.payload.username}'`
    } else {
        // 删除指定版本
        sql = `delete from hashCode where uid = '${req.body.uid}' and id = '${req.body.id}' and user_name = '${req.payload.username}'`
    }

    var sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log(err);
            console.log('连接出错')
        } else {
            res.send({
                mes: '删除成功',
                statuscode: '1',
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 获取顺序
getSort = (req, res) => {
    var sql = `select uid from sort where private = 0 or (user_name = '${req.payload.username}' and private = 1) `
    var sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错')
        } else {
            res.send({
                list: data,
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 文件公私有设置
setPrivate = (req, res) => {
    console.log(req.body)
    // 公有设为私有
    if (req.body.private === 0) {
        // 公有
        var sql = `UPDATE hashcode SET private = 1 WHERE uid = '${req.body.uid}' AND user_name = '${req.payload.username}' AND user_name = '${req.payload.username}'; UPDATE sort SET private = 1 WHERE uid = '${req.body.uid}' AND user_name = '${req.payload.username}'`
        var sqlArr = []
        var callBack = (err, data) => {
            if (err) {
                console.log(err);
                console.log('连接出错')
            } else {
                res.send({
                    mes: '设置成功',
                    statuscode: '1'
                })
            }
        }
        dbConfig.sqlConnect(sql, sqlArr, callBack)
    }
    else {
        // 私有
        var sql = `UPDATE hashcode SET private = 0 WHERE uid = '${req.body.uid}' AND user_name = '${req.payload.username}' AND user_name = '${req.payload.username}'; UPDATE sort SET private = 0 WHERE uid = '${req.body.uid}' AND user_name = '${req.payload.username}'`
        var sqlArr = []
        var callBack = (err, data) => {
            if (err) {
                console.log(err);
                console.log('连接出错')
            } else {
                res.send({
                    mes: '设置成功',
                    statuscode: '1'
                })
            }
        }
        dbConfig.sqlConnect(sql, sqlArr, callBack)
    }
}
module.exports = {
    getHashCode,
    addHashCode,
    addFolder,
    getFolder,
    updateHashCode,
    getHistory,
    deleteFile,
    setFile,
    getSort,
    setPrivate,
}
