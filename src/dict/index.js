/**
 * 业务字典
 * 所有枚举取值与数据库 schema.sql 中 TINYINT 字段注释严格对齐，
 * 前端统一从这里取文案/标签颜色，禁止在页面内硬编码枚举含义。
 */

// 字典定义：value -> { label, tag }（tag 为 el-tag type，可选）
export const DICTS = {
  /** 性别 gender CHAR(1) M男 F女 */
  gender: {
    M: { label: '男' },
    F: { label: '女' }
  },
  /** 系统账号角色 sys_user.role_type (1患者 2家属 3医生 4护士 5系统管理员) */
  roleType: {
    1: { label: '患者' },
    2: { label: '家属/陪护' },
    3: { label: '医生' },
    4: { label: '护士' },
    5: { label: '系统管理员' }
  },
  /** 住院状态 patient.status (0在院 1已出院) */
  patientStatus: {
    0: { label: '在院', tag: 'success' },
    1: { label: '已出院', tag: 'info' }
  },
  /** 床位状态 bed.bed_status (0空床 1占用 2清洁中 3维修中) */
  bedStatus: {
    0: { label: '空床', tag: 'info' },
    1: { label: '占用', tag: 'success' },
    2: { label: '清洁中', tag: 'warning' },
    3: { label: '维修中', tag: 'danger' }
  },
  /** 人员类型 medical_staff.staff_type (1医生 2护士) */
  staffType: {
    1: { label: '医生' },
    2: { label: '护士' }
  },
  /** 医嘱类型 medical_order.order_type (1长期 2临时) */
  orderType: {
    1: { label: '长期', tag: 'success' },
    2: { label: '临时', tag: 'warning' }
  },
  /** 医嘱类别 medical_order.order_category (1用药 2治疗 3护理 4检查 5其他) */
  orderCategory: {
    1: { label: '用药', tag: 'primary' },
    2: { label: '治疗', tag: 'warning' },
    3: { label: '护理', tag: 'success' },
    4: { label: '检查', tag: 'info' },
    5: { label: '其他', tag: 'info' }
  },
  /** 医嘱状态 medical_order.status (0待执行 1执行中 2已执行 3已停止) */
  orderStatus: {
    0: { label: '待执行', tag: 'warning' },
    1: { label: '执行中', tag: 'primary' },
    2: { label: '已执行', tag: 'success' },
    3: { label: '已停止', tag: 'info' }
  },
  /** 检查检验类型 examination.exam_type (1检查 2检验) */
  examType: {
    1: { label: '检查', tag: 'primary' },
    2: { label: '检验', tag: 'success' }
  },
  /** 检查结果状态 examination.result_status (0待检 1已检 2已出报告) */
  examResultStatus: {
    0: { label: '待检', tag: 'warning' },
    1: { label: '已检待报告', tag: 'primary' },
    2: { label: '已出报告', tag: 'success' }
  },
  /** 过敏类型 allergy_history.allergy_type (1药物 2食物 3其他) */
  allergyType: {
    1: { label: '药物', tag: 'danger' },
    2: { label: '食物', tag: 'warning' },
    3: { label: '其他', tag: 'info' }
  },
  /** 诊断类型 diagnosis.diagnosis_type (1入院诊断 2主要诊断 3其他诊断) */
  diagnosisType: {
    1: { label: '入院诊断', tag: 'primary' },
    2: { label: '主要诊断', tag: 'danger' },
    3: { label: '其他诊断', tag: 'info' }
  },
  /** 收费项目类别 charge_item.item_category (1药品 2检查 3检验 4治疗 5床位 6护理 7其他) */
  chargeCategory: {
    1: { label: '药品' },
    2: { label: '检查' },
    3: { label: '检验' },
    4: { label: '治疗' },
    5: { label: '床位' },
    6: { label: '护理' },
    7: { label: '其他' }
  },
  /** 费用状态 fee_detail.fee_status (0待结算 1已结算 2已退费) */
  feeStatus: {
    0: { label: '待结算', tag: 'warning' },
    1: { label: '已结算', tag: 'success' },
    2: { label: '已退费', tag: 'info' }
  },
  /** 预缴金类型 deposit.deposit_type (1预缴 2退费) */
  depositType: {
    1: { label: '预缴', tag: 'success' },
    2: { label: '退费', tag: 'info' }
  },
  /** 支付方式 deposit.pay_method (1现金 2银行卡 3微信 4支付宝) */
  payMethod: {
    1: { label: '现金' },
    2: { label: '银行卡' },
    3: { label: '微信' },
    4: { label: '支付宝' }
  },
  /** 餐次 diet_plan.meal_time / meal_order.meal_time (1早餐 2午餐 3晚餐 4加餐) */
  mealTime: {
    1: { label: '早餐', tag: 'warning' },
    2: { label: '午餐', tag: 'success' },
    3: { label: '晚餐', tag: 'primary' },
    4: { label: '加餐', tag: 'info' }
  },
  /** 餐品类别 dish.dish_category (1主食 2菜品 3汤类 4饮品 5水果) */
  dishCategory: {
    1: { label: '主食' },
    2: { label: '菜品' },
    3: { label: '汤类' },
    4: { label: '饮品' },
    5: { label: '水果' }
  },
  /** 点餐订单状态 meal_order.status (0待确认 1已确认 2已配送 3已取消) */
  mealOrderStatus: {
    0: { label: '待确认', tag: 'warning' },
    1: { label: '已确认', tag: 'primary' },
    2: { label: '已配送', tag: 'success' },
    3: { label: '已取消', tag: 'info' }
  },
  /** 班次 duty_schedule.shift_type (1白班 2夜班 3中班) */
  shiftType: {
    1: { label: '白班', tag: 'success' },
    2: { label: '夜班', tag: 'info' },
    3: { label: '中班', tag: 'warning' }
  },
  /** 宣教类型 health_education.edu_type (1疾病知识 2康复指导 3用药指导 4出院须知) */
  eduType: {
    1: { label: '疾病知识', tag: 'primary' },
    2: { label: '康复指导', tag: 'success' },
    3: { label: '用药指导', tag: 'warning' },
    4: { label: '出院须知', tag: 'info' }
  },
  /** 通知类型 notice.notice_type (1院内通知 2病区通知 3紧急公告) */
  noticeType: {
    1: { label: '院内通知', tag: 'primary' },
    2: { label: '病区通知', tag: 'success' },
    3: { label: '紧急公告', tag: 'danger' }
  },
  /** 医嘱频次 medical_order.frequency VARCHAR(50) 频次缩写释义 */
  orderFrequency: {
    qd: { label: '每日 1 次' },
    bid: { label: '每日 2 次' },
    tid: { label: '每日 3 次' },
    qn: { label: '每晚 1 次' },
    qw: { label: '每周 1 次' },
    st: { label: '立即执行' }
  }
}

/** 获取字典文案 */
export function getLabel(dictName, value) {
  const dict = DICTS[dictName]
  if (!dict || value === null || value === undefined) return '-'
  return dict[value]?.label ?? String(value)
}

/** 获取字典标签颜色 */
export function getTag(dictName, value) {
  const dict = DICTS[dictName]
  return dict?.[value]?.tag || 'info'
}

/** 获取字典下拉选项 */
export function getOptions(dictName) {
  const dict = DICTS[dictName] || {}
  return Object.entries(dict).map(([value, item]) => ({
    value: Number.isNaN(Number(value)) ? value : Number(value),
    label: item.label
  }))
}

export default DICTS
