<template>
  <div class="page-container">
    <!-- 费用/余额概览 -->
    <div class="fee-grid">
      <div class="app-card fee-card">
        <p class="fee-label">预缴余额</p>
        <p class="fee-value" :class="{ 'value-danger': depositSummary.lowBalanceWarn }">
          {{ formatMoney(depositSummary.balance) }}
        </p>
        <p v-if="depositSummary.lowBalanceWarn" class="fee-warn">
          <el-icon><WarningFilled /></el-icon>余额不足，请及时到住院处补缴
        </p>
      </div>
      <div class="app-card fee-card">
        <p class="fee-label">累计预缴</p>
        <p class="fee-value">{{ formatMoney(depositSummary.totalDeposit) }}</p>
      </div>
      <div class="app-card fee-card">
        <p class="fee-label">累计费用</p>
        <p class="fee-value">{{ formatMoney(depositSummary.totalUsed) }}</p>
      </div>
      <div class="app-card fee-card">
        <p class="fee-label">医保类型</p>
        <p class="fee-value fee-insurance">{{ insuranceInfo.insuranceType || '自费' }}</p>
        <p v-if="insuranceInfo.reimbursementRatio" class="fee-warn ok">
          报销比例约 {{ insuranceInfo.reimbursementRatio }}%
        </p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="module-tabs">
      <!-- F-01 费用明细 -->
      <el-tab-pane label="费用明细" name="detail">
        <div class="app-card">
          <div class="filter-bar">
            <el-date-picker
              v-model="feeDate"
              type="date"
              placeholder="全部日期"
              value-format="YYYY-MM-DD"
              :clearable="true"
              style="width: 160px"
              @change="loadFees"
            />
            <span class="filter-total">合计：<b class="total-amount">{{ formatMoney(feeTotal) }}</b></span>
          </div>
          <el-table :data="feeItems" stripe show-summary :summary-method="summarize">
            <el-table-column label="费用日期" width="120">
              <template #default="{ row }">{{ formatDate(row.chargeDate) }}</template>
            </el-table-column>
            <el-table-column label="类别" width="90">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ getLabel('chargeCategory', row.itemCategory) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="itemName" label="项目名称" min-width="200" />
            <el-table-column label="单价" width="100" align="right">
              <template #default="{ row }">{{ formatMoney(row.price) }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column label="金额" width="110" align="right">
              <template #default="{ row }"><b>{{ formatMoney(row.amount) }}</b></template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTag('feeStatus', row.feeStatus)" size="small">
                  {{ getLabel('feeStatus', row.feeStatus) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- F-02 每日清单 -->
      <el-tab-pane label="每日清单" name="daily">
        <div class="app-card">
          <el-table :data="dailyList" stripe>
            <el-table-column label="日期" width="160">
              <template #default="{ row }">{{ formatDate(row.chargeDate) }}</template>
            </el-table-column>
            <el-table-column prop="count" label="费用笔数" width="120" align="center" />
            <el-table-column label="当日合计" align="right">
              <template #default="{ row }"><b>{{ formatMoney(row.total) }}</b></template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewDayDetail(row.chargeDate)">查看明细</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- F-03 医保信息 -->
      <el-tab-pane label="医保信息" name="insurance">
        <div class="app-card">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="医保类型">{{ insuranceInfo.insuranceType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="医保状态">
              <el-tag :type="insuranceInfo.status === 1 ? 'success' : 'info'">
                {{ insuranceInfo.status === 1 ? '有效' : '失效' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="医保卡号">{{ insuranceInfo.insuranceNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报销比例">{{ insuranceInfo.reimbursementRatio ?? '-' }}%</el-descriptions-item>
          </el-descriptions>
          <el-alert
            class="ins-tip"
            type="info"
            show-icon
            :closable="false"
            title="结算说明"
            description="出院结算时医保费用实时报销，自费部分支持现金、银行卡及移动支付；具体报销金额以医保经办机构核算为准。"
          />
        </div>
      </el-tab-pane>

      <!-- F-04 预缴余额 -->
      <el-tab-pane label="预缴记录" name="deposit">
        <div class="app-card">
          <el-table :data="deposits" stripe>
            <el-table-column label="类型" width="90">
              <template #default="{ row }">
                <el-tag :type="getTag('depositType', row.depositType)" size="small">
                  {{ getLabel('depositType', row.depositType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="130" align="right">
              <template #default="{ row }"><b>{{ formatMoney(row.amount) }}</b></template>
            </el-table-column>
            <el-table-column label="支付方式" width="110" align="center">
              <template #default="{ row }">{{ getLabel('payMethod', row.payMethod) }}</template>
            </el-table-column>
            <el-table-column label="缴费时间" width="170">
              <template #default="{ row }">{{ formatDateTime(row.depositTime) }}</template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="180" />
          </el-table>
          <el-alert
            class="ins-tip"
            type="warning"
            show-icon
            :closable="false"
            title="充值提示"
            description="如需补缴预金，请家属携带预缴收据至一楼住院处办理；出院结算后余款将原路退回。"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  getFeeDetails,
  getFeeDaily,
  getInsuranceInfo,
  getDepositSummary,
  getDepositRecords
} from '@/api/fee'
import { formatDate, formatDateTime, formatMoney } from '@/utils/format'
import { getLabel, getTag } from '@/dict'

const activeTab = ref('detail')
const depositSummary = ref({})
const insuranceInfo = ref({})
const deposits = ref([])
const dailyList = ref([])
const feeItems = ref([])
const feeTotal = ref(0)
const feeDate = ref(null)

function summarize({ columns }) {
  return columns.map((col, i) => (i === 0 ? '合计' : i === columns.length - 2 ? formatMoney(feeTotal.value) : ''))
}

async function loadFees() {
  const data = await getFeeDetails(feeDate.value ? { chargeDate: feeDate.value } : {})
  feeItems.value = data.items
  feeTotal.value = data.total
}

function viewDayDetail(date) {
  activeTab.value = 'detail'
  feeDate.value = date
  loadFees()
}

onMounted(async () => {
  const [summary, insurance, depositRecords, daily] = await Promise.all([
    getDepositSummary(),
    getInsuranceInfo(),
    getDepositRecords(),
    getFeeDaily()
  ])
  depositSummary.value = summary
  insuranceInfo.value = insurance
  deposits.value = depositRecords
  dailyList.value = daily
  loadFees()
})
</script>

<style lang="scss" scoped>
.fee-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.fee-card {
  margin: 0 !important;
  padding: 18px 20px !important;

  .fee-label {
    margin: 0 0 6px;
    font-size: 13px;
    color: #8a99a8;
  }

  .fee-value {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #33414e;
    font-variant-numeric: tabular-nums;

    &.value-danger {
      color: #d9534f;
    }

    &.fee-insurance {
      font-size: 17px;
      line-height: 40px;
    }
  }

  .fee-warn {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 6px 0 0;
    font-size: 13px;
    color: #d9534f;

    &.ok {
      color: #3fa37c;
    }
  }
}

.module-tabs {
  margin-top: 16px;

  :deep(.el-tabs__item.is-active) {
    color: #e8734a;
  }
  :deep(.el-tabs__active-bar) {
    background-color: #e8734a;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  .filter-total {
    font-size: 14px;
    color: #5a6b7d;

    .total-amount {
      color: #e8734a;
      font-size: 18px;
    }
  }
}

.ins-tip {
  margin-top: 14px;
}
</style>
