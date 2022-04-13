<template>
    <div>
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
            <p class="ant-upload-text">上传单个文件</p>
            <p class="ant-upload-hint">
                如需更新已有文件，请到单个文件列表中选择更新
            </p>
        </a-upload-dragger>
        <a-button
            type="primary"
            :disable="fileList.length"
            :loading="uploading"
            @click="confirmUpload"
            style="margin-top: 30px; margin-bottom: 20px"
            >{{ uploading ? '上传中' : '开始上传' }}</a-button
        >
        <div class="upload-folder">
            <p class="icon">
                <inbox-outlined></inbox-outlined>
            </p>
            <p class="text">上传文件夹</p>
            <p class="hint">如需更新已有文件夹，请到文件夹列表中选择更新</p>
            <input
                type="file"
                @change="uploadFolder"
                webkitdirectory
                multiple
                ref="folder"
            />
        </div>

        <a-button
            type="primary"
            :disable="souceFile.length"
            :loading="uploading"
            @click="confirm"
            style="margin-top: 30px; margin-bottom: 20px"
            >{{ uploading ? '上传中' : '开始上传' }}</a-button
        >
    </div>
</template>

<script setup>
import * as ipfsClient from 'ipfs-http-client'
import api from '@/api/axios'
import all from 'it-all'
import { uuid } from '@/utils/uuid'
import { getTime } from '@/utils/getTime'
import { config } from '@/utils/ipfs-config'
import { ref } from 'vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
// import download from 'downloadjs'
const ipfs = ipfsClient.create(config) // 连接本地的ipfs 后面可以连接远程的
// const Utf8ArrayToStr = (array) => {
//     var out, i, len, c
//     var char2, char3
//     out = ''
//     len = array.length
//     i = 0
//     while (i < len) {
//         c = array[i++]
//         switch (c >> 4) {
//             case 0:
//             case 1:
//             case 2:
//             case 3:
//             case 4:
//             case 5:
//             case 6:
//             case 7:
//                 // 0xxxxxxx
//                 out += String.fromCharCode(c)
//                 break
//             case 12:
//             case 13:
//                 // 110x xxxx   10xx xxxx
//                 char2 = array[i++]
//                 out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
//                 break
//             case 14:
//                 // 1110 xxxx  10xx xxxx  10xx xxxx
//                 char2 = array[i++]
//                 char3 = array[i++]
//                 out += String.fromCharCode(
//                     ((c & 0x0f) << 12) |
//                         ((char2 & 0x3f) << 6) |
//                         ((char3 & 0x3f) << 0)
//                 )
//                 break
//             default:
//                 break
//         }
//     }
//     return out
// }

// 上传单个文件
const fileList = ref([])
const fileName = ref()
const uploading = ref(false)
const beforeUpload = () => {
    return false
}
const handleChange = () => {
    if (fileList.value.length > 1) {
        fileList.value.splice(0, 1)
    }
    fileName.value = fileList.value[0].name
}
const confirmUpload = async () => {
    try {
        uploading.value = true
        const added = await ipfs.add(fileList.value[0].originFileObj, {
            progress: (prog) => console.log(`received: ${prog}`),
        })
        let hashCode = added.cid.toString()
        console.log('this is hashcode', hashCode)
        // for await (const chunk of ipfs.cat(hashCode)) {
        //     const blob = new Blob([new Uint8Array(chunk)])
        //     download(blob, fileName)
        // }

        // status 1 表示为目前使用版本
        api.post('/', {
            hashcode: hashCode,
            status: '0',
            createTime: getTime(),
            filename: fileName.value,
            username: 'YonghaoMei',
            uid: uuid(8, 16),
            new: '1',
            last: '1'
            // cate: '0', //0为file 1为folder
        }).then((res) => {
            console.log(res)
            uploading.value = false
            fileList.value = []
            fileName.value = ''
            notification.open({
                message: '上传成功啦',
                description: '点击单个文件列表查看已上传文件',
            })
        })
    } catch (err) {
        console.error(err)
        uploading.value = false
        fileList.value = []
        fileName.value = ''
        notification.open({
            message: '上传失败:(',
            description: '请检查ipfs是否启动或者当前网络情况',
        })
    }
}
// 上传文件夹
const IGNORED_FILES = ['.DS_Store', 'thumbs.db', 'desktop.ini']
function normalizeFiles(files) {
    const streams = []
    for (const file of files) {
        streams.push({
            path: file.filepath || file.webkitRelativePath || file.name,
            content: file,
            size: file.size,
        })
    }
    return streams
}
const souceFile = ref([])
const folder = ref(null)
const uploadFolder = (e) => {
    const { files } = e.target
    const filterFiles = normalizeFiles(files)
    souceFile.value = filterFiles
        .filter(($) => !IGNORED_FILES.includes($.path))
        .map(($) => ($.path[0] === '/' ? { ...$, path: $.path.slice(1) } : $))
}
const confirm = async () => {
    try {
        uploading.value = true
        const result = await all(
            ipfs.addAll(souceFile.value, {
                pin: false,
                wrapWithDirectory: false,
            })
        )
        console.log(result, '文件夹地址')
        console.log(result[result.length - 1].cid.toString(), '根路径地址')
    } catch (err) {
        uploading.value = false
        folder.value.value = null
        console.log(err)
    }

    uploading.value = false
    folder.value.value = null
}
</script>

<style lang="less" scoped>
.upload-folder {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    background: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
    transition: border-color 0.3s;
    padding: 16px 0px;
    .icon {
        color: #40a9ff;
        font-size: 48px;
        margin-bottom: 20px;
        height: 48px;
        .anction {
            vertical-align: 0px !important;
        }
    }
    .text {
        margin: 0 0 4px;
        color: rgba(0, 0, 0, 0.85);
        font-size: 16px;
    }
    .hint {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
    }
}
</style>
