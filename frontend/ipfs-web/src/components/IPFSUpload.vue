<template>
    <div>
        <p style="color: cornflowerblue; font-size: 26px; margin-bottom: 10px">
            选择单个文件上传
        </p>
        <input
            type="file"
            value=""
            id="file"
            @change="uploadFile"
            style="margin-left: 60px"
        />
        <button @click="submit">确定</button>
        <p
            style="
                color: cornflowerblue;
                font-size: 26px;
                margin-top: 30px;
                margin-bottom: 10px;
            "
        >
            文件夹?点击这里上传
        </p>
        <input
            type="file"
            value=""
            id="file"
            @change="uploadFolder"
            style="margin-left: 60px"
            webkitdirectory
            multiple
        />
        <button>确定</button>
        <p
            style="
                color: cornflowerblue;
                font-size: 26px;
                margin-top: 30px;
                margin-bottom: 10px;
            "
        >
            如要更新文件请到文件列表目录下更新！
        </p>
    </div>
</template>

<script setup>
import * as ipfsClient from 'ipfs-http-client'
import api from '@/api/axios'
import all from 'it-all'
import { uuid } from '@/utils/uuid';
import { getTime } from '@/utils/getTime';
// import download from 'downloadjs'
const ipfs = ipfsClient.create({
    host: 'localhost',
    port: '5001',
    protocol: 'http',
}) // 连接本地的ipfs 后面可以连接远程的
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
let file
let fileName
const uploadFile = (e) => {
    file = e.target.files[0]
    fileName = e.target.files[0].name
}
const submit = async () => {
    try {
        const added = await ipfs.add(file, {
            progress: (prog) => console.log(`received: ${prog}`),
        })
        let hashCode = added.cid.toString()
        console.log('this is hashcode', hashCode)
        // for await (const chunk of ipfs.cat(hashCode)) {
        //     const blob = new Blob([new Uint8Array(chunk)])
        //     download(blob, fileName)
        // }

        // 单个文件status为0， 文件夹为1
        api.post('/', {
            hashcode: hashCode,
            status: '0',
            createTime: getTime(),
            filename: fileName,
            username: 'YonghaoMei',
            uid: uuid(8,16),
            new: '1',
            last: '1'
        }).then((res) => {
            console.log(res)
            file = null
            fileName = null
        })
    } catch (err) {
        console.error(err)
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
const uploadFolder = async (e) => {
    const { files } = e.target
    const filterFiles = normalizeFiles(files)
    const souceFile = filterFiles
        .filter(($) => !IGNORED_FILES.includes($.path))
        .map(($) => ($.path[0] === '/' ? { ...$, path: $.path.slice(1) } : $))

    const result = await all(
        ipfs.addAll(souceFile, {
            pin: false,
            wrapWithDirectory: false,
        })
    )
    ipfs.addAll(souceFile, {
        pin: false,
        wrapWithDirectory: false,
    })
    console.log(result, '文件夹地址')
    console.log(result[result.length - 1].cid.toString(), '根路径地址')
}
</script>

<style></style>
