<template>
    <div class="about">
        <a-list item-layout="horizontal" :data-source="dataList">
            <template #renderItem="{ item }">
                <a-list-item>
                    <template #actions>
                        <a @click="openModal(item)">更新</a>
                        <a @click="downloadFile(item)">下载</a>
                        <a
                            :class="{ unavailable: item.new === 1 }"
                            @click="getHistory(item)"
                            >查看以往版本</a
                        >
                    </template>
                    <a-list-item-meta
                        :description="
                            '由' + item.user_name + '创建于' + item.create_time
                        "
                    >
                        <template #title>
                            <p>{{ item.file_name }}</p>
                        </template>
                        <template #avatar>
                            <a-avatar
                                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                            />
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
            title="以往版本"
            v-model:visible="historyVisible"
            @ok="closeHistory"
        >
            <a-list item-layout="horizontal" :data-source="historyList">
                <template #renderItem="{ item }">
                    <a-list-item>
                        <template #actions>
                            <a @click="downloadFile(item)">下载</a>
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
                                <p>{{ item.file_name }}</p>
                            </template>
                        </a-list-item-meta>
                    </a-list-item>
                </template>
            </a-list>
        </a-modal>
    </div>
</template>
<script setup>
import api from '@/api/axios'
import { ref } from '@vue/reactivity'
import download from 'downloadjs'
import * as ipfsClient from 'ipfs-http-client'
import moment from 'moment'
import { InboxOutlined } from '@ant-design/icons-vue'
import { getTime } from '@/utils/getTime'
// 配置ipfs，创建ipfs示例
const ipfs = ipfsClient.create({
    host: 'localhost',
    port: '5001',
    protocol: 'http',
}) // 连接本地的ipfs 后面可以连接远程的
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
            })
    } catch (err) {
        console.error(err)
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
</script>
<style scoped lang="less">
.unavailable {
    color: gray;
    &:hover {
        cursor: not-allowed;
    }
}
</style>
