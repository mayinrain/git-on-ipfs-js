import service from "./axios";
// 单个文件
const getHashCodeList = service.get({
    url: '/'
})

const addHashCode = service.post({
    url: '/',
})

// 文件夹
const getFolder = service.get({
    url: '/folder'
})

const addFolder = service.post({
    url: '/folder',
})
export default {getHashCodeList, addHashCode, getFolder, addFolder}