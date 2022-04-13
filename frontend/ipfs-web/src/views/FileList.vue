<template>
    <div class="about">
        <a-list item-layout="horizontal" :data-source="dataList">
            <template #renderItem="{ item }">
                <a-list-item>
                    <template #actions>
                        <a @click="openModal(item)">更新</a>
                        <a @click="downloadFile(item)">下载</a>
                        <a @click="getHistory(item)">版本列表</a>
                        <a @click="deleteFile(item, 'all')">删除所有</a>
                    </template>
                    <a-list-item-meta
                        :description="
                            '由' + item.user_name + '创建于' + item.create_time
                        "
                    >
                        <template #title>
                            <a @click="previewCode(item)">{{
                                item.file_name
                            }}</a>
                        </template>
                        <template #avatar>
                            <img :src="getImg(item.file_name)" alt="" />
                        </template>
                    </a-list-item-meta>
                </a-list-item>
            </template>
        </a-list>
        <a-modal
            title="更新文件"
            v-model:visible="visible"
            :confirm-loading="confirmLoading"
            @ok="confirmUpdate"
        >
            <a-upload-dragger
                v-model:file-list="fileList"
                name="file"
                :multiple="false"
                :before-upload="beforeUpload"
                @change="handleChange"
            >
                <p class="ant-upload-drag-icon">
                    <inbox-outlined></inbox-outlined>
                </p>
                <p class="ant-upload-text">点击或拖动文件到此区域来上传</p>
                <p class="ant-upload-hint">
                    选择你需要更新的文件，会生成对应的新的版本
                </p>
            </a-upload-dragger>
        </a-modal>
        <a-modal
            title="版本列表"
            v-model:visible="historyVisible"
            @ok="closeHistory"
        >
            <a-list item-layout="horizontal" :data-source="historyList">
                <template #renderItem="{ item }">
                    <a-list-item>
                        <template #actions>
                            <a @click="downloadFile(item, 'single')">下载</a>
                            <a
                                v-if="item.status === 1"
                                @click="deleteFile(item)"
                                >删除</a
                            >
                            <a v-if="item.status === 1" @click="setFile(item)"
                                >SET HEAD</a
                            >
                        </template>
                        <a-list-item-meta
                            :description="
                                '由' +
                                item.user_name +
                                '创建于' +
                                item.create_time
                            "
                        >
                            <template #title>
                                <p>
                                    <template v-if="item.status === 0"
                                        ><arrow-right-outlined
                                            :style="{
                                                fontSize: '10px',
                                                marginRight: '5px',
                                            }" /></template
                                    >{{ item.file_name }}
                                </p>
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>
        </a-modal>
    </div>
</template>
<script setup async>
import api from '@/api/axios'
import { ref } from '@vue/reactivity'
import download from 'downloadjs'
import * as ipfsClient from 'ipfs-http-client'
import { config } from '@/utils/ipfs-config'
import moment from 'moment'
import { InboxOutlined, ArrowRightOutlined } from '@ant-design/icons-vue'
import { getTime } from '@/utils/getTime'
import { notification, Modal } from 'ant-design-vue'
import router from '../router'
// 配置ipfs，创建ipfs示例
const ipfs = ipfsClient.create(config) // 连接本地的ipfs 后面可以连接远程的
// 获取数据列表
const dataList = ref()
const formatList = ref([])
try {
    api.get('/').then((res) => {
        console.log(res)
        for (let item of res.data.list) {
            item.create_time = moment(item.create_time)
                .utcOffset('+08:00')
                .format('YYYY-MM-DD HH:mm:ss')
            formatList.value.push(item)
        }

        dataList.value = formatList.value
        console.log(dataList.value, 'list')
    })
} catch (err) {
    console.log(err)
}
// 下载函数
const downloadFile = async (item) => {
    for await (const chunk of ipfs.cat(item.hashcode)) {
        const blob = new Blob([new Uint8Array(chunk)])
        download(blob, item.file_name)
    }
}
// 更新文件
const uid = ref()
const visible = ref(false)
const fileList = ref([])
const fileName = ref()
const confirmLoading = ref(false)
const beforeUpload = () => {
    return false
}

