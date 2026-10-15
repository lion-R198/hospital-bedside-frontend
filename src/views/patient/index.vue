<template>
  <div class="page-container">
    <!-- 基本信息 + 住院信息 -->
    <el-row :gutter="16">
      <el-col :span="10">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />基本信息</h3>
          <div class="patient-hero">
            <el-avatar :size="64" class="hero-avatar">{{ patientInfo.name?.charAt(0) }}</el-avatar>
            <div>
              <p class="hero-name">
                {{ patientInfo.name }}
                <el-tag :type="getTag('patientStatus', patientInfo.status)" size="small">
                  {{ getLabel('patientStatus', patientInfo.status) }}
                </el-tag>
              </p>
              <p class="hero-no">住院号：{{ patientInfo.patientNo }}</p>
            </div>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="性别">{{ getLabel('gender', patientInfo.gender) }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ calcAge(patientInfo.birthDate) }} 岁</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ formatDate(patientInfo.birthDate) }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">
              <el-tooltip content="敏感信息已脱敏展示">
                {{ maskIdCard(patientInfo.idCard) }}
              </el-tooltip>
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ maskPhone(patientInfo.phone) }}</el-descriptions-item>
            <el-descriptions-item label="家庭住址" :span="2">{{ patientInfo.address || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
      <el-col :span="14">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />住院信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="入院日期">{{ formatDateTime(patientInfo.admissionDate) }}</el-descriptions-item>
            <el-descriptions-item label="入院天数">第 {{ admittedDays }} 天</el-descriptions-item>
            <el-descriptions-item label="入院科室">{{ patientInfo.departmentName }}</el-descriptions-item>
            <el-descriptions-item label="所在病区">{{ patientInfo.wardName }}（{{ patientInfo.wardLocation }}）</el-descriptions-item>
            <el-descriptions-item label="床号">{{ patientInfo.bedLabel }}</el-descriptions-item>
            <el-descriptions-item label="住院状态">
              <el-tag :type="getTag('patientStatus', patientInfo.status)">
                {{ getLabel('patientStatus', patientInfo.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="入院诊断摘要" :span="2">
              <span class="diagnosis-summary">{{ patientInfo.diagnosisSummary }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 过敏史醒目提示（医疗安全要素） -->
          <div class="allergy-alert">
            <div class="alert-header">
              <el-icon color="#D9534F"><WarningFilled /></el-icon>
              <span>过敏史提示</span>
            </div>
            <el-tag
              v-for="item in allergies"
              :key="item.id"
              type="danger"
              effect="light"
              size="large"
              class="allergy-tag"
            >
              {{ item.allergen }}（{{ getLabel('allergyType', item.allergyType) }} / {{ item.severity }}）
            </el-tag>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="row-gap">
      <!-- 诊断信息 -->
      <el-col :span="14">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />诊断信息</h3>
          <el-table :data="diagnoses" stripe>
            <el-table-column label="诊断类型" width="110">
              <template #default="{ row }">
                <el-tag :type="getTag('diagnosisType', row.diagnosisType)" size="small">
                  {{ getLabel('diagnosisType', row.diagnosisType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="diagnosisName" label="诊断名称" min-width="180" />
            <el-table-column prop="icdCode" label="ICD 编码" width="90" />
            <el-table-column prop="doctorName" label="诊断医生" width="100" />
            <el-table-column label="诊断时间" width="160">
              <template #default="{ row }">{{ formatDateTime(row.diagnosisTime) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 联系方式 -->
      <el-col :span="10">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />家属 / 紧急联系人</h3>
          <div v-for="contact in contacts" :key="contact.id" class="contact-item">
            <el-avatar :size="42" class="contact-avatar">{{ contact.name.charAt(0) }}</el-avatar>
            <div class="contact-info">
              <p class="contact-name">
                {{ contact.name }}
                <el-tag size="small" type="info">{{ contact.relation }}</el-tag>
                <el-tag v-if="contact.isEmergency" size="small" type="danger" effect="plain">紧急联系人</el-tag>
              </p>
              <p class="contact-phone">{{ maskPhone(contact.phone) }}</p>
            </div>
          </div>
          <p class="contact-tip">
            <el-icon><InfoFilled /></el-icon>
            如需修改联系人信息，请联系责任护士
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getPatientInfo, getDiagnoses, getAllergies, getContacts } from '@/api/patient'
import { formatDate, formatDateTime, maskIdCard, maskPhone, calcAge } from '@/utils/format'
import { getLabel, getTag } from '@/dict'

const patientInfo = ref({})
const diagnoses = ref([])
const allergies = ref([])
const contacts = ref([])

const admittedDays = computed(() => {
  if (!patientInfo.value.admissionDate) return '-'
  const diff = Date.now() - new Date(patientInfo.value.admissionDate).getTime()
  return Math.max(1, Math.ceil(diff / 86400000))
})

onMounted(async () => {
  const [info, diag, allergy, contact] = await Promise.all([
    getPatientInfo(),
    getDiagnoses(),
    getAllergies(),
    getContacts()
  ])
  patientInfo.value = info
  diagnoses.value = diag
  allergies.value = allergy
  contacts.value = contact
})
</script>

<style lang="scss" scoped>
.patient-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;

  .hero-avatar {
    background: linear-gradient(135deg, #e8734a, #f2926b);
    color: #fff;
    font-size: 26px;
  }

  .hero-name {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 600;
    color: #33414e;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hero-no {
    margin: 0;
    color: #8a99a8;
    font-size: 14px;
  }
}

.diagnosis-summary {
  color: #33414e;
  font-weight: 500;
}

.allergy-alert {
  margin-top: 16px;
  padding: 12px 14px;
  background: #fdf1f0;
  border: 1px solid #f5cfcc;
  border-radius: 10px;

  .alert-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: #d9534f;
    margin-bottom: 10px;
  }

  .allergy-tag {
    margin-right: 8px;
  }
}

.row-gap {
  margin-top: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 6px;

  .contact-avatar {
    background: #eaf6f1;
    color: #3fa37c;
    font-size: 18px;
  }

  .contact-name {
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #33414e;
    font-size: 15px;
  }

  .contact-phone {
    margin: 0;
    color: #8a99a8;
    font-size: 14px;
  }
}

.contact-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 0;
  font-size: 13px;
  color: #8a99a8;
}
</style>
