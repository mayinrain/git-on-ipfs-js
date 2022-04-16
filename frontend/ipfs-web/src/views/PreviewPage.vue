<template>
    <div style="height: 100%">
        <div class="title">
            <a class="back-to-list" @click="backToList">返回列表</a> <span class="name">{{ filename }}</span>
        </div>
        <pre
            style="height: 100%"
        ><code :class="'language-'+type" v-html="Prism.highlight(formatContent, Prism.languages[type], type)"></code></pre>
    </div>
</template>
<script setup>
import { config } from '@/utils/ipfs-config'
import { ref } from '@vue/reactivity'
import * as ipfsClient from 'ipfs-http-client'
import router from '../router'
import Prism from 'prismjs'
import { onMounted } from '@vue/runtime-core'
// 配置ipfs，创建ipfs示例
const ipfs = ipfsClient.create(config)
const formatContent = ref('')
const content = ref()
const hash = router.currentRoute.value.params.hash
const filename = router.currentRoute.value.params.filename
// console.log(filename.split('.')[filename.split('.').length - 1], 'suffix');
const suffixMap = new Map([
    ['js', 'javascript'],
    ['vue', 'html'],
    ['css', 'css'],
    ['java', 'java'],
    ['py', 'py'],
    ['html', 'html'],
    ['txt', 'html'],
])
const suffix = filename.split('.')[filename.split('.').length - 1]
const type = suffixMap.get(suffix)
// 中文乱码问题
function Utf8ArrayToStr(array) {
    var out, i, len, c
    var char2, char3

    out = ''
    len = array.length
    i = 0
    while (i < len) {
        c = array[i++]
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c)
                break
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++]
                out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f))
                break
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++]
                char3 = array[i++]
                out += String.fromCharCode(
                    ((c & 0x0f) << 12) |
                        ((char2 & 0x3f) << 6) |
                        ((char3 & 0x3f) << 0)
                )
                break
        }
    }

    return out
}
const getContent = async () => {
    for await (const chunk of ipfs.cat(hash)) {
        content.value = chunk
    }
    formatContent.value = Utf8ArrayToStr(content.value)
}
getContent()
onMounted(() => {
    setTimeout(() => {
        Prism.highlightAll()
    }, 0)
})
// 返回列表
const backToList = () => {
    router.push({name:'fileList', params:{
        page: current.value
    }})
    
}
console.log(router.currentRoute.value.query.page);
const current = ref()
current.value = router.currentRoute.value.query.page
</script>
<style scoped lang="less">
.title {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    .back-to-list {
        grid-column: 1fr;
        text-align: left;
    }
    .name {
        grid-column: 1fr ;
        font-size: 18px;
        color:#ffffff;
        text-shadow:0px 1px 0px #c0c0c0,
        0px 2px 0px #b0b0b0,
        0px 3px 0px #a0a0a0,
        0px 4px 0px #909090,
        0px 5px 10px rgba(0, 0, 0, .9);
    }
}
</style>