const handleChange = () => {
    console.log(fileList.value[0])
    if (fileList.value.length > 1) {
        fileList.value.splice(0, 1)
    }
}
const confirmUpdate = async () => {
    try {
        fileName.value = fileList.value[0].name
        const added = await ipfs.add(fileList.value[0].originFileObj, {
            progress: (prog) => console.log(`received: ${prog}`),
        })
        let hashCode = added.cid.toString()
        console.log('this is hashcode', hashCode)
        // 单个文件status为0， 文件夹为1
        await api
            .post('/update', {
                hashcode: hashCode,
                status: '0',
                createTime: getTime(),
                filename: fileName.value,
                username: 'YonghaoMei',
                uid: uid.value,
                new: '0', // 1为无以往版本，0为有以往版本
                last: '1', // 1为最新的版本，显示这个
            })
            .then((res) => {
                console.log(res)
                fileList.value = null
                fileName.value = null
                confirmLoading.value = true
                notification.open({
                    message: '更新成功啦',
                    description: '可以查看以往版本哦',
                })
            })
    } catch (err) {
        console.error(err)
        notification.open({
            message: '更新失败',
            description: '请检查网络情况',
        })
    }
    // 重新获取数据
    try {
        formatList.value = []
        await api.get('/').then((res) => {
            console.log(res)
            for (let item of res.data.list) {
                item.create_time = moment(item.create_time)
                    .utcOffset('+08:00')
                    .format('YYYY-MM-DD HH:mm:ss')
                formatList.value.push(item)
            }

            dataList.value = formatList.value
            console.log(dataList.value, 'list')
        })
    } catch (err) {
        console.log(err)
    }
    visible.value = false
}
const openModal = (item) => {
    visible.value = true
    fileList.value = []
    fileName.value = ''
    uid.value = item.uid
}
// 获取历史版本列表
const historyVisible = ref(false)
const historyList = ref([])
const closeHistory = () => {
    historyVisible.value = false
}
const getHistory = async (item) => {
    historyList.value = [] // init
    historyVisible.value = true
    try {
        await api
            .post('/history', {
                uid: item.uid,
            })
            .then((res) => {
                console.log(res)
                for (let item of res.data.list) {
                    item.create_time = moment(item.create_time)
                        .utcOffset('+08:00')
                        .format('YYYY-MM-DD HH:mm:ss')
                    historyList.value.push(item)
                }
                console.log(historyList.value, 'history list')
            })
    } catch (err) {
        console.log(err)
    }
}
// 删除文件
const deleteFile = async (item, type) => {
    // new为0时，有以往版本
    // new为1时，无以往版本

    Modal.confirm({
        title: '删除文件',
        content:
            type === 'all'
                ? '点击确定将会删除所有相关的版本，确定要删除吗？'
                : '确定删除该版本？',
        closable: true,
        cancelText: 'No',
        onOk: async () => {
            try {
                await api
                    .post('/delete', {
                        id: item.id,
                        uid: item.uid,
                        new: item.new,
                        all: type === 'all' ? '1' : '0',
                    })
                    .then(async () => {
                        Modal.success({
                            title: '成功',
                            content:
                                type === 'all'
                                    ? '已经删除该文件及其相关版本'
                                    : '已删除该版本',
                        })
                        try {
                            if (type === 'all') {
                                formatList.value = []
                                await api.get('/').then((res) => {
                                    console.log(res)
                                    for (let item of res.data.list) {
                                        item.create_time = moment(
                                            item.create_time
                                        )
                                            .utcOffset('+08:00')
                                            .format('YYYY-MM-DD HH:mm:ss')
                                        formatList.value.push(item)
                                    }

                                    dataList.value = formatList.value
                                    console.log(dataList.value, 'list')
                                })
                            } else {
                                historyList.value = []
                                await api
                                    .post('/history', {
                                        uid: item.uid,
                                    })
                                    .then((res) => {
                                        console.log(res)
                                        for (let item of res.data.list) {
                                            item.create_time = moment(
                                                item.create_time
                                            )
                                                .utcOffset('+08:00')
                                                .format('YYYY-MM-DD HH:mm:ss')
                                            historyList.value.push(item)
                                        }
                                        console.log(
                                            historyList.value,
                                            'history list'
                                        )
                                    })
                            }
                        } catch (err) {
                            console.log(err)
                        }
                    })
            } catch (err) {
                console.log(err)
                Modal.error({
                    title: '失败',
                    content: '删除失败',
                })
            }
        },
        onCancel: () => {
            return
        },
    })
}
// 设置为当前版本
const setFile = async (item) => {
    try {
        await api
            .post('/setFile', {
                id: item.id,
                uid: item.uid,
            })
            .then(async (res) => {
                console.log(res)
                historyList.value = []
                await api
                    .post('/history', {
                        uid: item.uid,
                    })
                    .then((res) => {
                        console.log(res)
                        for (let item of res.data.list) {
                            item.create_time = moment(item.create_time)
                                .utcOffset('+08:00')
                                .format('YYYY-MM-DD HH:mm:ss')
                            historyList.value.push(item)
                        }
                        console.log(historyList.value, 'history list')
                    })
                formatList.value = []
                await api.get('/').then((res) => {
                    console.log(res)
                    for (let item of res.data.list) {
                        item.create_time = moment(item.create_time)
                            .utcOffset('+08:00')
                            .format('YYYY-MM-DD HH:mm:ss')
                        formatList.value.push(item)
                    }

                    dataList.value = formatList.value
                    console.log(dataList.value, 'list')
                })
            })
    } catch (err) {
        console.log(err)
    }
}
// 跳转到预览页面

const previewCode = (item) => {
    if (iconMap.get(getSuffix(item.file_name))) {
        router.push(`/fileList/${item.file_name}/${item.hashcode}`)
    } else {
        notification.error({
            message: '抱歉',
            description: '此文件类型暂不支持预览',
        })
    }
}
// type
const iconMap = new Map([
    ['vue', 'Vue.svg'],
    ['py', 'Python.svg'],
    ['js', 'javascript.svg'],
    ['java', 'java.svg'],
    ['html', 'HTML.svg'],
    ['css', 'css.svg'],
    ['txt', 'TXT.svg'],
])
const getSuffix = (filename) => {
    let suffix = filename.split('.')[filename.split('.').length - 1]
    return suffix
}
const getImg = (filename) => {
    let suffix = getSuffix(filename)
    console.log(iconMap.get(suffix))
    let imgUrl
    if (iconMap.get(suffix)) {
        imgUrl = require('../assets/icon/' + iconMap.get(suffix))
    } else {
        imgUrl = require('../assets/icon/file.svg')
    }
    return imgUrl
}
</script>
<style scoped lang="less">
.unavailable {
    color: gray;
    &:hover {
        cursor: not-allowed;
    }
}
</style>
