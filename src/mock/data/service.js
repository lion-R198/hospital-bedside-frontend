/**
 * 模拟数据 - 费用、生活服务、内容与排班
 * 枚举取值与 schema.sql 注释严格对齐
 */
import { dayOffset, today } from '../utils/date'
import { vitalSigns } from './medical'

/** 收费项目字典 charge_item（itemCategory: 1药品 2检查 3检验 4治疗 5床位 6护理 7其他） */
export const chargeItems = [
  { id: 1, itemCode: 'SF0001', itemName: '盐酸二甲双胍缓释片', itemCategory: 1, price: 18.5, unit: '盒' },
  { id: 2, itemCode: 'SF0002', itemName: '格列美脲片', itemCategory: 1, price: 32.4, unit: '盒' },
  { id: 3, itemCode: 'SF0003', itemName: '苯磺酸氨氯地平片', itemCategory: 1, price: 41.8, unit: '盒' },
  { id: 4, itemCode: 'SF0004', itemName: '血常规（五分类）', itemCategory: 3, price: 25.0, unit: '次' },
  { id: 5, itemCode: 'SF0005', itemName: '糖化血红蛋白测定', itemCategory: 3, price: 72.0, unit: '次' },
  { id: 6, itemCode: 'SF0006', itemName: '彩色多普勒超声（腹部）', itemCategory: 2, price: 180.0, unit: '次' },
  { id: 7, itemCode: 'SF0007', itemName: '动态血糖监测（CGM）', itemCategory: 4, price: 320.0, unit: '日' },
  { id: 8, itemCode: 'SF0008', itemName: '内科三级护理', itemCategory: 6, price: 28.0, unit: '日' },
  { id: 9, itemCode: 'SF0009', itemName: '普通病房床位费（双人间）', itemCategory: 5, price: 60.0, unit: '日' },
  { id: 10, itemCode: 'SF0010', itemName: '住院诊查费（主治医师）', itemCategory: 7, price: 15.0, unit: '日' },
  { id: 11, itemCode: 'SF0011', itemName: '静脉输液（材料+操作）', itemCategory: 4, price: 22.0, unit: '次' },
  { id: 12, itemCode: 'SF0012', itemName: '0.9%氯化钠注射液', itemCategory: 1, price: 3.2, unit: '袋' }
]

/** 生成近 9 天费用明细（床位/护理/诊查按日计费，其余散点） */
function buildFeeDetails() {
  const list = []
  let id = 1
  for (let i = -9; i <= 0; i++) {
    const date = dayOffset(i)
    // 每日固定费用：床位、护理、诊查
    list.push({ id: id++, patientId: 1, chargeItemId: 9, quantity: 1, price: 60.0, amount: 60.0, chargeDate: date, chargeTime: date + ' 08:00:00', feeStatus: i === 0 ? 0 : 1 })
    list.push({ id: id++, patientId: 1, chargeItemId: 8, quantity: 1, price: 28.0, amount: 28.0, chargeDate: date, chargeTime: date + ' 08:00:00', feeStatus: i === 0 ? 0 : 1 })
    list.push({ id: id++, patientId: 1, chargeItemId: 10, quantity: 1, price: 15.0, amount: 15.0, chargeDate: date, chargeTime: date + ' 08:00:00', feeStatus: i === 0 ? 0 : 1 })
  }
  // 药品（入院时领取）
  list.push({ id: id++, patientId: 1, chargeItemId: 1, quantity: 2, price: 18.5, amount: 37.0, chargeDate: dayOffset(-9), chargeTime: dayOffset(-9) + ' 11:30:00', feeStatus: 1 })
  list.push({ id: id++, patientId: 1, chargeItemId: 2, quantity: 1, price: 32.4, amount: 32.4, chargeDate: dayOffset(-9), chargeTime: dayOffset(-9) + ' 11:30:00', feeStatus: 1 })
  list.push({ id: id++, patientId: 1, chargeItemId: 3, quantity: 1, price: 41.8, amount: 41.8, chargeDate: dayOffset(-8), chargeTime: dayOffset(-8) + ' 09:00:00', feeStatus: 1 })
  // 检验/检查
  list.push({ id: id++, patientId: 1, chargeItemId: 4, quantity: 1, price: 25.0, amount: 25.0, chargeDate: dayOffset(-9), chargeTime: dayOffset(-9) + ' 07:10:00', feeStatus: 1 })
  list.push({ id: id++, patientId: 1, chargeItemId: 5, quantity: 1, price: 72.0, amount: 72.0, chargeDate: dayOffset(-2), chargeTime: dayOffset(-2) + ' 07:20:00', feeStatus: 1 })
  list.push({ id: id++, patientId: 1, chargeItemId: 6, quantity: 1, price: 180.0, amount: 180.0, chargeDate: dayOffset(-4), chargeTime: dayOffset(-4) + ' 10:30:00', feeStatus: 1 })
  // 治疗：CGM 安装（今日）
  list.push({ id: id++, patientId: 1, chargeItemId: 7, quantity: 3, price: 320.0, amount: 960.0, chargeDate: today(), chargeTime: today() + ' 09:40:00', feeStatus: 0 })
  return list
}
export const feeDetails = buildFeeDetails()

