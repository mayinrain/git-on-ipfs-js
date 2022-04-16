<template>
  <div>
      这个页面显示的是文件夹列表
  </div>
</template>

<script setup>
import * as ipfsClient from 'ipfs-http-client'
import { config } from '@/utils/ipfs-config'
// 配置ipfs，创建ipfs示例
const ipfs = ipfsClient.create(config) // 连接本地的ipfs 后面可以连接远程的
  ipfs.swarm.peers().then((res)=>{
    console.log(res);
  })
  const multiAddrs = await ipfs.swarm.localAddrs()
for(let addr of multiAddrs){
  console.log(addr.bytes.toString());
}
</script>

<style>

</style>