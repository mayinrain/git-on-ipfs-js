const mysql = require('mysql')
module.exports = {
    // config
    config: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '123456',
        database: 'exapp',
        multipleStatements: true
    },
    // connect
    sqlConnect: function (sql, sqlArr, callBack) {
        var pool = mysql.createPool(this.config)
        pool.getConnection((err, conn) => {
            console.log('连接成功');
            if (err) {
                console.log(err);
                return;
            }

            conn.query(sql, sqlArr, callBack)
            conn.release();
        })
    }
}