/** 预缴金记录 deposit（depositType: 1预缴 2退费；payMethod: 1现金 2银行卡 3微信 4支付宝） */
export const deposits = [
  { id: 1, patientId: 1, depositType: 1, amount: 5000.0, payMethod: 3, depositTime: dayOffset(-9) + ' 11:00:00', operatorId: null, remark: '入院预缴（微信）' },
  { id: 2, patientId: 1, depositType: 1, amount: 2000.0, payMethod: 2, depositTime: dayOffset(-3) + ' 15:20:00', operatorId: 4, remark: '补缴预金（住院处刷卡）' }
]

/** 医保信息 insurance_info */
export const insuranceInfo = {
  id: 1,
  patientId: 1,
  insuranceType: '城镇职工基本医疗保险',
  insuranceNo: 'D530102********8821',
  reimbursementRatio: 82.0,
  status: 1
}

/** 餐品字典 dish（dishCategory: 1主食 2菜品 3汤类 4饮品 5水果） */
export const dishes = [
  { id: 1, dishName: '杂粮米饭', dishCategory: 1, price: 4.0, description: '糙米、燕麦混合，升糖更平缓', status: 1 },
  { id: 2, dishName: '荞麦面条', dishCategory: 1, price: 8.0, description: '适合糖尿病患者的低 GI 主食', status: 1 },
  { id: 3, dishName: '清蒸鲈鱼', dishCategory: 2, price: 22.0, description: '优质蛋白，低盐清蒸', status: 1 },
  { id: 4, dishName: '白灼西兰花', dishCategory: 2, price: 9.0, description: '高膳食纤维', status: 1 },
  { id: 5, dishName: '番茄炒蛋', dishCategory: 2, price: 12.0, description: '少油少盐烹制', status: 1 },
  { id: 6, dishName: '清炒莴笋丝', dishCategory: 2, price: 8.0, description: '清爽低脂', status: 1 },
  { id: 7, dishName: '冬瓜排骨汤', dishCategory: 3, price: 15.0, description: '去浮油，低脂', status: 1 },
  { id: 8, dishName: '紫菜蛋花汤', dishCategory: 3, price: 6.0, description: '低盐版本', status: 1 },
  { id: 9, dishName: '无糖豆浆', dishCategory: 4, price: 4.0, description: '无添加蔗糖', status: 1 },
  { id: 10, dishName: '纯牛奶', dishCategory: 4, price: 5.0, description: '250ml/盒', status: 1 },
  { id: 11, dishName: '苹果（半个）', dishCategory: 5, price: 3.5, description: '两餐之间食用', status: 1 },
  { id: 12, dishName: '柚子（2 瓣）', dishCategory: 5, price: 4.0, description: '低糖水果', status: 1 }
]

/**
 * 饮食方案 diet_plan（今日食谱 + 营养方案 + 禁忌）
 * mealTime: 1早餐 2午餐 3晚餐 4加餐
 */
