/**
 * 应用全局状态
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getNoticeList } from '@/api/notice'

export const useAppStore = defineStore('app', () => {
  // 侧边栏折叠
  const sidebarCollapsed = ref(false)
  // 病区通知公告（首页与顶部轮播共用）
  const notices = ref([])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  async function loadNotices() {
    if (notices.value.length > 0) return notices.value
    notices.value = await getNoticeList()
    return notices.value
  }

  return { sidebarCollapsed, notices, toggleSidebar, loadNotices }
})
