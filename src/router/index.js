/**
 * 路由配置与守卫
 *
 * 权限模型（对齐需求说明书 3.2 权限矩阵）：
 * - 床旁终端仅面向患者(1)与家属(2)；
 * - 医生(3)/护士(4)/管理员(5)分别使用医护工作站/后台管理系统登录，
 *   登录接口与路由守卫双重拦截。
 */
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getToken, getUserInfo } from '@/utils/auth'
import Layout from '@/layout/index.vue'

// 允许访问床旁终端的角色：患者 / 家属
export const TERMINAL_ROLES = [1, 2]

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled', roles: TERMINAL_ROLES }
      },
      {
        path: 'patient',
        name: 'PatientInfo',
        component: () => import('@/views/patient/index.vue'),
        meta: { title: '患者信息', icon: 'User', roles: TERMINAL_ROLES }
      },
      {
        path: 'order',
        name: 'MedicalOrder',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '我的医嘱', icon: 'Notebook', roles: TERMINAL_ROLES }
      },
      {
        path: 'vital',
        name: 'VitalSigns',
        component: () => import('@/views/vital/index.vue'),
        meta: { title: '体征数据', icon: 'DataAnalysis', roles: TERMINAL_ROLES }
      },
      {
        path: 'fee',
        name: 'FeeList',
        component: () => import('@/views/fee/index.vue'),
        meta: { title: '费用清单', icon: 'Wallet', roles: TERMINAL_ROLES }
      },
      {
        path: 'diet',
        name: 'DietAdvice',
        component: () => import('@/views/diet/index.vue'),
        meta: { title: '饮食建议', icon: 'Food', roles: TERMINAL_ROLES }
      },
      {
        path: 'staff',
        name: 'MyStaff',
        component: () => import('@/views/staff/index.vue'),
        meta: { title: '我的医护', icon: 'Avatar', roles: TERMINAL_ROLES }
      },
      {
        path: 'hospital',
        name: 'HospitalIntro',
        component: () => import('@/views/hospital/index.vue'),
        meta: { title: '医院介绍', icon: 'OfficeBuilding', roles: TERMINAL_ROLES }
      },
      {
        path: 'education',
        name: 'HealthEducation',
        component: () => import('@/views/education/index.vue'),
        meta: { title: '健康宣教', icon: 'Reading', roles: TERMINAL_ROLES }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

// 免登录白名单
const WHITE_LIST = ['/login']

router.beforeEach(async (to) => {
  document.title = to.meta.title ? `${to.meta.title} - 床旁信息系统` : '床旁信息系统'

  const token = getToken()
  const userInfo = getUserInfo()

  // 1. 未登录：仅允许白名单页面
  if (!token) {
    if (WHITE_LIST.includes(to.path)) return true
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 2. 已登录访问登录页 → 回首页
  if (to.path === '/login') {
    return { path: '/' }
  }

  // 3. 角色越权拦截（本地凭证中的角色 + 路由 meta.roles）
  if (to.meta?.roles && userInfo) {
    if (!to.meta.roles.includes(userInfo.roleType)) {
      ElMessage.error('当前账号无权访问床旁终端，请使用患者或家属账号登录')
      return { path: '/login' }
    }
  }
  return true
})

export default router