export const dietPlans = [
  { id: 1, patientId: 1, planDate: today(), mealTime: 1, dietType: '糖尿病饮食', content: '无糖豆浆 1 杯、水煮蛋 1 个、杂粮包 1 个（约 50g）、凉拌黄瓜少许', nutritionNote: '热量约 350kcal，碳水 45g，蛋白质 18g', taboo: '禁食白粥、含糖点心' },
  { id: 2, patientId: 1, planDate: today(), mealTime: 2, dietType: '糖尿病饮食', content: '杂粮米饭 100g、清蒸鲈鱼 80g、白灼西兰花 150g、冬瓜排骨汤（去油）', nutritionNote: '热量约 520kcal，碳水 60g，蛋白质 32g', taboo: '忌肥肉、油炸食品' },
  { id: 3, patientId: 1, planDate: today(), mealTime: 3, dietType: '糖尿病饮食·低盐', content: '荞麦面条 100g、番茄炒蛋（少油）、清炒莴笋丝、紫菜蛋花汤', nutritionNote: '热量约 480kcal，全日食盐 <5g', taboo: '忌腌制咸菜、酱料' },
  { id: 4, patientId: 1, planDate: today(), mealTime: 4, dietType: '加餐', content: '苹果半个（15:30 食用）或无糖酸奶 1 杯', nutritionNote: '热量控制在 100kcal 以内', taboo: '禁食蛋糕、饼干、糖果' }
]

/** 营养方案说明（营养师制定） */
export const nutritionPlan = {
  dietType: '糖尿病饮食 + 低盐低脂饮食',
  dailyCalorie: 1600,
  nutritionist: '临床营养科 会诊意见',
  suggestion:
    '1. 三餐定时定量，主食粗细搭配（全谷物占 1/3 以上）；2. 每餐蔬菜摄入不少于 150g，优先深色蔬菜；3. 蛋白质以鱼、瘦肉、豆制品、脱脂奶为主；4. 烹调以蒸、煮、炖为主，全日烹调油 <25g，食盐 <5g；5. 血糖波动期间请在两餐之间加餐，预防低血糖；6. 严格禁酒。'
}

/** 饮食禁忌 */
export const dietTaboos = [
  { name: '高糖食物', detail: '白糖、蜂蜜、含糖饮料、糕点、果酱等，易引起血糖快速升高。' },
  { name: '高盐食物', detail: '咸菜、腊肉、酱制品等，合并高血压需全日食盐控制在 5g 以内。' },
  { name: '高脂油炸食物', detail: '油炸食品、动物内脏、肥肉，加重血脂异常与脂肪肝。' },
  { name: '过敏食物', detail: '海虾、蟹等甲壳类海鲜（既往有重度过敏史，严禁食用）。' }
]

/** 点餐订单（今日午餐已下单） */
export const mealOrders = [
  {
    id: 1,
    orderNo: 'DC202609100001',
    patientId: 1,
    orderDate: today(),
    mealTime: 2,
    totalAmount: 42.0,
    status: 1,
    items: [
      { id: 1, orderId: 1, dishId: 1, dishName: '杂粮米饭', quantity: 1, price: 4.0, amount: 4.0 },
      { id: 2, orderId: 1, dishId: 3, dishName: '清蒸鲈鱼', quantity: 1, price: 22.0, amount: 22.0 },
      { id: 3, orderId: 1, dishId: 4, dishName: '白灼西兰花', quantity: 1, price: 9.0, amount: 9.0 },
      { id: 4, orderId: 1, dishId: 7, dishName: '冬瓜排骨汤', quantity: 1, price: 7.0, amount: 7.0 }
    ]
  }
]

