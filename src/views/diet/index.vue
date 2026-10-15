<template>
  <div class="page-container">
    <!-- D-01 今日食谱 -->
    <div class="app-card">
      <h3 class="card-title">
        <span class="card-title-bar" />今日食谱
        <span class="card-title-extra">
          <el-tag type="success" effect="plain">{{ nutritionPlan.dietType }}</el-tag>
        </span>
      </h3>
      <div class="meal-grid">
        <div v-for="plan in todayDiets" :key="plan.id" class="meal-card">
          <div class="meal-header">
            <el-tag :type="getTag('mealTime', plan.mealTime)">{{ getLabel('mealTime', plan.mealTime) }}</el-tag>
            <span class="meal-type">{{ plan.dietType }}</span>
          </div>
          <p class="meal-content">{{ plan.content }}</p>
          <p v-if="plan.taboo" class="meal-taboo">
            <el-icon><CircleCloseFilled /></el-icon>{{ plan.taboo }}
          </p>
        </div>
      </div>
    </div>

    <el-row :gutter="16" class="row-gap">
      <!-- D-02 营养方案 -->
      <el-col :span="12">
        <div class="app-card nutrition-card">
          <h3 class="card-title">
            <span class="card-title-bar" />营养方案
            <span class="card-title-extra">全日热量目标约 {{ nutritionPlan.dailyCalorie }} kcal</span>
          </h3>
          <p class="nutrition-source">{{ nutritionPlan.nutritionist }}</p>
          <p class="nutrition-text">{{ nutritionPlan.suggestion }}</p>
        </div>
      </el-col>

      <!-- D-03 饮食禁忌 -->
      <el-col :span="12">
        <div class="app-card">
          <h3 class="card-title"><span class="card-title-bar" />饮食禁忌</h3>
          <div v-for="taboo in taboos" :key="taboo.name" class="taboo-item">
            <el-icon color="#D9534F"><CircleCloseFilled /></el-icon>
            <div>
              <p class="taboo-name">{{ taboo.name }}</p>
              <p class="taboo-detail">{{ taboo.detail }}</p>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- D-04 在线点餐 -->
    <div class="app-card">
      <h3 class="card-title">
        <span class="card-title-bar" />在线点餐
        <span class="card-title-extra">
          <el-button type="primary" :icon="ShoppingCart" @click="orderVisible = true">去点餐</el-button>
        </span>
      </h3>
      <el-table :data="mealOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="170" />
        <el-table-column label="用餐日期" width="120">
          <template #default="{ row }">{{ formatDate(row.orderDate) }}</template>
        </el-table-column>
        <el-table-column label="餐次" width="90">
          <template #default="{ row }">
            <el-tag :type="getTag('mealTime', row.mealTime)" size="small">{{ getLabel('mealTime', row.mealTime) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="餐品明细" min-width="240">
          <template #default="{ row }">
            {{ row.items.map((i) => `${i.dishName}×${i.quantity}`).join('、') }}
          </template>
        </el-table-column>
        <el-table-column label="金额" width="100" align="right">
          <template #default="{ row }"><b>{{ formatMoney(row.totalAmount) }}</b></template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getTag('mealOrderStatus', row.status)" size="small">
              {{ getLabel('mealOrderStatus', row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
      </el-table>
      <p class="order-tip">
        <el-icon><InfoFilled /></el-icon>
        点餐截止：午餐 09:30 / 晚餐 15:00；治疗饮食由营养食堂按方案配餐
      </p>
    </div>

    <!-- 点餐弹窗 -->
    <el-dialog v-model="orderVisible" title="在线点餐" width="640px" @open="openOrderDialog">
      <div class="order-meta">
        <el-select v-model="orderForm.mealTime" style="width: 120px">
          <el-option v-for="opt in getOptions('mealTime')" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-date-picker
          v-model="orderForm.orderDate"
          type="date"
          value-format="YYYY-MM-DD"
          :disabled-date="(d) => d.getTime() < Date.now() - 86400000"
          style="width: 150px"
        />
        <span class="order-cart">已选 {{ cartCount }} 项 · 合计 <b class="cart-amount">{{ formatMoney(cartTotal) }}</b></span>
      </div>
      <div class="dish-grid">
        <div
          v-for="dish in dishes"
          :key="dish.id"
          class="dish-item"
          :class="{ selected: cart[dish.id] > 0 }"
          @click="toggleDish(dish)"
        >
          <div class="dish-avatar" :style="dishAvatarStyle(dish)">
            {{ dish.dishName.charAt(0) }}
          </div>
          <div class="dish-info">
            <p class="dish-name">{{ dish.dishName }}</p>
            <p class="dish-desc">{{ dish.description }}</p>
            <p class="dish-price">
              {{ formatMoney(dish.price) }}
              <span v-if="cart[dish.id]" class="dish-count">×{{ cart[dish.id] }}</span>
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="orderVisible = false">取消</el-button>
        <el-button type="primary" :disabled="cartCount === 0" :loading="submitting" @click="submitOrder">
          提交订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import {
  getTodayDiet,
  getNutritionPlan,
  getDietTaboos,
  getDishList,
  getMealOrders,
  createMealOrder,
  cancelMealOrder
} from '@/api/diet'
import { formatDate, formatMoney } from '@/utils/format'
import { getLabel, getTag, getOptions } from '@/dict'

const todayDiets = ref([])
const nutritionPlan = ref({})
const taboos = ref([])
const dishes = ref([])
const mealOrders = ref([])

const orderVisible = ref(false)
const submitting = ref(false)
const cart = reactive({})
const orderForm = reactive({
  mealTime: new Date().getHours() < 10 ? 2 : new Date().getHours() < 16 ? 3 : 1,
  orderDate: formatDate(new Date())
})

const dishCategoryColors = { 1: '#E8734A', 2: '#67A845', 3: '#6B7CC4', 4: '#E6A23C', 5: '#D97B8C' }
function dishAvatarStyle(dish) {
  const color = dishCategoryColors[dish.dishCategory] || '#7C8CA0'
  return { background: `${color}1A`, color }
}

const cartCount = computed(() => Object.values(cart).reduce((s, n) => s + n, 0))
const cartTotal = computed(() =>
  dishes.value.reduce((sum, dish) => sum + (cart[dish.id] || 0) * dish.price, 0)
)

function toggleDish(dish) {
  cart[dish.id] = (cart[dish.id] || 0) + 1
}
function openOrderDialog() {
  Object.keys(cart).forEach((k) => delete cart[k])
}

async function submitOrder() {
  submitting.value = true
  try {
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([dishId, quantity]) => ({ dishId: Number(dishId), quantity }))
    await createMealOrder({ ...orderForm, items })
    ElMessage.success('点餐成功，餐食将按时送达病区')
    orderVisible.value = false
    mealOrders.value = await getMealOrders()
  } catch {
    // 失败提示已由 request.js 响应拦截器统一弹出（如「已过点餐截止时间」「与饮食医嘱不符」
    // 「数量超出允许范围」均为后端返回的患者可读文案）。
    // 此处刻意不重复提示，仅保持弹窗打开，便于患者调整后重试。
  } finally {
    submitting.value = false
  }
}

async function handleCancel(order) {
  try {
    await ElMessageBox.confirm(`确认取消订单 ${order.orderNo} 吗？`, '取消订单', { type: 'warning' })
  } catch {
    // 用户主动关闭确认框：ElMessageBox 以 'cancel' 拒绝，属正常交互而非异常，
    // 必须在此吞掉，否则每次取消都会产生未处理的 Promise 拒绝
    return
  }
  await cancelMealOrder(order.id)
  ElMessage.success('订单已取消')
  mealOrders.value = await getMealOrders()
}

onMounted(async () => {
  const [diet, nutrition, taboo, dish, orders] = await Promise.all([
    getTodayDiet(),
    getNutritionPlan(),
    getDietTaboos(),
    getDishList(),
    getMealOrders()
  ])
  todayDiets.value = diet
  nutritionPlan.value = nutrition
  taboos.value = taboo
  dishes.value = dish
  mealOrders.value = orders
})
</script>

<style lang="scss" scoped>
.meal-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.meal-card {
  background: #faf6f2;
  border-radius: 12px;
  padding: 16px;

  .meal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .meal-type {
      font-size: 13px;
      color: #8a99a8;
    }
  }

  .meal-content {
    margin: 0 0 8px;
    font-size: 14px;
    line-height: 1.8;
    color: #33414e;
  }

  .meal-taboo {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
    font-size: 12px;
    color: #d9534f;
  }
}

.row-gap {
  margin-top: 16px;
}

.nutrition-card {
  .nutrition-source {
    margin: 0 0 8px;
    font-size: 13px;
    color: #3fa37c;
  }

  .nutrition-text {
    margin: 0;
    line-height: 2;
    color: #5a6b7d;
    white-space: pre-line;
  }
}

.taboo-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;

  & + .taboo-item {
    border-top: 1px dashed #efe7df;
  }

  .taboo-name {
    margin: 0 0 4px;
    font-weight: 600;
    color: #33414e;
  }

  .taboo-detail {
    margin: 0;
    font-size: 13px;
    color: #8a99a8;
    line-height: 1.7;
  }
}

.order-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
  font-size: 13px;
  color: #8a99a8;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;

  .order-cart {
    margin-left: auto;
    font-size: 14px;
    color: #5a6b7d;

    .cart-amount {
      color: #e8734a;
      font-size: 17px;
    }
  }
}

.dish-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
}

.dish-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #efe7df;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #f0b79d;
  }

  &.selected {
    border-color: #e8734a;
    background: #fdf0ea;
  }

  .dish-avatar {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .dish-info {
    flex: 1;
    min-width: 0;

    .dish-name {
      margin: 0 0 2px;
      font-size: 15px;
      font-weight: 600;
      color: #33414e;
    }

    .dish-desc {
      margin: 0 0 4px;
      font-size: 12px;
      color: #8a99a8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dish-price {
      margin: 0;
      font-size: 14px;
      color: #e8734a;
      font-weight: 600;

      .dish-count {
        color: #8a99a8;
        font-weight: 400;
        margin-left: 6px;
      }
    }
  }
}
</style>
