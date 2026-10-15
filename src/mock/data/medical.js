/**
 * 模拟数据 - 医疗数据域（药品、医嘱、检查检验、体征、诊断、过敏史）
 * 枚举取值与 schema.sql 注释严格对齐
 */
import { dayOffset, today } from '../utils/date'

/** 药品字典 drug */
export const drugs = [
  { id: 1, drugCode: 'YP0001', drugName: '盐酸二甲双胍缓释片', genericName: '盐酸二甲双胍', spec: '0.5g*30片', unit: '盒', manufacturer: '华东医药', price: 18.5 },
  { id: 2, drugCode: 'YP0002', drugName: '格列美脲片', genericName: '格列美脲', spec: '2mg*24片', unit: '盒', manufacturer: '赛诺菲', price: 32.4 },
  { id: 3, drugCode: 'YP0003', drugName: '苯磺酸氨氯地平片', genericName: '氨氯地平', spec: '5mg*28片', unit: '盒', manufacturer: '辉瑞', price: 41.8 },
  { id: 4, drugCode: 'YP0004', drugName: '阿托伐他汀钙片', genericName: '阿托伐他汀', spec: '20mg*7片', unit: '盒', manufacturer: '辉瑞', price: 55.6 },
  { id: 5, drugCode: 'YP0005', drugName: '0.9%氯化钠注射液', genericName: '氯化钠', spec: '250ml', unit: '袋', manufacturer: '科伦药业', price: 3.2 }
]

/**
 * 医嘱 medical_order
 * orderType: 1长期 2临时；orderCategory: 1用药 2治疗 3护理 4检查 5其他
 * status: 0待执行 1执行中 2已执行 3已停止
 */
export const medicalOrders = [
  { id: 1, orderNo: 'YZ20260901001', patientId: 1, orderType: 1, orderCategory: 1, drugId: 1, orderContent: '盐酸二甲双胍缓释片 0.5g 口服', dosage: '每次 0.5g，每日 2 次，随餐服用', frequency: 'bid', startTime: dayOffset(-9) + ' 08:00:00', endTime: null, doctorId: 1, nurseId: 3, status: 1, remark: '随餐服用，减少胃肠道反应' },
  { id: 2, orderNo: 'YZ20260901002', patientId: 1, orderType: 1, orderCategory: 1, drugId: 2, orderContent: '格列美脲片 2mg 口服', dosage: '每次 2mg，每日 1 次，早餐前', frequency: 'qd', startTime: dayOffset(-9) + ' 07:00:00', endTime: null, doctorId: 1, nurseId: 3, status: 1, remark: '注意监测低血糖反应' },
  { id: 3, orderNo: 'YZ20260901003', patientId: 1, orderType: 1, orderCategory: 1, drugId: 3, orderContent: '苯磺酸氨氯地平片 5mg 口服', dosage: '每次 5mg，每日 1 次', frequency: 'qd', startTime: dayOffset(-8) + ' 08:00:00', endTime: null, doctorId: 1, nurseId: 4, status: 1, remark: '监测血压变化' },
  { id: 4, orderNo: 'YZ20260901004', patientId: 1, orderType: 1, orderCategory: 1, drugId: 4, orderContent: '阿托伐他汀钙片 20mg 口服', dosage: '每次 20mg，每晚 1 次', frequency: 'qn', startTime: dayOffset(-8) + ' 20:00:00', endTime: null, doctorId: 2, nurseId: 4, status: 1, remark: '睡前服用' },
  { id: 5, orderNo: 'YZ20260908005', patientId: 1, orderType: 2, orderCategory: 4, drugId: null, orderContent: '空腹血糖 + 糖化血红蛋白检测', dosage: '晨起空腹采血', frequency: 'st', startTime: dayOffset(-2) + ' 06:00:00', endTime: dayOffset(-2) + ' 07:30:00', doctorId: 1, nurseId: 3, status: 2, remark: '已出结果' },
  { id: 6, orderNo: 'YZ20260909006', patientId: 1, orderType: 2, orderCategory: 2, drugId: null, orderContent: '胰岛素泵动态血糖监测（CGM）安装', dosage: '连续监测 72 小时', frequency: 'st', startTime: today() + ' 09:30:00', endTime: null, doctorId: 2, nurseId: 3, status: 1, remark: '今日 09:30 治疗室进行' },
  { id: 7, orderNo: 'YZ20260910007', patientId: 1, orderType: 2, orderCategory: 1, drugId: 5, orderContent: '0.9%氯化钠注射液 250ml 静脉输液（补液）', dosage: '250ml，每日 1 次', frequency: 'qd', startTime: today() + ' 15:00:00', endTime: null, doctorId: 1, nurseId: null, status: 0, remark: '今日 15:00 执行' },
  { id: 8, orderNo: 'YZ20260905008', patientId: 1, orderType: 1, orderCategory: 3, drugId: null, orderContent: '糖尿病足风险筛查与护理宣教', dosage: '每周 1 次', frequency: 'qw', startTime: dayOffset(-5) + ' 10:00:00', endTime: dayOffset(-5) + ' 11:00:00', doctorId: 2, nurseId: 4, status: 2, remark: '已完成本周期宣教' },
  { id: 9, orderNo: 'YZ20260902009', patientId: 1, orderType: 2, orderCategory: 5, drugId: null, orderContent: '内科疾病饮食健康宣教', dosage: '一次', frequency: 'st', startTime: dayOffset(-8) + ' 14:00:00', endTime: dayOffset(-8) + ' 14:30:00', doctorId: 1, nurseId: 3, status: 2, remark: '' },
  { id: 10, orderNo: 'YZ20260906010', patientId: 1, orderType: 1, orderCategory: 1, drugId: 2, orderContent: '格列美脲片 1mg 口服（剂量调整前方案）', dosage: '每次 1mg，每日 1 次', frequency: 'qd', startTime: dayOffset(-9) + ' 07:00:00', endTime: dayOffset(-2) + ' 07:00:00', doctorId: 1, nurseId: 4, status: 3, remark: '已调整为 2mg 方案' }
]

