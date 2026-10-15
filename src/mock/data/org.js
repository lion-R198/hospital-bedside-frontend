/**
 * 模拟数据 - 组织架构与人员
 * 字段命名与 schema.sql 表结构一一对应（驼峰化），
 * 后续对接真实 API 时可直接映射为后端实体 VO。
 */
import { dayOffset } from '../utils/date'

/** 医院 hospital */
export const hospital = {
  id: 1,
  hospitalName: '仁和康复医院',
  hospitalCode: 'RHYY001',
  hospitalLevel: '二级',
  introduction:
    '仁和康复医院是一所集医疗、康复、护理、养老于一体的二级康复专科医院，开设内科、外科、康复医学科、中医科等十余个临床科室。医院秉承「以患者为中心」的服务理念，配备先进的康复诊疗设备与专业的医护团队，为患者提供全周期的健康服务。',
  address: '青云市槐荫区康宁路 88 号',
  contactPhone: '0888-6612345',
  status: 1
}

/** 科室 department */
export const departments = [
  { id: 1, hospitalId: 1, deptName: '呼吸内科', deptCode: 'NK-HX', introduction: '诊治呼吸系统常见病、多发病，如肺炎、慢性阻塞性肺疾病、支气管哮喘等。', director: '陈国华', contactPhone: '0888-6612001', sortOrder: 1 },
  { id: 2, hospitalId: 1, deptName: '内分泌科', deptCode: 'NK-NFM', introduction: '诊治糖尿病、甲状腺疾病、骨质疏松等内分泌代谢性疾病。', director: '李明哲', contactPhone: '0888-6612002', sortOrder: 2 },
  { id: 3, hospitalId: 1, deptName: '康复医学科', deptCode: 'KF-YX', introduction: '开展神经康复、骨科康复、老年康复等康复治疗项目。', director: '周正涛', contactPhone: '0888-6612003', sortOrder: 3 }
]

/** 病区 ward */
export const wards = [
  { id: 1, departmentId: 2, wardName: '内科一病区', wardNo: 'A01', floor: '3楼', location: '住院部 3 楼东侧' },
  { id: 2, departmentId: 1, wardName: '内科二病区', wardNo: 'A02', floor: '4楼', location: '住院部 4 楼西侧' }
]

/** 床位 bed */
export const beds = [
  { id: 1, wardId: 1, roomNo: '305', bedNo: '1', bedStatus: 0 },
  { id: 2, wardId: 1, roomNo: '305', bedNo: '2', bedStatus: 1 },
  { id: 3, wardId: 1, roomNo: '306', bedNo: '1', bedStatus: 1 },
  { id: 4, wardId: 1, roomNo: '306', bedNo: '2', bedStatus: 2 }
]

/** 医护人员 medical_staff */
export const medicalStaffs = [
  { id: 1, staffNo: 'D2001', name: '陈国华', gender: 'M', staffType: 1, title: '主任医师', departmentId: 2, wardId: null, phone: '13800000001', specialty: '糖尿病及其并发症的综合诊治，从业 28 年' },
  { id: 2, staffNo: 'D2015', name: '李明哲', gender: 'M', staffType: 1, title: '主治医师', departmentId: 2, wardId: null, phone: '13800000002', specialty: '甲状腺疾病、血脂异常、肥胖管理' },
  { id: 3, staffNo: 'N1008', name: '刘晓燕', gender: 'F', staffType: 2, title: '护师', departmentId: null, wardId: 1, phone: '13900000003', specialty: '内分泌科专科护理、糖尿病健康教育' },
  { id: 4, staffNo: 'N1002', name: '张丽', gender: 'F', staffType: 2, title: '主管护师', departmentId: null, wardId: 1, phone: '13900000004', specialty: '慢病管理、老年患者护理' }
]

/** 患者 patient */
export const patient = {
  id: 1,
  patientNo: 'ZY2026-008721',
  name: '王建华',
  gender: 'M',
  birthDate: '1961-03-18',
  idCard: '530102196103185211',
  phone: '13755667788',
  address: '青云市槐荫区幸福小区 12 栋 2 单元 501',
  admissionDate: dayOffset(-9) + ' 10:20:00',
  dischargeDate: null,
  departmentId: 2,
  wardId: 1,
  bedId: 2,
  diagnosisSummary: '2 型糖尿病伴血糖控制不佳；原发性高血压 2 级（中危）',
  status: 0
}

/** 患者-责任医护 patient_staff */
export const patientStaffs = [
  { id: 1, patientId: 1, staffId: 1, relationType: 1, isPrimary: 1 },
  { id: 2, patientId: 1, staffId: 2, relationType: 1, isPrimary: 0 },
  { id: 3, patientId: 1, staffId: 4, relationType: 2, isPrimary: 1 },
  { id: 4, patientId: 1, staffId: 3, relationType: 2, isPrimary: 0 }
]

/** 家属/紧急联系人 family_contact */
export const familyContacts = [
  { id: 1, patientId: 1, name: '王秀英', relation: '配偶', phone: '13811223344', isEmergency: 1 },
  { id: 2, patientId: 1, name: '王磊', relation: '子女', phone: '13955667788', isEmergency: 0 }
]

/** 系统账号 sys_user（密码为模拟环境明文，真实环境为 BCrypt 加密存储） */
export const sysUsers = [
  { id: 1, username: 'patient01', password: '123456', realName: '王建华', roleType: 1, patientId: 1, staffId: null, phone: '13755667788', status: 1 },
  { id: 2, username: 'family01', password: '123456', realName: '王磊', roleType: 2, patientId: 1, staffId: null, phone: '13955667788', status: 1 },
  { id: 3, username: 'doctor01', password: '123456', realName: '陈国华', roleType: 3, patientId: null, staffId: 1, phone: '13800000001', status: 1 },
  { id: 4, username: 'nurse01', password: '123456', realName: '张丽', roleType: 4, patientId: null, staffId: 4, phone: '13900000004', status: 1 },
  { id: 5, username: 'admin', password: '123456', realName: '系统管理员', roleType: 5, patientId: null, staffId: null, phone: '0888-6612345', status: 1 }
]
