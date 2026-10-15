<template>
  <div class="login-page">
    <div class="login-panel">
      <!-- 品牌区 -->
      <div class="brand-side">
        <div class="brand-content">
          <el-icon :size="56" color="#fff"><FirstAidKit /></el-icon>
          <h1>床旁信息系统</h1>
          <p>住院信息一键查询 · 用药检查及时提醒 · 健康宣教贴心陪伴</p>
          <div class="brand-features">
            <div class="feature-item"><el-icon><Notebook /></el-icon>医嘱费用透明可查</div>
            <div class="feature-item"><el-icon><DataAnalysis /></el-icon>体征数据实时同步</div>
            <div class="feature-item"><el-icon><Food /></el-icon>营养膳食在线点餐</div>
          </div>
        </div>
      </div>

      <!-- 登录表单 -->
      <div class="form-side">
        <h2 class="form-title">账号登录</h2>
        <p class="form-sub">请使用住院登记时预留的账号登录床旁终端</p>
        <el-form ref="formRef" :model="loginForm" :rules="loginRules" size="large" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入账号" :prefix-icon="User" autocomplete="username" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              autocomplete="current-password"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider>演示账号（点击快速填入）</el-divider>
        <div class="demo-accounts">
          <el-button v-for="acc in demoAccounts" :key="acc.username" plain @click="fillAccount(acc)">
            {{ acc.label }}
          </el-button>
        </div>
        <p class="login-tip">
          <el-icon><InfoFilled /></el-icon>
          医护/管理员账号请分别使用医护工作站与后台管理系统登录
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({ username: '', password: '' })

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不少于 6 位', trigger: 'blur' }
  ]
}

// 演示账号随数据通道自动切换：
// - mock 模式：使用本地模拟账号
// - 真实后端模式：使用后端种子数据中的账号（patient/sys_user 表）
//   家属账号见后端 db/family_account_seed.sql
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const demoAccounts = USE_MOCK
  ? [
      { label: '患者端演示', username: 'patient01', password: '123456' },
      { label: '家属端演示', username: 'family01', password: '123456' }
    ]
  : [
      { label: '患者端演示', username: 'chenxiaoming', password: '123456' },
      { label: '家属端演示', username: 'chendaming', password: '123456' }
    ]

function fillAccount(acc) {
  loginForm.username = acc.username
  loginForm.password = acc.password
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login({ ...loginForm })
    ElMessage.success(`欢迎您，${userStore.userInfo.realName}`)
    router.replace(route.query.redirect || '/')
  } catch {
    // 登录失败提示（1001 用户名或密码错误 / 1006 账号锁定 / 1003 非床旁终端角色等）
    // 已由 request.js 响应拦截器统一弹出，此处仅吞掉拒绝，避免产生未处理的 Promise 拒绝
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(160deg, #fdf0ea 0%, #faf6f2 45%, #eaf6f1 100%);
  padding: 24px;
}

.login-panel {
  display: flex;
  width: 880px;
  max-width: 96vw;
  min-height: 560px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(196, 148, 116, 0.25);
}

.brand-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(150deg, #e8734a 0%, #e88a5a 60%, #e6a37c 100%);
  color: #fff;
  padding: 40px;

  .brand-content {
    text-align: center;

    h1 {
      font-size: 30px;
      margin: 18px 0 10px;
      letter-spacing: 2px;
    }

    p {
      font-size: 15px;
      opacity: 0.92;
      line-height: 1.7;
      margin: 0 0 34px;
    }
  }

  .brand-features {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.16);
      padding: 10px 22px;
      border-radius: 24px;
      font-size: 15px;
      backdrop-filter: blur(4px);
    }
  }
}

.form-side {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 52px;

  .form-title {
    margin: 0 0 6px;
    font-size: 26px;
    color: #33414e;
  }

  .form-sub {
    margin: 0 0 28px;
    color: #8a99a8;
    font-size: 14px;
  }

  .login-btn {
    width: 100%;
    height: 46px;
    font-size: 17px;
    letter-spacing: 6px;
  }

  .demo-accounts {
    display: flex;
    gap: 12px;
    justify-content: center;

    .el-button {
      color: #e8734a;
      border-color: #f0b79d;
    }
  }

  .login-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 20px;
    font-size: 13px;
    color: #8a99a8;
  }
}

@media (max-width: 860px) {
  .brand-side {
    display: none;
  }
}
</style>
