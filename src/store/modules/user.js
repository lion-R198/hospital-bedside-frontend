/**
 * 用户状态管理
 * 职责：登录/退出、令牌与用户信息持久化、当前患者上下文（数据权限锚点）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getPatientContext } from '@/api/auth'
import { getToken, setToken, getUserInfo, setUserInfo, clearAuth } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const userInfo = ref(getUserInfo())
  // 当前患者上下文（患者本人或家属关联患者），所有业务数据以该患者为锚点
  const patientContext = ref(null)

  // 角色类型：1患者 2家属 3医生 4护士 5系统管理员（与 sys_user.role_type 对齐）
  const roleType = computed(() => userInfo.value?.roleType ?? null)
  const isLoggedIn = computed(() => Boolean(token.value))
  const welcomeName = computed(() => {
    if (!userInfo.value) return ''
    const roleLabel = { 1: '', 2: '家属', 5: '管理员' }[roleType.value] || ''
    return `${userInfo.value.realName}${roleLabel}`
  })

  /** 登录：获取令牌与用户信息，并拉取患者上下文 */
  async function login(loginForm) {
    const data = await loginApi(loginForm)
    token.value = data.token
    userInfo.value = data.userInfo
    setToken(data.token)
    setUserInfo(data.userInfo)
    // 登录后加载患者上下文（患者/家属角色必需）
    if ([1, 2].includes(data.userInfo.roleType)) {
      patientContext.value = await getPatientContext()
    }
    return data
  }

  /** 退出登录：通知后端吊销令牌并清理本地凭证 */
  async function logout() {
    try {
      if (token.value) await logoutApi()
    } catch {
      // 后端登出失败不阻断本地清理
    }
    token.value = ''
    userInfo.value = null
    patientContext.value = null
    clearAuth()
  }

  return { token, userInfo, patientContext, roleType, isLoggedIn, welcomeName, login, logout }
})
