// 一级市场融资轮次种子数据：2024–2025 公开报道整理（金额/估值为约数，单位 USD）
// 覆盖中国 / 美国 / 欧洲 / 日本 / 印度，天使轮 → VC → PE → Pre-IPO 全阶段
export type FundingSeed = {
  company: string
  companyEn: string
  market: 'CN' | 'US' | 'EU' | 'JP' | 'IN' | 'OTHER'
  sector: string
  stage: 'angel' | 'seed' | 'a' | 'b' | 'c' | 'pe' | 'preipo'
  roundLabel: string
  date: string
  amountUsd: number | null
  valuationUsd: number | null
  leadInvestors: string
  desc: string
  tags: string[]
}

export const FUNDING_SEED: FundingSeed[] = [
  // ============ 中国 ============
  {
    company: '月之暗面', companyEn: 'Moonshot AI (Kimi)', market: 'CN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮及后续', date: '2024-02', amountUsd: 1.0e9, valuationUsd: 3.3e9,
    leadInvestors: '阿里巴巴、红杉中国、腾讯等', desc: '大模型「Kimi」，长上下文与 C 端流量标杆', tags: ['大模型', 'AI', 'C端'],
  },
  {
    company: '智谱AI', companyEn: 'Zhipu AI (GLM)', market: 'CN', sector: 'tech',
    stage: 'c', roundLabel: 'C轮及战略轮', date: '2024-09', amountUsd: 4.0e8, valuationUsd: 2.8e9,
    leadInvestors: '北京市人工智能产业投资基金、中关村科学城等', desc: 'GLM 系列大模型，ToB 生态与国产化标杆', tags: ['大模型', 'AI', 'ToB'],
  },
  {
    company: 'MiniMax', companyEn: 'MiniMax', market: 'CN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-03', amountUsd: 6.0e8, valuationUsd: 2.5e9,
    leadInvestors: '阿里巴巴', desc: '多模态大模型：海螺 AI、Talkie，海外收入领先', tags: ['大模型', '多模态', '出海'],
  },
  {
    company: '百川智能', companyEn: 'Baichuan AI', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-07', amountUsd: 7.0e8, valuationUsd: 2.8e9,
    leadInvestors: '北京、上海两地 AI 产业基金等', desc: '搜狗王小川创办，聚焦医疗大模型', tags: ['大模型', '医疗AI'],
  },
  {
    company: '阶跃星辰', companyEn: 'StepFun', market: 'CN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-08', amountUsd: 3.0e8, valuationUsd: 2.0e9,
    leadInvestors: '上海国资、腾讯、达晨等', desc: 'Step 系列多模态大模型，AI 视频生成见长', tags: ['大模型', '多模态', '视频生成'],
  },
  {
    company: '深度求索', companyEn: 'DeepSeek', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: '自研孵化（未外部融资）', date: '2024-01', amountUsd: null, valuationUsd: null,
    leadInvestors: '幻方量化（全资孵化）', desc: '以极低训练成本做出顶级推理模型；未接受外部融资——一级市场中罕见的高效样本', tags: ['大模型', '推理', '高效训练'],
  },
  {
    company: '宇树科技', companyEn: 'Unitree Robotics', market: 'CN', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2025-06', amountUsd: 3.0e8, valuationUsd: 1.4e9,
    leadInvestors: '中国移动基金、腾讯、阿里、蚂蚁、吉利等', desc: '四足/人形机器人出货量全球头部，IPO 辅导启动', tags: ['机器人', '人形机器人', '具身智能'],
  },
  {
    company: '智元机器人', companyEn: 'Agibot', market: 'CN', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮系列', date: '2025-03', amountUsd: null, valuationUsd: 2.1e9,
    leadInvestors: '腾讯、比亚迪、北汽、京东等', desc: '稚晖君创办，具身智能机器人「远征/灵犀」系列', tags: ['机器人', '具身智能'],
  },
  {
    company: '银河通用', companyEn: 'Galbot', market: 'CN', sector: 'industrial',
    stage: 'angel', roundLabel: '天使+轮', date: '2024-06', amountUsd: 1.0e8, valuationUsd: null,
    leadInvestors: '美团', desc: '具身大模型 + 零售无人值守站，天使轮即 7 亿元', tags: ['机器人', '具身智能', '零售'],
  },
  {
    company: '它石智航', companyEn: 'TARS Robotics', market: 'CN', sector: 'industrial',
    stage: 'angel', roundLabel: '天使轮', date: '2025-03', amountUsd: 8.4e7, valuationUsd: null,
    leadInvestors: 'IDG资本、蓝驰创投等', desc: '具身智能领域近年最大天使轮之一（约 6 亿元）', tags: ['机器人', '具身智能'],
  },
  {
    company: '长鑫存储', companyEn: 'CXMT', market: 'CN', sector: 'tech',
    stage: 'pe', roundLabel: 'PE轮（战略）', date: '2024-03', amountUsd: 1.5e9, valuationUsd: 1.9e10,
    leadInvestors: '国家集成电路产业基金等', desc: 'DRAM 存储晶圆厂，国产存储主力，IPO 辅导中', tags: ['半导体', '存储', 'DRAM'],
  },
  {
    company: '荣耀终端', companyEn: 'HONOR', market: 'CN', sector: 'consumer',
    stage: 'preipo', roundLabel: 'Pre-IPO', date: '2024-11', amountUsd: null, valuationUsd: 1.4e10,
    leadInvestors: '中国电信、中金资本、基石资本等', desc: '华为前子品牌独立后股改完成，启动 IPO 辅导', tags: ['手机', '消费电子', 'AI终端'],
  },
  // ============ 美国 ============
  {
    company: 'OpenAI', companyEn: 'OpenAI', market: 'US', sector: 'tech',
    stage: 'pe', roundLabel: 'PE轮（成长期）', date: '2025-03', amountUsd: 4.0e10, valuationUsd: 3.0e11,
    leadInvestors: '软银', desc: 'ChatGPT 母公司，「星际之门」万亿美元算力计划', tags: ['大模型', 'AI', 'ChatGPT'],
  },
  {
    company: 'Anthropic', companyEn: 'Anthropic', market: 'US', sector: 'tech',
    stage: 'pe', roundLabel: 'PE轮（成长期）', date: '2025-09', amountUsd: 1.3e10, valuationUsd: 1.83e11,
    leadInvestors: 'ICONIQ', desc: 'Claude 系列模型，企业级与安全路线', tags: ['大模型', 'AI', 'Claude'],
  },
  {
    company: 'xAI', companyEn: 'xAI', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2024-12', amountUsd: 6.0e9, valuationUsd: 4.0e10,
    leadInvestors: 'a16z、红杉等', desc: 'Grok 模型 + Colossus 超算集群', tags: ['大模型', 'AI', '算力'],
  },
  {
    company: 'Databricks', companyEn: 'Databricks', market: 'US', sector: 'tech',
    stage: 'pe', roundLabel: 'J轮', date: '2024-12', amountUsd: 1.0e10, valuationUsd: 6.2e10,
    leadInvestors: 'Thrive Capital', desc: '数据与 AI 平台（湖仓一体 + MosaicML），IPO 前最大私募轮之一', tags: ['数据平台', 'AI', 'SaaS'],
  },
  {
    company: '安杜里尔', companyEn: 'Anduril Industries', market: 'US', sector: 'industrial',
    stage: 'pe', roundLabel: 'PE轮（成长期）', date: '2025-06', amountUsd: 2.5e9, valuationUsd: 3.05e10,
    leadInvestors: 'Founders Fund', desc: 'AI 军工（Lattice 操作系统），重新武装硅谷', tags: ['军工', 'AI', '国防科技'],
  },
  {
    company: '太空探索', companyEn: 'SpaceX', market: 'US', sector: 'industrial',
    stage: 'pe', roundLabel: '员工股要约（PE）', date: '2024-12', amountUsd: 3.5e8, valuationUsd: 3.5e11,
    leadInvestors: '员工股要约收购', desc: '星舰 + 星链，全球估值最高的私营公司', tags: ['航天', '卫星', '星链'],
  },
  {
    company: 'Perplexity', companyEn: 'Perplexity AI', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2024-12', amountUsd: 5.0e8, valuationUsd: 9.0e9,
    leadInvestors: 'NEA、IVP 等', desc: 'AI 搜索引擎，挑战 Google 的答案机器', tags: ['AI搜索', '大模型', 'C端'],
  },
  {
    company: 'Figure AI', companyEn: 'Figure AI', market: 'US', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2025-09', amountUsd: 1.0e9, valuationUsd: 3.9e10,
    leadInvestors: 'Parkway Venture Capital', desc: '人形机器人 Figure 系列，宝马产线部署', tags: ['机器人', '人形机器人', '具身智能'],
  },
  {
    company: '思维机器', companyEn: 'Thinking Machines Lab', market: 'US', sector: 'tech',
    stage: 'seed', roundLabel: '种子轮', date: '2025-07', amountUsd: 2.0e9, valuationUsd: 1.2e10,
    leadInvestors: 'a16z', desc: '前 OpenAI CTO Mira Murati 创办，史上最大种子轮', tags: ['大模型', 'AI', '多模态'],
  },
  {
    company: '安全超级智能', companyEn: 'Safe Superintelligence (SSI)', market: 'US', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2025-04', amountUsd: 2.0e9, valuationUsd: 3.2e10,
    leadInvestors: 'Greenoaks', desc: 'Ilya Sutskever 创办，只做一件事：安全的超级智能', tags: ['大模型', 'AI', '安全'],
  },
  {
    company: '实体智能', companyEn: 'Physical Intelligence', market: 'US', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮', date: '2024-11', amountUsd: 4.0e8, valuationUsd: 2.4e9,
    leadInvestors: 'Bezos Expeditions、Thrive、OpenAI', desc: '通用机器人基座模型 π0——机器人界的 GPT 时刻', tags: ['机器人', '具身智能', '基座模型'],
  },
  {
    company: 'Cursor', companyEn: 'Anysphere (Cursor)', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'D轮', date: '2025-11', amountUsd: 2.3e9, valuationUsd: 2.93e10,
    leadInvestors: 'Accel、Coatue', desc: 'AI 编程工具，史上 ARR 从 0 到 10 亿美元最快的软件公司之一', tags: ['AI编程', 'SaaS', '开发者'],
  },
  {
    company: 'Ramp', companyEn: 'Ramp', market: 'US', sector: 'finance',
    stage: 'c', roundLabel: 'C轮系列', date: '2025-04', amountUsd: 2.0e8, valuationUsd: 1.3e10,
    leadInvestors: 'Founders Fund', desc: '企业支出管理 + AI 财务自动化', tags: ['金融科技', 'SaaS', '企业服务'],
  },
  {
    company: 'Waymo', companyEn: 'Waymo', market: 'US', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮（战略）', date: '2024-10', amountUsd: 5.6e9, valuationUsd: 4.5e10,
    leadInvestors: 'a16z、Fidelity、Alphabet', desc: 'Robotaxi 商业化领跑者（Alphabet 分拆）', tags: ['自动驾驶', 'Robotaxi'],
  },
  {
    company: 'Scale AI', companyEn: 'Scale AI', market: 'US', sector: 'tech',
    stage: 'pe', roundLabel: '战略投资（49%控股）', date: '2025-05', amountUsd: 1.43e10, valuationUsd: 2.9e10,
    leadInvestors: 'Meta', desc: '数据标注与评估龙头；Meta 以近半控股进入——一级市场股权结构设计案例', tags: ['数据', 'AI基础设施'],
  },
  // ============ 欧洲 ============
  {
    company: 'Mistral AI', companyEn: 'Mistral AI', market: 'EU', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2025-09', amountUsd: 1.7e9, valuationUsd: 1.37e10,
    leadInvestors: 'ASML（领投并成为最大股东）', desc: '欧洲大模型旗手，Le Chat；光刻巨头 ASML 战略入股', tags: ['大模型', '欧洲AI', '主权AI'],
  },
  {
    company: 'Helsing', companyEn: 'Helsing', market: 'EU', sector: 'industrial',
    stage: 'pe', roundLabel: 'D轮', date: '2025-06', amountUsd: 6.0e8, valuationUsd: 1.2e10,
    leadInvestors: '公开报道未披露领投方', desc: '欧洲 AI 军工（慕尼黑），防务 AI 平台', tags: ['军工', 'AI', '欧洲防务'],
  },
  {
    company: 'DeepL', companyEn: 'DeepL', market: 'EU', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-05', amountUsd: 3.0e8, valuationUsd: 2.0e9,
    leadInvestors: 'Index Ventures', desc: '机器翻译/写作质量标杆，欧洲 AI 应用龙头', tags: ['机器翻译', 'AI应用'],
  },
  {
    company: 'Wayve', companyEn: 'Wayve', market: 'EU', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2024-05', amountUsd: 1.05e9, valuationUsd: null,
    leadInvestors: '软银', desc: '端到端自动驾驶（伦敦），欧洲最大 AI 轮之一', tags: ['自动驾驶', '端到端'],
  },
  {
    company: 'Aleph Alpha', companyEn: 'Aleph Alpha', market: 'EU', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2023-11', amountUsd: 5.0e8, valuationUsd: null,
    leadInvestors: 'Schwarz 集团、Bosch、SAP 等产业联盟', desc: '欧洲主权 AI 尝试，后转向政府与企业交付', tags: ['大模型', '主权AI', 'B2G'],
  },
  // ============ 日本 ============
  {
    company: 'Sakana AI', companyEn: 'Sakana AI', market: 'JP', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-09', amountUsd: 1.0e8, valuationUsd: null,
    leadInvestors: 'Lux Capital、Khosla、英伟达', desc: '东京大学团队，进化式模型合并路线，日本 AI 旗舰', tags: ['大模型', '日本AI'],
  },
  // ============ 印度 ============
  {
    company: 'Zepto', companyEn: 'Zepto', market: 'IN', sector: 'consumer',
    stage: 'c', roundLabel: 'G轮', date: '2024-11', amountUsd: 1.35e9, valuationUsd: 5.0e9,
    leadInvestors: 'Motilal Oswal、Lightspeed 等', desc: '印度 10 分钟即时零售，IPO 前冲刺', tags: ['即时零售', '电商', '印度'],
  },
]
