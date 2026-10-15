/**
 * 统一请求封装
 *
 * 职责：
 * 1. 统一 baseURL、超时时间
 * 2. 请求拦截：自动携带 Token（与后端 Spring Security/JWT 约定 Header）
 * 3. 响应拦截：统一处理业务响应码（code=200 成功）、401 未认证、403 越权、500 服务异常
 * 4. Mock 适配：VITE_USE_MOCK=true 时拦截到本地模拟数据，接口契约与真实后端一致，
 *    后续对接真实 API 只需将 .env 中 VITE_USE_MOCK 置为 false
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, clearAuth } from './auth'
import { mockRequest } from '@/mock'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const BASE_API = import.meta.env.VITE_BASE_API || '/api'

// 业务响应码（与后端 Result 封装约定）
const RESPONSE_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403
}

// 创建 axios 实例
const service = axios.create({
  baseURL: BASE_API,
  timeout: 15000
})

// ---------- 请求拦截器：注入令牌 ----------
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------- 响应拦截器：统一解包与错误处理 ----------
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 非标准结构（如文件流）直接返回
    if (res === null || typeof res !== 'object' || !('code' in res)) {
      return res
    }
    if (res.code !== RESPONSE_CODE.SUCCESS) {
      handleBizError(res)
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res.data
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === RESPONSE_CODE.UNAUTHORIZED) {
        handleUnauthorized()
      } else if (status === RESPONSE_CODE.FORBIDDEN) {
        ElMessage.error('无权访问该功能')
      } else {
        ElMessage.error(error.response.data?.msg || `服务异常(${status})，请稍后重试`)
      }
    } else {
      ElMessage.error('网络连接异常，请检查网络后重试')
    }
    return Promise.reject(error)
  }
)

function handleBizError(res) {
  if (res.code === RESPONSE_CODE.UNAUTHORIZED) {
    handleUnauthorized()
  } else if (res.code === RESPONSE_CODE.FORBIDDEN) {
    ElMessage.error('无权访问该功能')
  } else {
    ElMessage.error(res.msg || '操作失败，请稍后重试')
  }
}

/** 令牌失效：清除本地凭证并跳转登录页（记录回跳地址；惰性加载 router 避免循环依赖） */
function handleUnauthorized() {
  ElMessage.error('登录状态已失效，请重新登录')
  clearAuth()
  import('@/router').then(({ default: router }) => {
    const current = router.currentRoute.value
    if (current.path !== '/login') {
      router.replace({ path: '/login', query: { redirect: current.fullPath } })
    }
  })
}

/**
 * 统一请求入口
 * Mock 模式下走本地模拟数据（同样执行令牌校验、模拟网络延迟），
 * 保证前端工程在无后端环境下可完整运行与演示。
 */
export function request(config) {
  if (USE_MOCK) {
    return mockRequest(config)
  }
  return service(config)
}

export default request
