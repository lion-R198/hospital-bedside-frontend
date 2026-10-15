<template>
  <div class="page-container">
    <!-- 最新体征概览 -->
    <div class="vital-grid">
      <div v-for="item in latestCards" :key="item.key" class="app-card vital-card">
        <div class="vital-icon" :style="{ background: item.bg, color: item.color }">
          <el-icon :size="24"><component :is="item.icon" /></el-icon>
        </div>
        <div class="vital-body">
          <p class="vital-label">{{ item.label }}<small class="vital-unit">（{{ item.unit }}）</small></p>
          <p class="vital-value" :style="{ color: item.abnormal ? '#D9534F' : '#33414E' }">
            {{ item.value }}
            <el-tooltip v-if="item.abnormal" content="超出参考区间，请告知医护人员" placement="top">
              <el-icon color="#D9534F"><WarningFilled /></el-icon>
            </el-tooltip>
          </p>
          <p class="vital-range">参考区间：{{ item.range }}</p>
        </div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="app-card">
      <h3 class="card-title">
        <span class="card-title-bar" />趋势图（近 {{ rangeDays }} 天）
        <span class="card-title-extra">
          <el-radio-group v-model="rangeDays" size="small" @change="loadVitals">
            <el-radio-button :value="3">3 天</el-radio-button>
            <el-radio-button :value="7">7 天</el-radio-button>
          </el-radio-group>
        </span>
      </h3>
      <div ref="chartRef" class="vital-chart" />
      <p class="chart-legend-tip">
        <el-icon><InfoFilled /></el-icon>
        灰色虚线为参考区间边界；数据来自护士站测量记录，同步延迟不超过 5 分钟
      </p>
    </div>

    <!-- 明细列表 -->
    <div class="app-card">
      <h3 class="card-title"><span class="card-title-bar" />测量记录</h3>
      <el-table :data="vitals" stripe>
        <el-table-column label="测量时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.measureTime) }}</template>
        </el-table-column>
        <el-table-column label="体温(℃)" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'cell-abnormal': outOfRange('temperature', row.temperature) }">{{ row.temperature ?? '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="脉搏(次/分)" width="110" align="center">
          <template #default="{ row }">
            <span :class="{ 'cell-abnormal': outOfRange('pulse', row.pulse) }">{{ row.pulse ?? '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="呼吸(次/分)" width="110" align="center">
          <template #default="{ row }">
            <span :class="{ 'cell-abnormal': outOfRange('respiration', row.respiration) }">{{ row.respiration ?? '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="血压(mmHg)" width="120" align="center">
          <template #default="{ row }">{{ row.systolicPressure }}/{{ row.diastolicPressure }}</template>
        </el-table-column>
        <el-table-column label="血氧(%)" width="100" align="center">
          <template #default="{ row }">
            <span :class="{ 'cell-abnormal': outOfRange('bloodOxygen', row.bloodOxygen) }">{{ row.bloodOxygen ?? '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120">
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getVitalSigns } from '@/api/vital'
import { formatDateTime } from '@/utils/format'
import { vitalRanges } from '@/config/vitalRanges'

const vitals = ref([])
const rangeDays = ref(7)
const chartRef = ref(null)
let chart = null

/** 参考区间判断（医疗业务规则：越界标红提示） */
function outOfRange(key, value) {
  if (value === null || value === undefined) return false
  const range = vitalRanges[key]
  return value < range.min || value > range.max
}

const latestCards = computed(() => {
  const latest = vitals.value[vitals.value.length - 1] || {}
  const bp = latest.systolicPressure && latest.diastolicPressure
  return [
    { key: 'temperature', label: '体温', value: latest.temperature ?? '-', unit: vitalRanges.temperature.unit, range: `${vitalRanges.temperature.min}~${vitalRanges.temperature.max}`, icon: 'Sunny', bg: '#fdf0ea', color: '#e8734a', abnormal: outOfRange('temperature', latest.temperature) },
    { key: 'pulse', label: '脉搏', value: latest.pulse ?? '-', unit: vitalRanges.pulse.unit, range: `${vitalRanges.pulse.min}~${vitalRanges.pulse.max}`, icon: 'Timer', bg: '#fdf1f0', color: '#d9534f', abnormal: outOfRange('pulse', latest.pulse) },
    { key: 'respiration', label: '呼吸', value: latest.respiration ?? '-', unit: vitalRanges.respiration.unit, range: `${vitalRanges.respiration.min}~${vitalRanges.respiration.max}`, icon: 'WindPower', bg: '#eef8ec', color: '#67a845', abnormal: outOfRange('respiration', latest.respiration) },
    { key: 'bp', label: '血压', value: bp ? `${latest.systolicPressure}/${latest.diastolicPressure}` : '-', unit: 'mmHg', range: `${vitalRanges.systolic.min}~${vitalRanges.systolic.max} / ${vitalRanges.diastolic.min}~${vitalRanges.diastolic.max}`, icon: 'Aim', bg: '#eef1fd', color: '#6b7cc4', abnormal: outOfRange('systolic', latest.systolicPressure) || outOfRange('diastolic', latest.diastolicPressure) },
    { key: 'bloodOxygen', label: '血氧饱和度', value: latest.bloodOxygen ?? '-', unit: vitalRanges.bloodOxygen.unit, range: `${vitalRanges.bloodOxygen.min}~${vitalRanges.bloodOxygen.max}`, icon: 'MagicStick', bg: '#eaf6f1', color: '#3fa37c', abnormal: outOfRange('bloodOxygen', latest.bloodOxygen) }
  ]
})

function renderChart() {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  const sorted = [...vitals.value].sort((a, b) => a.measureTime.localeCompare(b.measureTime))
  const xData = sorted.map((v) => v.measureTime.slice(5, 16).replace(' ', ' '))
  const mkMarkLine = (key) => {
    const r = vitalRanges[key]
    return {
      silent: true,
      symbol: 'none',
      lineStyle: { color: '#C4CDD5', type: 'dashed' },
      data: [
        { yAxis: r.min, label: { formatter: `下限 ${r.min}`, fontSize: 10 } },
        { yAxis: r.max, label: { formatter: `上限 ${r.max}`, fontSize: 10 } }
      ]
    }
  }
  chart.setOption({
    color: ['#E8734A', '#D9534F', '#6B7CC4', '#3FA37C'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['体温(℃)', '脉搏(次/分)', '收缩压', '舒张压', '血氧(%)'], top: 0 },
    grid: { left: 46, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: xData, boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      { name: '体温(℃)', type: 'line', smooth: true, data: sorted.map((v) => v.temperature), markLine: mkMarkLine('temperature') },
      { name: '脉搏(次/分)', type: 'line', smooth: true, data: sorted.map((v) => v.pulse), markLine: mkMarkLine('pulse') },
      { name: '收缩压', type: 'line', smooth: true, data: sorted.map((v) => v.systolicPressure), markLine: mkMarkLine('systolic') },
      { name: '舒张压', type: 'line', smooth: true, data: sorted.map((v) => v.diastolicPressure), markLine: mkMarkLine('diastolic') },
      { name: '血氧(%)', type: 'line', smooth: true, data: sorted.map((v) => Number(v.bloodOxygen)), markLine: mkMarkLine('bloodOxygen') }
    ]
  })
}

async function loadVitals() {
  vitals.value = await getVitalSigns({ days: rangeDays.value })
  await nextTick()
  renderChart()
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  loadVitals()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style lang="scss" scoped>
.vital-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.vital-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 !important;
  padding: 16px !important;

  .vital-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .vital-label {
    margin: 0;
    font-size: 13px;
    color: #8a99a8;

    .vital-unit {
      font-size: 12px;
    }
  }

  .vital-value {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 2px 0;
    font-size: 24px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .vital-range {
    margin: 0;
    font-size: 12px;
    color: #a5b2bf;
  }
}

.vital-chart {
  width: 100%;
  height: 360px;
}

.chart-legend-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0;
  font-size: 13px;
  color: #8a99a8;
}

.cell-abnormal {
  color: #d9534f;
  font-weight: 600;
}
</style>
