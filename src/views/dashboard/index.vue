<template>
  <div class="page-container">
    <!-- 问候与患者概要 -->
    <div class="greeting-card app-card">
      <div class="greeting-left">
        <h2 class="greeting-title">{{ greetingText }}，{{ userStore.welcomeName }}</h2>
        <p class="greeting-sub">
          {{ patientInfo.name }} · {{ patientInfo.departmentName }} · {{ patientInfo.wardName }} ·
          {{ patientInfo.bedLabel }}床 · 入院第 {{ admittedDays }} 天
        </p>
      </div>
      <div class="greeting-right">
        <el-tag type="success" size="large" effect="light">在院</el-tag>
      </div>
    </div>

    <!-- 今日概览 -->
    <div class="overview-grid">
      <div class="app-card overview-card">
        <div class="overview-icon" style="background: #fdf0ea; color: #e8734a">
          <el-icon :size="26"><Odometer /></el-icon>
        </div>
        <div>
          <p class="overview-label">最新体温（{{ formatDateTime(summary.latestVital?.measureTime) }}）</p>
          <p class="overview-value">
            {{ summary.latestVital?.temperature ?? '-' }} <small>℃</small>
          </p>
        </div>
      </div>
      <div class="app-card overview-card">
        <div class="overview-icon" style="background: #eaf6f1; color: #3fa37c">
          <el-icon :size="26"><Wallet /></el-icon>
        </div>
        <div>
          <p class="overview-label">预缴余额</p>
          <p class="overview-value" :class="{ 'text-danger': summary.lowBalanceWarn }">
            {{ formatMoney(summary.balance) }}
          </p>
        </div>
      </div>
      <div class="app-card overview-card">
        <div class="overview-icon" style="background: #fdf6ea; color: #e6a23c">
          <el-icon :size="26"><Tickets /></el-icon>
        </div>
        <div>
          <p class="overview-label">住院总费用</p>
          <p class="overview-value">{{ formatMoney(summary.totalFee) }}</p>
        </div>
      </div>
      <div class="app-card overview-card">
        <div class="overview-icon" style="background: #eef1fd; color: #7c8ca0">
          <el-icon :size="26"><AlarmClock /></el-icon>
        </div>
        <div>
          <p class="overview-label">今日待办</p>
          <p class="overview-value">{{ summary.todos?.length ?? 0 }} <small>项</small></p>
        </div>
      </div>
    </div>

    <el-row :gutter="16">
      <!-- 待办提醒 -->
      <el-col :span="14">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />今日待办提醒</h3>
          <el-empty v-if="!summary.todos?.length" description="今日暂无待办事项" :image-size="80" />
          <div v-else class="todo-list">
            <div v-for="(todo, idx) in summary.todos" :key="idx" class="todo-item">
              <div class="todo-time">
                <el-icon><Clock /></el-icon>
                {{ todo.time || '全天' }}
              </div>
              <el-tag :type="todo.type === 'order' ? 'warning' : 'success'" size="small">
                {{ todo.typeLabel }}
              </el-tag>
              <span class="todo-title">{{ todo.title }}</span>
              <el-tag v-if="todo.status === 0" type="danger" size="small" effect="plain">待执行</el-tag>
              <el-tag v-else type="primary" size="small" effect="plain">进行中</el-tag>
            </div>
          </div>
          <p class="todo-tip">
            <el-icon><InfoFilled /></el-icon>
            请按医嘱时间配合治疗；如有疑问请呼叫责任护士
          </p>
        </div>
      </el-col>

      <!-- 通知公告 -->
      <el-col :span="10">
        <div class="app-card">
          <h3 class="card-title">
            <span class="card-title-bar" />通知公告
            <span class="card-title-extra">{{ appStore.notices.length }} 条</span>
          </h3>
          <div class="notice-list">
            <div v-for="notice in appStore.notices" :key="notice.id" class="notice-item" @click="openNotice(notice)">
              <el-tag :type="getTag('noticeType', notice.noticeType)" size="small">
                {{ getLabel('noticeType', notice.noticeType) }}
              </el-tag>
              <span class="notice-title">{{ notice.title }}</span>
              <span class="notice-date">{{ formatDate(notice.publishTime) }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <div class="app-card">
      <h3 class="card-title"><span class="card-title-bar" />快捷入口</h3>
      <div class="quick-grid">
        <div v-for="entry in quickEntries" :key="entry.path" class="quick-item" @click="$router.push(entry.path)">
          <div class="quick-icon" :style="{ background: entry.bg, color: entry.color }">
            <el-icon :size="28"><component :is="entry.icon" /></el-icon>
          </div>
          <span class="quick-name">{{ entry.title }}</span>
        </div>
      </div>
    </div>

    <!-- 公告详情弹窗 -->
    <el-dialog v-model="noticeVisible" :title="currentNotice?.title" width="560px">
      <div class="notice-meta">
        <el-tag :type="getTag('noticeType', currentNotice?.noticeType)" size="small">
          {{ getLabel('noticeType', currentNotice?.noticeType) }}
        </el-tag>
        <span>{{ formatDateTime(currentNotice?.publishTime) }}</span>
      </div>
      <p class="notice-content">{{ currentNotice?.content }}</p>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { getHomeSummary } from '@/api/home'
import { getPatientInfo } from '@/api/patient'
import { formatDate, formatDateTime, formatMoney } from '@/utils/format'
import { getLabel, getTag } from '@/dict'

const userStore = useUserStore()
const appStore = useAppStore()

const summary = reactive({ latestVital: null, totalFee: 0, balance: 0, todos: [], lowBalanceWarn: false })
const patientInfo = ref({})
const noticeVisible = ref(false)
const currentNotice = ref(null)

const greetingText = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const admittedDays = computed(() => {
  if (!patientInfo.value.admissionDate) return '-'
  const diff = Date.now() - new Date(patientInfo.value.admissionDate).getTime()
  return Math.max(1, Math.ceil(diff / 86400000))
})

const quickEntries = [
  { path: '/order', title: '我的医嘱', icon: 'Notebook', bg: '#fdf0ea', color: '#e8734a' },
  { path: '/vital', title: '体征数据', icon: 'DataAnalysis', bg: '#eaf6f1', color: '#3fa37c' },
  { path: '/fee', title: '费用清单', icon: 'Wallet', bg: '#fdf6ea', color: '#e6a23c' },
  { path: '/diet', title: '饮食建议', icon: 'Food', bg: '#eef8ec', color: '#67a845' },
  { path: '/staff', title: '我的医护', icon: 'Avatar', bg: '#eef1fd', color: '#6b7cc4' },
  { path: '/education', title: '健康宣教', icon: 'Reading', bg: '#fdf0ea', color: '#d97b8c' }
]

function openNotice(notice) {
  currentNotice.value = notice
  noticeVisible.value = true
}

onMounted(async () => {
  appStore.loadNotices()
  const [summaryData, patientData] = await Promise.all([getHomeSummary(), getPatientInfo()])
  Object.assign(summary, summaryData)
  patientInfo.value = patientData
})
</script>

<style lang="scss" scoped>
.greeting-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(120deg, #fff 55%, #fdf0ea);
}

.greeting-title {
  margin: 0 0 8px;
  font-size: 22px;
  color: #33414e;
}

.greeting-sub {
  margin: 0;
  color: #8a99a8;
  font-size: 15px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 !important;

  .overview-icon {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .overview-label {
    margin: 0 0 4px;
    font-size: 13px;
    color: #8a99a8;
  }

  .overview-value {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #33414e;
    font-variant-numeric: tabular-nums;

    small {
      font-size: 13px;
      font-weight: 400;
      color: #8a99a8;
    }

    &.text-danger {
      color: #d9534f;
    }
  }
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #faf6f2;
  border-radius: 10px;

  .todo-time {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 70px;
    color: #e8734a;
    font-weight: 600;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }

  .todo-title {
    flex: 1;
    color: #33414e;
  }
}

.todo-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
  font-size: 13px;
  color: #8a99a8;
}

.notice-list {
  display: flex;
  flex-direction: column;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 6px;
  border-bottom: 1px dashed #efe7df;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover .notice-title {
    color: #e8734a;
  }

  .notice-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #33414e;
  }

  .notice-date {
    font-size: 13px;
    color: #8a99a8;
  }
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fdf0ea;
    transform: translateY(-2px);
  }

  .quick-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quick-name {
    font-size: 15px;
    color: #33414e;
  }
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #8a99a8;
  font-size: 13px;
}

.notice-content {
  margin: 0;
  line-height: 1.9;
  color: #5a6b7d;
  white-space: pre-wrap;
}
</style>
