<template>
  <a-layout>
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
      <div class="logo" />
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="1" @click="changeView">
          <user-outlined />
          <span>上传文件</span>
        </a-menu-item>
        <a-menu-item key="2" @click="changeView">
          <video-camera-outlined />
          <span>单个文件列表</span>
        </a-menu-item>
        <a-menu-item key="3" @click="changeView">
          <upload-outlined />
          <span>文件夹列表</span>
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
        <menu-fold-outlined v-else class="trigger" @click="() => (collapsed = !collapsed)" />
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <router-view></router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { UserOutlined, VideoCameraOutlined, UploadOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import { nextTick, ref } from 'vue';
import router from './router';

router.push('/') // 回到首页
const selectedKeys = ref(['1'])
const collapsed = ref(false)
const changeView = async () => {
  await nextTick()
  console.log(selectedKeys.value[0]);
  switch (selectedKeys.value[0]) {
    case '1':
      router.push('/')
      break;
    case '2':
      router.push('/fileList')
      break;
      case '3':
      router.push('/folderList')
      break;
    default:
      break;
  }
}
</script>
<style lang="less">
html,body,#app,.ant-layout{
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
    .trigger {
      margin-top:25px;
    }
  }
  .logo {
    height: 40px;
  }
}

</style>