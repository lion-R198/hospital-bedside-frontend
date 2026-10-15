/**
 * 体征参考区间（医疗业务配置）
 * 与检验科标准一致，用于前端异常标识；后续可由后端配置下发
 */
export const vitalRanges = {
  temperature: { min: 36.0, max: 37.2, unit: '℃', label: '体温' },
  pulse: { min: 60, max: 100, unit: '次/分', label: '脉搏' },
  respiration: { min: 12, max: 20, unit: '次/分', label: '呼吸' },
  systolic: { min: 90, max: 140, unit: 'mmHg', label: '收缩压' },
  diastolic: { min: 60, max: 90, unit: 'mmHg', label: '舒张压' },
  bloodOxygen: { min: 95, max: 100, unit: '%', label: '血氧饱和度' }
}