/** 排班表 duty_schedule（本周责任医护排班，shiftType: 1白班 2夜班 3中班） */
function buildDutySchedules() {
  const list = []
  let id = 1
  const plan = [
    { staffId: 4, shifts: [[1, '08:00', '17:00'], [1, '08:00', '17:00'], [3, '12:00', '20:00'], [1, '08:00', '17:00'], [1, '08:00', '17:00'], [2, '20:00', '08:00'], null] },
    { staffId: 3, shifts: [[2, '20:00', '08:00'], null, [1, '08:00', '17:00'], [1, '08:00', '17:00'], [3, '12:00', '20:00'], [1, '08:00', '17:00'], [1, '08:00', '17:00']] },
    { staffId: 1, shifts: [[1, '08:30', '12:00'], [1, '08:30', '12:00'], null, [1, '08:30', '12:00'], [1, '08:30', '12:00'], null, null] },
    { staffId: 2, shifts: [null, [1, '14:00', '18:00'], [1, '14:00', '18:00'], null, [1, '14:00', '18:00'], [1, '09:00', '12:00'], null] }
  ]
  // 以周一为起点的本周
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  plan.forEach(({ staffId, shifts }) => {
    shifts.forEach((s, idx) => {
      if (!s) return
      const d = new Date(monday)
      d.setDate(monday.getDate() + idx)
      const pad = (n) => String(n).padStart(2, '0')
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      list.push({ id: id++, staffId, wardId: 1, dutyDate: dateStr, shiftType: s[0], startTime: s[1], endTime: s[2] })
    })
  })
  return list
}
export const dutySchedules = buildDutySchedules()

/** 健康宣教 health_education（eduType: 1疾病知识 2康复指导 3用药指导 4出院须知） */
export const healthEducations = [
  { id: 1, title: '认识 2 型糖尿病：血糖为什么会升高', eduType: 1, departmentId: 2, diseaseName: '2 型糖尿病', content: '2 型糖尿病是最常见的糖尿病类型，主要由于胰岛素抵抗合并胰岛素分泌不足所致。长期高血糖可损害眼、肾、神经、心血管等器官。控制血糖的「五驾马车」：饮食管理、合理运动、药物治疗、血糖监测、糖尿病教育。住院期间医护人员将帮助您掌握血糖自我管理的基本方法。', publisherId: 1, publishTime: dayOffset(-9) + ' 15:00:00', status: 1, viewCount: 128 },
  { id: 2, title: '高血压患者日常血压管理要点', eduType: 1, departmentId: 2, diseaseName: '原发性高血压', content: '1. 每日固定时间测量血压并记录；2. 严格遵医嘱服药，不可自行停药或减量；3. 全日食盐摄入 <5g；4. 戒烟限酒，保持情绪平稳；5. 血压持续 ≥160/100mmHg 或伴胸闷、头痛加重时，及时告知医护人员。', publisherId: 2, publishTime: dayOffset(-8) + ' 10:00:00', status: 1, viewCount: 96 },
  { id: 3, title: '糖尿病患者的安全运动与康复建议', eduType: 2, departmentId: 2, diseaseName: '2 型糖尿病', content: '推荐餐后 1 小时进行中等强度有氧运动（如散步、太极拳），每次 30 分钟，每周 ≥150 分钟。运动时随身携带糖果预防低血糖；出现心慌、出冷汗应立即停止并进食。避免空腹运动，足部有伤口时暂停步行类运动。', publisherId: 1, publishTime: dayOffset(-6) + ' 09:30:00', status: 1, viewCount: 74 },
  { id: 4, title: '出院后血糖自我监测与随访指导', eduType: 2, departmentId: 2, diseaseName: '2 型糖尿病', content: '出院后建议：血糖平稳期每周监测 2-4 次空腹及餐后 2 小时血糖；每 3 个月复查糖化血红蛋白；每 6-12 个月复查眼底、尿微量白蛋白、下肢动脉彩超。出院后 2 周内分泌科门诊随访，携带出院小结与血糖记录本。', publisherId: 1, publishTime: dayOffset(-5) + ' 14:00:00', status: 1, viewCount: 61 },
  { id: 5, title: '降糖药物服药时间与注意事项', eduType: 3, departmentId: 2, diseaseName: '2 型糖尿病', content: '二甲双胍缓释片随餐或餐后服用，减少胃肠道反应；格列美脲早餐前即刻服用，服药后必须按时进餐，警惕心慌、出汗、手抖等低血糖症状；他汀类药物晚餐后服用。如漏服请勿下次双倍补服。', publisherId: 2, publishTime: dayOffset(-7) + ' 16:00:00', status: 1, viewCount: 89 },
  { id: 6, title: '胰岛素注射相关注意事项', eduType: 3, departmentId: 2, diseaseName: '2 型糖尿病', content: '注射部位轮换选择腹部（脐周 5cm 以外）、大腿外侧、上臂外侧；每针间隔 1cm 以上；针头一次性使用；未开封胰岛素冷藏保存（2-8℃），已开封常温保存不超过 28 天。', publisherId: 2, publishTime: dayOffset(-4) + ' 11:00:00', status: 1, viewCount: 52 },
  { id: 7, title: '出院手续办理流程与须知', eduType: 4, departmentId: 2, diseaseName: null, content: '医生开具出院医嘱后：1. 护士站领取出院小结与带药；2. 携预缴金收据至住院处结算（支持医保实时结算）；3. 医保结算后多缴款项原路退回；4. 完善个人信息登记，加入病区随访群。办理时间：工作日 08:00-17:30。', publisherId: 4, publishTime: dayOffset(-3) + ' 09:00:00', status: 1, viewCount: 145 },
  { id: 8, title: '出院后复查与紧急情况处理', eduType: 4, departmentId: 2, diseaseName: null, content: '如出现：持续高热（≥38.5℃）、血糖 ≥16.7mmol/L 或 <3.9mmol/L 伴意识改变、胸闷胸痛、视物模糊加重等情况，请立即就医或拨打 120。复诊时请携带出院小结、出院带药清单与监测记录。', publisherId: 4, publishTime: dayOffset(-3) + ' 09:10:00', status: 1, viewCount: 110 }
]

