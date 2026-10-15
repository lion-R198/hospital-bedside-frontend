<template>
  <div class="page-container">
    <!-- 责任医护团队 -->
    <div class="app-card">
      <h3 class="card-title"><span class="card-title-bar" />我的医护团队</h3>
      <div class="staff-grid">
        <div v-for="rel in staffRelations" :key="rel.id" class="staff-card" :class="{ primary: rel.isPrimary }">
          <div class="staff-avatar" :class="rel.staff.staffType === 1 ? 'doctor' : 'nurse'">
            {{ rel.staff.name.charAt(0) }}
          </div>
          <div class="staff-info">
            <p class="staff-name">
              {{ rel.staff.name }}
              <el-tag size="small" :type="rel.staff.staffType === 1 ? 'primary' : 'success'">
                {{ getLabel('staffType', rel.staff.staffType) }}
              </el-tag>
              <el-tag v-if="rel.isPrimary" size="small" type="warning" effect="light">主要责任人</el-tag>
            </p>
            <p class="staff-title">
              {{ rel.staff.title }}
              <template v-if="rel.staff.staffType === 1">
                · {{ departmentName(rel.staff.departmentId) }}
              </template>
              <template v-else>· {{ wardName(rel.staff.wardId) }}</template>
            </p>
            <p class="staff-specialty">{{ rel.staff.specialty }}</p>
            <p class="staff-phone">
              <el-icon><Phone /></el-icon>{{ rel.staff.phone }}
              <span class="phone-tip">（隐私保护，仅示部分号码）</span>
            </p>
          </div>
        </div>
      </div>

      <!-- N-04 联系方式 -->
      <el-alert type="info" show-icon :closable="false" class="contact-alert">
        <template #title>
          联系护士站：{{ nurseStationPhone }}（床位呼叫器请按「呼叫」键）；紧急情况请直接按床头紧急呼叫按钮
        </template>
      </el-alert>
    </div>

    <!-- N-03 排班信息 -->
    <div class="app-card">
      <h3 class="card-title"><span class="card-title-bar" />本周排班</h3>
      <el-table :data="dutyRows" stripe>
        <el-table-column label="医护" width="130" fixed>
          <template #default="{ row }">
            {{ row.staff.name }}（{{ getLabel('staffType', row.staff.staffType) }}）
          </template>
        </el-table-column>
        <el-table-column v-for="day in weekDays" :key="day.date" :label="day.label" align="center" min-width="110">
          <template #default="{ row }">
            <template v-if="row.days[day.date]">
              <el-tag :type="getTag('shiftType', row.days[day.date].shiftType)" size="small">
                {{ getLabel('shiftType', row.days[day.date].shiftType) }}
              </el-tag>
              <p class="duty-time">{{ row.days[day.date].startTime }}-{{ row.days[day.date].endTime }}</p>
            </template>
            <span v-else class="text-muted">休</span>
          </template>
        </el-table-column>
      </el-table>
      <p class="duty-tip">
        <el-icon><InfoFilled /></el-icon>
        排班如有临时调整，以护士站当日公告为准
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getResponsibleStaff, getDutySchedule } from '@/api/staff'
import { getDepartments } from '@/api/hospital'
import { getLabel, getTag } from '@/dict'
import { pad } from '@/utils/dateHelper'

const staffRelations = ref([])
const dutySchedules = ref([])
const departments = ref([])
const wards = [
  { id: 1, wardName: '内科一病区' },
  { id: 2, wardName: '内科二病区' }
]
const nurseStationPhone = ref('0888-6612010')

function departmentName(id) {
  return departments.value.find((d) => d.id === id)?.deptName || '-'
}
function wardName(id) {
  return wards.find((w) => w.id === id)?.wardName || '-'
}

/** 本周（周一起）7 天 */
const weekDays = computed(() => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    return { date, label: labels[i] }
  })
})

/** 排班表转矩阵：医护 × 日期 */
const dutyRows = computed(() => {
  const map = new Map()
  dutySchedules.value.forEach((d) => {
    if (!map.has(d.staffId)) map.set(d.staffId, { staff: d.staff, days: {} })
    map.get(d.staffId).days[d.dutyDate] = d
  })
  return [...map.values()]
})

onMounted(async () => {
  const [staff, duty, depts] = await Promise.all([
    getResponsibleStaff(),
    getDutySchedule(),
    getDepartments()
  ])
  staffRelations.value = staff
  dutySchedules.value = duty
  departments.value = depts
})
</script>

<style lang="scss" scoped>
.staff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

.staff-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: #faf6f2;
  border-radius: 12px;
  border: 1px solid transparent;

  &.primary {
    border-color: #f0b79d;
    background: #fdf0ea;
  }

  .staff-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;

    &.doctor {
      background: linear-gradient(135deg, #6b7cc4, #8a9ad6);
    }

    &.nurse {
      background: linear-gradient(135deg, #3fa37c, #6bbf9f);
    }
  }

  .staff-name {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 600;
    color: #33414e;
  }

  .staff-title {
    margin: 0 0 4px;
    font-size: 14px;
    color: #5a6b7d;
  }

  .staff-specialty {
    margin: 0 0 4px;
    font-size: 13px;
    color: #8a99a8;
  }

  .staff-phone {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-size: 13px;
    color: #e8734a;

    .phone-tip {
      color: #a5b2bf;
      font-size: 12px;
    }
  }
}

.contact-alert {
  border-radius: 10px;
}

.duty-time {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8a99a8;
}

.duty-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
  font-size: 13px;
  color: #8a99a8;
}
</style>
