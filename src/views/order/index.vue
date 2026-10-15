<template>
  <div class="page-container">
    <el-tabs v-model="activeTab" class="module-tabs">
      <!-- M-01 医嘱列表 -->
      <el-tab-pane label="医嘱列表" name="list">
        <div class="app-card">
          <div class="filter-bar">
            <el-select v-model="query.orderType" placeholder="医嘱类型" clearable style="width: 130px" @change="loadOrders">
              <el-option v-for="opt in getOptions('orderType')" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-select v-model="query.orderCategory" placeholder="医嘱类别" clearable style="width: 130px" @change="loadOrders">
              <el-option v-for="opt in getOptions('orderCategory')" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-select v-model="query.status" placeholder="执行状态" clearable style="width: 130px" @change="loadOrders">
              <el-option v-for="opt in getOptions('orderStatus')" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </div>
          <el-table :data="orders" stripe>
            <el-table-column prop="orderNo" label="医嘱号" width="150" />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="getTag('orderType', row.orderType)" size="small">
                  {{ getLabel('orderType', row.orderType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="类别" width="80">
              <template #default="{ row }">
                <el-tag :type="getTag('orderCategory', row.orderCategory)" size="small" effect="plain">
                  {{ getLabel('orderCategory', row.orderCategory) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="orderContent" label="医嘱内容" min-width="220" />
            <el-table-column prop="dosage" label="用法用量" min-width="180" />
            <el-table-column prop="frequency" label="频次" width="70" />
            <el-table-column label="开始时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="getTag('orderStatus', row.status)" size="small">
                  {{ getLabel('orderStatus', row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="开单/执行" width="130">
              <template #default="{ row }">{{ row.doctorName }} / {{ row.nurseName || '-' }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- M-02 用药提醒 -->
      <el-tab-pane label="用药提醒" name="medication">
        <div class="medication-grid">
          <div v-for="med in activeMedications" :key="med.id" class="app-card med-card">
            <div class="med-header">
              <el-icon :size="22" color="#e8734a"><Van /></el-icon>
              <span class="med-name">{{ med.drugName || med.orderContent }}</span>
              <el-tag :type="getTag('orderStatus', med.status)" size="small">
                {{ getLabel('orderStatus', med.status) }}
              </el-tag>
            </div>
            <el-descriptions :column="1" size="small" class="med-desc">
              <el-descriptions-item label="用法用量">{{ med.dosage }}</el-descriptions-item>
              <el-descriptions-item label="频次">{{ frequencyText(med.frequency) }}</el-descriptions-item>
              <el-descriptions-item label="注意事项">
                <span class="med-remark">{{ med.remark || '请遵医嘱按时按量服用' }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <el-empty v-if="!activeMedications.length" description="暂无进行中的用药医嘱" class="grid-empty" />
        </div>
      </el-tab-pane>

      <!-- M-03 检查检验 -->
      <el-tab-pane label="检查检验" name="exam">
        <div class="app-card">
          <div class="filter-bar">
            <el-select v-model="examTypeFilter" placeholder="全部类型" clearable style="width: 130px" @change="loadExams">
              <el-option v-for="opt in getOptions('examType')" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </div>
          <el-table :data="examinations" stripe>
            <el-table-column prop="examNo" label="单号" width="150" />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="getTag('examType', row.examType)" size="small">
                  {{ getLabel('examType', row.examType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="examName" label="项目名称" min-width="190" />
            <el-table-column prop="examPart" label="部位/标本" width="120" />
            <el-table-column label="预约时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.scheduledTime) }}</template>
            </el-table-column>
            <el-table-column label="结果状态" width="110">
              <template #default="{ row }">
                <el-tag :type="getTag('examResultStatus', row.resultStatus)" size="small">
                  {{ getLabel('examResultStatus', row.resultStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.resultStatus === 2"
                  type="primary"
                  link
                  @click="showExamResult(row)"
                >
                  查看结果
                </el-button>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="exam-tip">
            <el-icon><InfoFilled /></el-icon>
            检查前请仔细阅读注意事项：空腹项目请保持禁食禁饮；行动不便可呼叫护士协助
          </div>
        </div>
      </el-tab-pane>

      <!-- M-04 治疗安排 -->
      <el-tab-pane label="治疗安排" name="treatment">
        <div class="app-card">
          <el-empty v-if="!treatments.length" description="暂无治疗安排" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="t in treatments"
              :key="t.id"
              :timestamp="formatDateTime(t.startTime)"
              :type="t.status === 0 ? 'warning' : t.status === 1 ? 'primary' : 'success'"
              placement="top"
            >
              <div class="treatment-item">
                <span class="treatment-title">{{ t.orderContent }}</span>
                <el-tag :type="getTag('orderStatus', t.status)" size="small">
                  {{ getLabel('orderStatus', t.status) }}
                </el-tag>
                <p class="treatment-desc">{{ t.dosage }}<template v-if="t.remark">（{{ t.remark }}）</template></p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 检查结果弹窗 -->
    <el-dialog v-model="examVisible" :title="currentExam?.examName" width="560px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="类型">{{ getLabel('examType', currentExam?.examType) }}</el-descriptions-item>
        <el-descriptions-item label="部位/标本">{{ currentExam?.examPart || '-' }}</el-descriptions-item>
        <el-descriptions-item label="检查时间">{{ formatDateTime(currentExam?.scheduledTime) }}</el-descriptions-item>
        <el-descriptions-item label="开单医生">{{ currentExam?.doctorName }}</el-descriptions-item>
      </el-descriptions>
      <h4 class="result-title">结果描述</h4>
      <p class="result-content">{{ currentExam?.result }}</p>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getMedicalOrders, getExaminations } from '@/api/order'
import { formatDateTime } from '@/utils/format'
import { getLabel, getTag, getOptions } from '@/dict'

const activeTab = ref('list')
const orders = ref([])
const examinations = ref([])
const query = ref({ orderType: null, orderCategory: null, status: null })
const examTypeFilter = ref(null)
const examVisible = ref(false)
const currentExam = ref(null)

/** 进行中的用药医嘱（用药提醒） */
const activeMedications = computed(() =>
  orders.value.filter((o) => o.orderCategory === 1 && [0, 1].includes(o.status))
)

/** 治疗/护理安排 */
const treatments = computed(() =>
  orders.value.filter((o) => [2, 3].includes(o.orderCategory)).sort((a, b) => (b.startTime || '').localeCompare(a.startTime || ''))
)

/** 医嘱频次缩写释义：统一取自业务字典（src/dict/index.js），避免页面内硬编码 */
function frequencyText(f) {
  return getLabel('orderFrequency', f)
}

function showExamResult(row) {
  currentExam.value = row
  examVisible.value = true
}

async function loadOrders() {
  const params = Object.fromEntries(Object.entries(query.value).filter(([, v]) => v !== null && v !== ''))
  orders.value = await getMedicalOrders(params)
}

async function loadExams() {
  examinations.value = await getExaminations(examTypeFilter.value ? { examType: examTypeFilter.value } : {})
}

onMounted(() => {
  loadOrders()
  loadExams()
})
</script>

<style lang="scss" scoped>
.module-tabs {
  :deep(.el-tabs__item.is-active) {
    color: #e8734a;
  }
  :deep(.el-tabs__active-bar) {
    background-color: #e8734a;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.medication-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .grid-empty {
    grid-column: 1 / -1;
    background: #fff;
    border-radius: 14px;
  }
}

.med-card {
  margin: 0 !important;

  .med-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .med-name {
      flex: 1;
      font-size: 16px;
      font-weight: 600;
      color: #33414e;
    }
  }

  .med-desc {
    :deep(.el-descriptions__label) {
      color: #8a99a8;
    }
  }

  .med-remark {
    color: #d9534f;
  }
}

.exam-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 13px;
  color: #8a99a8;
}

.treatment-item {
  .treatment-title {
    font-size: 15px;
    font-weight: 600;
    color: #33414e;
    margin-right: 10px;
  }

  .treatment-desc {
    margin: 6px 0 0;
    color: #8a99a8;
    font-size: 14px;
  }
}

.result-title {
  margin: 16px 0 8px;
  color: #33414e;
}

.result-content {
  margin: 0;
  color: #5a6b7d;
  line-height: 1.8;
  background: #faf6f2;
  padding: 12px 14px;
  border-radius: 8px;
}
</style>
