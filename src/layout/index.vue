<template>
  <el-container class="app-layout">
    <!-- 侧边导航 -->
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="app-aside">
      <div class="logo-area">
        <el-icon :size="28" color="#fff"><FirstAidKit /></el-icon>
        <span v-show="!appStore.sidebarCollapsed" class="logo-text">床旁信息系统</span>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        background-color="#FFFFFF"
        text-color="#5A6B7D"
        active-text-color="#E8734A"
        router
      >
        <el-menu-item v-for="item in menuRoutes" :key="item.path" :index="`/${item.path}`">
          <el-icon><component :is="item.meta.icon" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
      <div class="collapse-btn" @click="appStore.toggleSidebar()">
        <el-icon><component :is="appStore.sidebarCollapsed ? 'Expand' : 'Fold'" /></el-icon>
      </div>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="app-header" height="64px">
        <div class="header-left">
          <h2 class="page-title">{{ route.meta.title }}</h2>
        </div>
        <div class="header-right">
          <!-- 患者上下文 -->
          <div v-if="userStore.patientContext" class="patient-chip">
            <el-icon color="#E8734A"><User /></el-icon>
            <span class="patient-name">{{ userStore.patientContext.name }}</span>
            <span class="patient-bed">{{ userStore.patientContext.wardName }} · {{ userStore.patientContext.bedLabel }}床</span>
          </div>
          <!-- 实时时钟 -->
          <div class="clock">
            <el-icon><Clock /></el-icon>
            <span>{{ currentTime }}</span>
          </div>
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-entry">
              <el-avatar :size="34" class="user-avatar">{{ userStore.userInfo?.realName?.charAt(0) }}</el-avatar>
              <span class="user-name">{{ userStore.userInfo?.realName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  {{ roleLabel }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { getLabel } from '@/dict'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 根据角色过滤菜单（权限矩阵）
const menuRoutes = computed(() => {
  const parent = router.options.routes.find((r) => r.path === '/')
  return (parent?.children || []).filter(
    (c) => !c.meta?.roles || c.meta.roles.includes(userStore.roleType)
  )
})

const roleLabel = computed(() => getLabel('roleType', userStore.roleType))

// 实时时钟（床旁终端场景）
const currentTime = ref('')
let timer = null
function updateClock() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  currentTime.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 30000)
  appStore.loadNotices()
})
onUnmounted(() => clearInterval(timer))

async function handleCommand(command) {
  if (command === 'logout') {
    await userStore.logout()
    router.replace('/login')
  }
}
</script>

<style lang="scss" scoped>
$primary: #e8734a;

.app-layout {
  height: 100vh;
}

.app-aside {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #efe7df;
  transition: width 0.25s;

  .logo-area {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 64px;
    background: linear-gradient(135deg, #e8734a, #f2926b);
    color: #fff;
    flex-shrink: 0;

    .logo-text {
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 1px;
      white-space: nowrap;
    }
  }

  .el-menu {
    flex: 1;
    overflow-y: auto;
    padding: 8px 6px;

    :deep(.el-menu-item) {
      border-radius: 8px;
      margin: 4px 0;
      height: 48px;

      &.is-active {
        background: #fdf0ea;
        font-weight: 600;
      }
    }
  }

  .collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    cursor: pointer;
    color: #8a99a8;
    border-top: 1px solid #efe7df;

    &:hover {
      color: $primary;
    }
  }
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #efe7df;

  .page-title {
    margin: 0;
    font-size: 19px;
    color: #33414e;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .patient-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: #fdf0ea;
    border-radius: 20px;
    font-size: 14px;

    .patient-name {
      font-weight: 600;
      color: #33414e;
    }

    .patient-bed {
      color: #8a99a8;
      font-size: 13px;
    }
  }

  .clock {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #5a6b7d;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }

  .user-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    outline: none;

    .user-avatar {
      background: linear-gradient(135deg, #e8734a, #f2926b);
      color: #fff;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      color: #33414e;
    }
  }
}

.app-main {
  background: #faf6f2;
  overflow-y: auto;
  padding: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
