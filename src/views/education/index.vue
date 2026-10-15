<template>
  <div class="page-container">
    <!-- E-01~E-04 宣教分类 -->
    <el-tabs v-model="activeType" class="module-tabs" @tab-change="loadList">
      <el-tab-pane
        v-for="opt in getOptions('eduType')"
        :key="opt.value"
        :label="opt.label"
        :name="String(opt.value)"
      />
    </el-tabs>

    <div class="edu-grid">
      <div v-for="item in eduList" :key="item.id" class="app-card edu-card" @click="openDetail(item.id)">
        <div class="edu-cover" :style="coverStyle(item.eduType)">
          <el-icon :size="30" color="#fff"><component :is="typeIcon(item.eduType)" /></el-icon>
        </div>
        <div class="edu-body">
          <p class="edu-title">{{ item.title }}</p>
          <p class="edu-meta">
            <el-tag v-if="item.diseaseName" size="small" type="warning" effect="plain">{{ item.diseaseName }}</el-tag>
            <span>{{ formatDate(item.publishTime) }}</span>
            <span class="edu-views"><el-icon><View /></el-icon>{{ item.viewCount }}</span>
          </p>
          <p class="edu-excerpt">{{ item.content }}</p>
          <el-button type="primary" plain size="small">阅读全文</el-button>
        </div>
      </div>
      <el-empty v-if="!eduList.length" description="暂无宣教内容" class="grid-empty" />
    </div>

    <!-- 宣教详情 -->
    <el-dialog v-model="detailVisible" :title="detail?.title" width="680px" top="6vh">
      <div class="detail-meta">
        <el-tag :type="getTag('eduType', detail?.eduType)" size="small">
          {{ getLabel('eduType', detail?.eduType) }}
        </el-tag>
        <span v-if="detail?.diseaseName" class="detail-disease">{{ detail.diseaseName }}</span>
        <span>{{ detail?.publisherName }} 发布于 {{ formatDateTime(detail?.publishTime) }}</span>
        <span class="detail-views"><el-icon><View /></el-icon>{{ detail?.viewCount }} 次浏览</span>
      </div>
      <p class="detail-content">{{ detail?.content }}</p>
      <div class="detail-footer">
        <el-icon color="#E8734A"><InfoFilled /></el-icon>
        以上内容仅供健康参考，具体诊疗请遵从医护人员的面对面指导
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getEducationList, getEducationDetail } from '@/api/education'
import { formatDate, formatDateTime } from '@/utils/format'
import { getLabel, getTag, getOptions } from '@/dict'

const activeType = ref('1')
const eduList = ref([])
const detailVisible = ref(false)
const detail = ref(null)

const typeConfig = {
  1: { icon: 'FirstAidKit', bg: 'linear-gradient(135deg,#e8734a,#f2926b)' },
  2: { icon: 'Bicycle', bg: 'linear-gradient(135deg,#3fa37c,#6bbf9f)' },
  3: { icon: 'MagicStick', bg: 'linear-gradient(135deg,#e6a23c,#f0c78a)' },
  4: { icon: 'Guide', bg: 'linear-gradient(135deg,#6b7cc4,#8a9ad6)' }
}
function typeIcon(t) {
  return typeConfig[t]?.icon || 'Reading'
}
function coverStyle(t) {
  return { background: typeConfig[t]?.bg || '#7C8CA0' }
}

async function loadList() {
  eduList.value = await getEducationList({ eduType: activeType.value })
}

async function openDetail(id) {
  detail.value = await getEducationDetail(id)
  detailVisible.value = true
  // 浏览数 +1 后刷新列表数字
  loadList()
}

onMounted(loadList)
</script>

<style lang="scss" scoped>
.module-tabs {
  margin-bottom: 16px;

  :deep(.el-tabs__item.is-active) {
    color: #e8734a;
  }
  :deep(.el-tabs__active-bar) {
    background-color: #e8734a;
  }
}

.edu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .grid-empty {
    grid-column: 1 / -1;
    background: #fff;
    border-radius: 14px;
  }
}

.edu-card {
  display: flex;
  gap: 16px;
  margin: 0 !important;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(196, 148, 116, 0.22);
  }

  .edu-cover {
    width: 76px;
    height: 76px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .edu-body {
    flex: 1;
    min-width: 0;
  }

  .edu-title {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #33414e;
  }

  .edu-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 8px;
    font-size: 13px;
    color: #8a99a8;

    .edu-views {
      display: flex;
      align-items: center;
      gap: 3px;
      margin-left: auto;
    }
  }

  .edu-excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.8;
    color: #8a99a8;
  }
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #8a99a8;
  margin-bottom: 14px;

  .detail-disease {
    color: #e6a23c;
  }

  .detail-views {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-left: auto;
  }
}

.detail-content {
  margin: 0;
  font-size: 15px;
  line-height: 2.1;
  color: #33414e;
  white-space: pre-wrap;
}

.detail-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed #efe7df;
  font-size: 13px;
  color: #8a99a8;
}
</style>
