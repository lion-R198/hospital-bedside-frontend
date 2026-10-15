<template>
  <div class="page-container">
    <!-- I-01 医院概况 -->
    <div class="app-card">
      <h3 class="card-title"><span class="card-title-bar" />医院概况</h3>
      <div class="hospital-header">
        <div class="hospital-badge">
          <el-icon :size="30" color="#fff"><FirstAidKit /></el-icon>
        </div>
        <div>
          <p class="hospital-name">
            {{ hospitalInfo.hospitalName }}
            <el-tag type="warning" effect="plain">{{ hospitalInfo.hospitalLevel }}医院</el-tag>
          </p>
          <p class="hospital-meta">
            <el-icon><Location /></el-icon>{{ hospitalInfo.address }}
            <el-divider direction="vertical" />
            <el-icon><Phone /></el-icon>{{ hospitalInfo.contactPhone }}
          </p>
        </div>
      </div>
      <p class="hospital-intro">{{ hospitalInfo.introduction }}</p>
    </div>

    <el-row :gutter="16" class="row-gap">
      <!-- I-02 科室介绍 -->
      <el-col :span="12">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />科室介绍</h3>
          <el-collapse accordion>
            <el-collapse-item v-for="dept in departments" :key="dept.id" :name="dept.id">
              <template #title>
                <span class="dept-title">{{ dept.deptName }}</span>
                <span class="dept-director">负责人：{{ dept.director }}</span>
              </template>
              <p class="dept-intro">{{ dept.introduction }}</p>
              <p class="dept-phone"><el-icon><Phone /></el-icon>科室电话：{{ dept.contactPhone }}</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>

      <!-- I-03 就诊指南 -->
      <el-col :span="12">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />就诊指南</h3>
          <div v-for="guide in guideList" :key="guide.title" class="guide-block">
            <p class="guide-title">{{ guide.title }}</p>
            <el-steps :active="guide.steps.length" simple finish-status="success">
              <el-step v-for="(step, idx) in guide.steps" :key="idx" :title="step" :icon="icons[idx % icons.length]" />
            </el-steps>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- I-04 楼层分布 -->
    <div class="app-card row-gap-card">
      <h3 class="card-title"><span class="card-title-bar" />楼层分布</h3>
      <el-table :data="floorMap" stripe>
        <el-table-column label="楼层" width="100">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.floor }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="功能分区" min-width="400">
          <template #default="{ row }">
            <el-tag
              v-for="area in row.areas"
              :key="area"
              type="info"
              effect="plain"
              size="large"
              class="area-tag"
            >
              {{ area }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { EditPen, CreditCard, Search } from '@element-plus/icons-vue'
import { getHospitalInfo, getDepartments, getHospitalGuide } from '@/api/hospital'

const hospitalInfo = ref({})
const departments = ref([])
const guideList = ref([])
const floorMap = ref([])

const icons = [EditPen, CreditCard, Search, EditPen, CreditCard]

onMounted(async () => {
  const [info, depts, guide] = await Promise.all([
    getHospitalInfo(),
    getDepartments(),
    getHospitalGuide()
  ])
  hospitalInfo.value = info
  departments.value = depts
  guideList.value = guide.guide
  floorMap.value = guide.floorMap
})
</script>

<style lang="scss" scoped>
.hospital-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;

  .hospital-badge {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    background: linear-gradient(135deg, #e8734a, #f2926b);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .hospital-name {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 600;
    color: #33414e;
  }

  .hospital-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 14px;
    color: #8a99a8;
  }
}

.hospital-intro {
  margin: 0;
  line-height: 2;
  color: #5a6b7d;
  text-indent: 2em;
}

.row-gap {
  margin-top: 16px;
}

.row-gap-card {
  margin-top: 16px;
}

.dept-title {
  font-weight: 600;
  color: #33414e;
}

.dept-director {
  margin-left: 12px;
  font-size: 13px;
  color: #8a99a8;
}

.dept-intro {
  margin: 0 0 8px;
  line-height: 1.9;
  color: #5a6b7d;
}

.dept-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 13px;
  color: #e8734a;
}

.guide-block {
  & + .guide-block {
    margin-top: 18px;
  }

  .guide-title {
    margin: 0 0 10px;
    font-weight: 600;
    color: #33414e;
  }
}

.area-tag {
  margin: 0 8px 8px 0;
}
</style>
