var express = require('express');
var router = express.Router();
var hashCode = require('../controllers/hashCodeContorller')
// 上传单个文件
router.get('/', hashCode.getHashCode);
router.post('/', hashCode.addHashCode)
// 更新文件
router.post('/update', hashCode.updateHashCode)
// 查看更新列表
router.post('/history', hashCode.getHistory)
// 删除单个文件
router.post('/delete', hashCode.deleteFile)
// 设置为当前版本
router.post('/setFile', hashCode.setFile)
module.exports = router;
