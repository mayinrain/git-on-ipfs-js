var express = require('express');
var router = express.Router();
var hashCode = require('../controllers/hashCodeContorller')
// 单个文件
router.get('/', hashCode.getHashCode);
router.post('/', hashCode.addHashCode)
// 文件夹
router.get('/folder', hashCode.getFolder);
router.post('/folder', hashCode.addFolder)
// 更新
router.post('/update', hashCode.updateHashCode)
// 查看更新列表
router.post('/history', hashCode.getHistory)
module.exports = router;
