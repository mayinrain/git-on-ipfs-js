import axios from 'axios'

const service = axios.create({
    baseURL: '/cors',
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    }
})
export default service