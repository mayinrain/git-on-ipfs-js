var dbConfig = require('../util/dbconfig')

// 获取单文件列表
getHashCode = (req, res) => {
    var sql = "select * from hashCode where last = 1";
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
        console.log('连接出错');
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 添加单个文件信息
addHashCode = (req, res) => {
    console.log(req, 'req.body');
    let sql = `INSERT INTO hashcode(id, hashcode, status, create_time, file_name, user_name, uid, new, last) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.filename}', '${req.body.username}', '${req.body.uid}', '${req.body.new}', '${req.body.last}')`;
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
            console.log(err);
        } else {
            res.send({
                mes: '插入成功',
                statuscode: '1'
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 获取文件夹列表
getFolder = (req, res) => {
    var sql = "select * from folderlist";
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
        console.log('连接出错');
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 添加文件夹信息
addFolder = (req, res) => {
    console.log(req, 'req.body');
    let sql = `INSERT INTO hashcode(id, hashcode, status, create_time, folder_name, user_name) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.foldername}', '${req.body.username}')`;
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
            console.log(err);
        } else {
            res.send({
                mes: '添加成功',
                statuscode: '1'
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
} 
// 更新单个文件
updateHashCode = (req, res) => {
    console.log(req, 'req.body');
    let sql = `UPDATE hashcode SET last = 0 WHERE uid = '${req.body.uid}'; INSERT INTO hashcode(id, hashcode, status, create_time, file_name, user_name, uid, new, last) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.filename}', '${req.body.username}', '${req.body.uid}', '${req.body.new}', '${req.body.last}'); `;
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
            console.log(err);
        } else {
            res.send({
                mes: '更新成功',
                statuscode: '1'
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 获取历史版本列表
getHistory = (req, res) => {
    console.log(req);
    let sql = `select * from hashCode where uid = '${req.body.uid}' and last = 0`;
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
        console.log('连接出错');
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
module.exports = {
    getHashCode,
    addHashCode,
    addFolder,
    getFolder,
    updateHashCode,
    getHistory
}