function getTime() {
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var Hours = date.getHours()
    var Minutes = date.getMinutes()
    var Seconds = date.getSeconds()
    if (month < 10) {
        month = '0' + month
    }
    if (day < 10) {
        day = '0' + day
    }
    var s_createtime =
        year +
        '-' +
        month +
        '-' +
        day +
        ' ' +
        Hours +
        ':' +
        Minutes +
        ':' +
        Seconds
    return s_createtime
}
module.exports = { getTime }