<template>
    <div class="home">
        <div v-if="!isReg" class="log">
            <span class="title">登录</span>
            <input
                class="data"
                type="text"
                v-model="username"
                placeholder="账号"
            />
            <input
                class="data"
                type="password"
                v-model="pass"
                placeholder="密码"
            />
            <input
                class="data"
                type="text"
                v-model="code"
                placeholder="验证码"
            />
            <span
                class="captcha"
                @click="getCaptcha"
                v-html="captchaHtml"
            ></span>
            <div class="option">
                <button @click="login" style="cursor: pointer">点击登录</button>
                <span style="display: block; padding: 20px"
                    >没有账号? <a @click="goRegister">去注册</a></span
                >
            </div>
        </div>
        <div v-else class="log">
            <span class="title">注册</span>
            <input
                class="data"
                type="text"
                v-model="username_reg"
                placeholder="账号"
            />
            <input
                class="data"
                type="password"
                v-model="pass_reg"
                placeholder="密码"
            />
            <input
                class="data"
                type="password"
                v-model="pass2_reg"
                placeholder="确认密码"
            />
            <div class="option">
                <button style="cursor: pointer; margin: 30px" @click="register">
                    点击注册
                </button>
                <span style="display: block"
                    >已经有账号? <a @click="goLogin">去登录</a></span
                >
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref } from '@vue/reactivity'
import api from '@/api/axios'
import { notification } from 'ant-design-vue'
import { defineEmits } from 'vue'
const emit = defineEmits(['login'])

// 清空过期的token和username
localStorage.removeItem('username')
localStorage.removeItem('ipfsweb-token')

// 注册
const goRegister = () => {
    isReg.value = true
}
const isReg = ref(false)
const username_reg = ref()
const pass_reg = ref()
const pass2_reg = ref()

const register = async () => {
    await api
        .post('/reg', {
            username: username_reg.value,
            pass: pass_reg.value,
            pass2: pass2_reg.value,
        })
        .then(async (res) => {
            console.log(res)
            if (res.data.code === '200') {
                // 注册成功，跳转登录界面
                notification.open({
                    message: '注册成功！',
                    description: '快去登录吧~',
                })
                isReg.value = false
            } else {
                notification.error({
                    message: '错误',
                    description: res.data.msg,
                })
            }
        })
}

// 登录
// 获取验证码
const goLogin = () => {
    isReg.value = false
}
const captchaHtml = ref()
const getCaptcha = async () => {
    await api.get('/logincode').then((res) => {
        captchaHtml.value = res.data
    })
}
if (!isReg.value) {
    getCaptcha()
}

const username = ref()
const pass = ref()
const code = ref()
// 登录并设置token
const login = async () => {
    try {
        await api
            .post('/login', {
                username: username.value,
                pass: pass.value,
                code: code.value,
            })
            .then((res) => {
                if (res.data.code === '200') {
                    console.log(res)
                    localStorage.setItem('ipfsweb-token', res.data.token)
                    localStorage.setItem('username', res.data.username)
                    emit('hasLogged')
                } else {
                    notification.error({
                        message: '错误',
                        description: res.data.msg,
                    })
                    getCaptcha()
                }
            })
    } catch (err) {
        console.log(err)
    }
    //
}
</script>
<style lang="less" scoped>
.home {
    height: 100vh;
    width: 100vw;
    position: relative;
    background-image: url(../assets/back-img.png);
}
.log {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -200px;
    margin-top: -240px;
    padding-top: 20px;
    display: grid;
    background-color: rgba(248, 248, 248, 0.6);
    border-radius: 10px;
    height: 480px;
    width: 400px;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(6, 1fr);
    .title {
        display: block;
        grid-column: 2 / 5;
        align-items: center;
        justify-items: center;
        font-family: 'STHupo';
        font-size: 40px;
        margin-top: 10px;
    }
    .data {
        margin-top: 30px;
        height: 30px;
        display: block;
        display: block;
        grid-column: 2 / 5;
        align-items: center;
        justify-items: center;
        border-radius: 10px;
    }
    .captcha {
        display: block;
        display: block;
        grid-column: 2 / 5;
        align-items: center;
        justify-items: center;
    }
    .option {
        display: block;
        display: block;
        grid-column: 2 / 5;
        align-items: center;
        justify-items: center;
    }
}
</style>