/**
 * 检查检验 examination
 * examType: 1检查 2检验；resultStatus: 0待检 1已检 2已出报告
 */
export const examinations = [
  { id: 1, examNo: 'JC20260901001', patientId: 1, examType: 2, examName: '血常规（五分类）', examPart: '外周静脉血', scheduledTime: dayOffset(-9) + ' 07:00:00', result: '白细胞 6.2×10⁹/L，血红蛋白 138g/L，血小板 226×10⁹/L，均正常。', resultStatus: 2, doctorId: 1 },
  { id: 2, examNo: 'JC20260901002', patientId: 1, examType: 2, examName: '空腹血糖 + 糖化血红蛋白', examPart: '外周静脉血', scheduledTime: dayOffset(-2) + ' 06:30:00', result: '空腹血糖 8.6mmol/L（偏高）；糖化血红蛋白 8.2%，提示近 3 个月血糖控制欠佳。', resultStatus: 2, doctorId: 1 },
  { id: 3, examNo: 'JC20260901003', patientId: 1, examType: 1, examName: '彩色多普勒超声（腹部）', examPart: '肝胆胰脾肾', scheduledTime: dayOffset(-4) + ' 10:00:00', result: '脂肪肝（轻度），双肾未见明显异常。', resultStatus: 2, doctorId: 2 },
  { id: 4, examNo: 'JC20260910004', patientId: 1, examType: 2, examName: '尿微量白蛋白/肌酐比值', examPart: '尿液', scheduledTime: today() + ' 06:30:00', result: null, resultStatus: 1, doctorId: 1 },
  { id: 5, examNo: 'JC20260911005', patientId: 1, examType: 1, examName: '眼底照相检查', examPart: '双眼', scheduledTime: dayOffset(1) + ' 09:00:00', result: null, resultStatus: 0, doctorId: 2 },
  { id: 6, examNo: 'JC20260911006', patientId: 1, examType: 1, examName: '下肢动脉彩超', examPart: '双下肢', scheduledTime: dayOffset(1) + ' 14:30:00', result: null, resultStatus: 0, doctorId: 1 }
]

/**
 * 体征数据 vital_signs（近 7 天，每日晨间测量，数值呈平稳好转趋势）
 */
function buildVitals() {
  const list = []
  const base = [
    { t: 36.6, p: 78, r: 18, h: 138, l: 86, o: 96.5 },
    { t: 36.5, p: 80, r: 18, h: 136, l: 85, o: 96.8 },
    { t: 36.8, p: 76, r: 19, h: 140, l: 88, o: 96.2 },
    { t: 36.4, p: 79, r: 18, h: 134, l: 84, o: 97.0 },
    { t: 36.6, p: 75, r: 17, h: 132, l: 83, o: 97.2 },
    { t: 36.5, p: 74, r: 17, h: 130, l: 82, o: 97.5 },
    { t: 36.3, p: 72, r: 16, h: 128, l: 80, o: 98.0 }
  ]
  base.forEach((v, i) => {
    list.push({
      id: i + 1,
      patientId: 1,
      measureTime: dayOffset(i - 6) + ' 06:30:00',
      temperature: v.t,
      pulse: v.p,
      respiration: v.r,
      systolicPressure: v.h,
      diastolicPressure: v.l,
      bloodOxygen: v.o,
      recorderId: i % 2 === 0 ? 3 : 4,
      remark: ''
    })
  })
  // 今日午间加测一次
  list.push({
    id: 8,
    patientId: 1,
    measureTime: today() + ' 11:30:00',
    temperature: 36.4,
    pulse: 73,
    respiration: 17,
    systolicPressure: 129,
    diastolicPressure: 81,
    bloodOxygen: 97.8,
    recorderId: 3,
    remark: '午间常规测量'
  })
  return list
}
export const vitalSigns = buildVitals()

/** 诊断记录 diagnosis（diagnosisType: 1入院诊断 2主要诊断 3其他诊断） */
export const diagnoses = [
  { id: 1, patientId: 1, diagnosisType: 1, icdCode: 'E11.9', diagnosisName: '2 型糖尿病', doctorId: 1, diagnosisTime: dayOffset(-9) + ' 11:00:00' },
  { id: 2, patientId: 1, diagnosisType: 2, icdCode: 'E11.6', diagnosisName: '2 型糖尿病伴血糖控制不佳', doctorId: 1, diagnosisTime: dayOffset(-9) + ' 11:05:00' },
  { id: 3, patientId: 1, diagnosisType: 3, icdCode: 'I10', diagnosisName: '原发性高血压 2 级（中危）', doctorId: 1, diagnosisTime: dayOffset(-9) + ' 11:10:00' },
  { id: 4, patientId: 1, diagnosisType: 3, icdCode: 'K76.0', diagnosisName: '轻度脂肪肝', doctorId: 2, diagnosisTime: dayOffset(-4) + ' 15:00:00' }
]

/** 过敏史 allergy_history（allergyType: 1药物 2食物 3其他） */
export const allergyHistories = [
  { id: 1, patientId: 1, allergen: '青霉素类抗生素', allergyType: 1, reaction: '皮疹、瘙痒', severity: '中度', recordTime: dayOffset(-9) + ' 10:40:00' },
  { id: 2, patientId: 1, allergen: '海虾、蟹等甲壳类海鲜', allergyType: 2, reaction: '口唇麻木、全身风团', severity: '重度', recordTime: dayOffset(-9) + ' 10:45:00' }
]
