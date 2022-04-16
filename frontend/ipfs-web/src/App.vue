<template>
    <a-layout v-if="login">
        <a-layout-sider
            v-model:collapsed="collapsed"
            :trigger="null"
            collapsible
        >
            <a-menu
                v-model:selectedKeys="selectedKeys"
                theme="dark"
                mode="inline"
            >
                <a-menu-item>
                    <div class="logo" v-if="!collapsed">
                        <span class="text"> IPFS代码共享平台</span>
                    </div>
                    <img
                        v-else
                        style="height: 50px; width: 50px; position:relative; right:15px"
                        src="./assets/icon/代码.png"

                        alt=""
                    />
                </a-menu-item>
                <a-menu-item key="1" @click="changeView">
                    <upload-outlined />
                    <span>上传文件</span>
                </a-menu-item>
                <a-menu-item key="2" @click="changeView">
                    <file-outlined />
                    <span>单个文件列表</span>
                </a-menu-item>
                <a-menu-item key="3" @click="changeView">
                    <folder-outlined />
                    <span>当前节点状态</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0">
                <menu-unfold-outlined
                    v-if="collapsed"
                    class="trigger"
                    @click="() => (collapsed = !collapsed)"
                />
                <menu-fold-outlined
                    v-else
                    class="trigger"
                    @click="() => (collapsed = !collapsed)"
                />
                <div class="user-info">
                    欢迎你，{{ username }}
                    <a
                        style="display: inline-block; padding-left: 10px"
                        @click="logout"
                        >退出登录</a
                    >
                </div>
            </a-layout-header>
            <a-layout-content
                :style="{
                    margin: '24px 16px',
                    padding: '24px',
                    background: '#fff',
                    minHeight: '280px',
                }"
            >
                <router-view></router-view>
            </a-layout-content>
        </a-layout>
    </a-layout>
    <LogPage @hasLogged="hasLogged" v-else />
</template>
<script setup>
import {
    FileOutlined,
    UploadOutlined,
    FolderOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons-vue'
import { nextTick, ref } from 'vue'
import router from './router'
import LogPage from './views/LogPage.vue'

// 登录状态判断
const login = ref(true)
if (localStorage.getItem('ipfsweb-token')) {
    login.value = true
} else {
    login.value = false
}
const hasLogged = () => {
    login.value = true
    username.value = localStorage.getItem('username')
}
router.push('/') // 回到首页
const logout = () => {
    login.value = false
    username.value = ''
}
// 用户信息
const username = ref('')
username.value = localStorage.getItem('username')
// 界面处理
const selectedKeys = ref(['1'])
const collapsed = ref(false)
const changeView = async () => {
    await nextTick()
    console.log(selectedKeys.value[0])
    switch (selectedKeys.value[0]) {
        case '1':
            router.push('/')
            break
        case '2':
            router.push('/fileList')
            break
        case '3':
            router.push('/folderList')
            break
        default:
            break
    }
}
</script>
<style lang="less">
html,
body,
#app,
.ant-layout {
    height: 100%;
}
#components-layout-demo-custom-trigger .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
    color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 16px;
}

.site-layout .site-layout-background {
    background: #fff;
}
.ant-layout {
    .ant-layout-header {
        padding-left: 16px !important;
        display: flex;
        justify-content: space-between;
        .trigger {
            margin-top: 25px;
        }
    }
    .user-info {
        padding-right: 30px;
    }
    .logo {
        height: 60px;
        .text {
            display: inline-block;
            margin-top: 16px;
            font-size: 18px;
            color: #d5e5f3;
            text-shadow: 0 0 1em #1890ff, 0 0 1em #5c5c5c;
        }
    }
}
</style>
