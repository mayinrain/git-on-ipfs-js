import axios from 'axios'
// 每次发送请求时带上token
import { Modal } from 'ant-design-vue'


const service = axios.create({
    baseURL: '/cors',
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",

    }
})
// 发送请求时带上token
service.interceptors.request.use(function (config) {
    let token = localStorage.getItem('ipfsweb-token')
    if (token) {
        config.headers.Authorization = 'Bearer ' + token
        
        console.log(config, token);
    }
    return config
}, function (err) {
    return Promise.reject(err)
})
// token过期了
service.interceptors.response.use(function (response) {
    // 暂时没想到要加啥
    return response
}, function (err) {
    console.log(err, 'err');
    // token超时
    console.log('res', err.response);
    if (err.response.status === 401) {
        localStorage.removeItem('username')
        localStorage.removeItem('ipfsweb-token')
        Modal.error({
            title: '登录信息过期',
            content: '请重新登录'
        })
        location.reload()
    }
    
    return Promise.reject(err)
})
export default service