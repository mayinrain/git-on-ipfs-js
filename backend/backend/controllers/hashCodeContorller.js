var dbConfig = require('../util/dbconfig')

// 获取单文件列表
getHashCode = (req, res) => {
    var sql = "select * from hashCode where status = 0";
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
    let sql = `UPDATE hashcode SET status = 1 WHERE uid = '${req.body.uid}' AND status = 0; INSERT INTO hashcode(id, hashcode, status, create_time, file_name, user_name, uid, new, last) VALUES(0, '${req.body.hashcode}', ${req.body.status}, '${req.body.createTime}', '${req.body.filename}', '${req.body.username}', '${req.body.uid}', '${req.body.new}', '${req.body.last}'); `;
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
// 设置为正在使用的版本
setFile = (req, res) => {
    console.log(req, 'req');
    let sql = `UPDATE hashcode SET status = 1 WHERE uid = '${req.body.uid}' AND status = '0'; UPDATE hashcode SET status = 0 WHERE uid = '${req.body.uid}' AND id = '${req.body.id}'`
    let sqlArr = []
    var callBack = (err, data) => {
        if (err) {
            console.log('连接出错');
            console.log(err);
        } else {
            res.send({
                mes: '设置成功',
                statuscode: '1'
            })
        }
    }
    dbConfig.sqlConnect(sql, sqlArr, callBack)
}
// 获取历史版本列表
getHistory = (req, res) => {
    console.log(req);
    let sql = `select * from hashCode where uid = '${req.body.uid}'`;
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
// 删除单个文件
deleteFile = (req, res) => {
    console.log(req);
    let sql
    if (req.body.all === '1') {
        // 删除所有相关版本
        sql = `delete from hashCode where uid = '${req.body.uid}'`
    } else {
        // 删除指定版本
        sql = `delete from hashCode where uid = '${req.body.uid}' and id = '${req.body.id}'`;
    }
    
    var sqlArr = [];
    var callBack = (err, data) => {
        if (err) {
        console.log('连接出错');
        } else {
            res.send({
                mes: '删除成功',
                statuscode: '1'
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
    getHistory,
    deleteFile,
    setFile
}