/** 通知公告 notice（noticeType: 1院内通知 2病区通知 3紧急公告） */
export const notices = [
  { id: 1, title: '关于病区探视时间的温馨提示', content: '为保障患者休息与医疗安全，病区探视时间为每日 15:00-19:00，每次探视不超过 2 人。请配合做好手卫生，患有呼吸道感染者请勿探视。', noticeType: 1, wardId: null, publisherId: 4, publishTime: dayOffset(-6) + ' 09:00:00', status: 1 },
  { id: 2, title: '内科一病区营养食堂点餐须知', content: '营养食堂提供糖尿病餐、低盐餐等治疗饮食。每日 15:00 前通过床旁终端预订次日三餐；午餐点餐截止时间为当日 09:30。餐食由配餐员按时送达病区。', noticeType: 2, wardId: 1, publisherId: 4, publishTime: dayOffset(-5) + ' 14:30:00', status: 1 },
  { id: 3, title: '本院已开通医保移动支付服务', content: '住院患者及家属可通过床旁终端查询费用明细，结算业务请在住院处办理，支持城镇职工、城乡居民医保实时结算。', noticeType: 1, wardId: null, publisherId: 5, publishTime: dayOffset(-4) + ' 10:00:00', status: 1 },
  { id: 4, title: '明日查房时间调整通知', content: '明日（星期五）内科一病区晨间查房调整为 07:30 开始，请各位患者做好准备；空腹检验项目请保持禁食禁饮至采血完成。', noticeType: 2, wardId: 1, publisherId: 4, publishTime: dayOffset(0) + ' 07:00:00', status: 1 }
]

/** 就诊指南（医院介绍模块） */
export const hospitalGuide = [
  { title: '入院办理流程', steps: ['医生开具住院证', '住院处缴费登记（一楼大厅）', '病区护士站报到', '责任护士入院评估与健康宣教'] },
  { title: '出院办理流程', steps: ['医生查房开具出院医嘱', '护士站领取出院小结及带药', '住院处医保结算与费用结清', '领取预缴金退费、完成随访登记'] },
  { title: '医保结算须知', steps: ['入院 3 日内提供医保卡/电子凭证登记', '出院时在住院处办理实时结算', '自费部分支持现金、银行卡、移动支付'] }
]

/** 楼层分布 */
export const floorMap = [
  { floor: '1 楼', areas: ['门诊大厅', '挂号收费处', '住院处', '药房', '检验科'] },
  { floor: '2 楼', areas: ['内科门诊', '内分泌科门诊', '超声科', '心电图室'] },
  { floor: '3 楼', areas: ['内科一病区（住院部东侧）', '营养食堂配餐间'] },
  { floor: '4 楼', areas: ['内科二病区', '康复治疗大厅'] },
  { floor: '5 楼', areas: ['行政办公区', '会议室'] }
]

/** 体征参考区间统一收敛在 @/config/vitalRanges（业务配置） */
export { vitalRanges } from '@/config/vitalRanges'
