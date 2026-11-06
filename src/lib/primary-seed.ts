// 一级市场融资轮次种子数据：2023–2025 公开报道整理（金额/估值为约数，单位 USD）
// 覆盖中国 / 美国 / 欧洲 / 日本 / 韩国 / 印度 / 东南亚 / 拉美 / 中东非
// 天使轮 → 种子 → A/B/C/D → PE → Pre-IPO 全阶段；AI 资讯抓取（primary-sync）会在其上持续动态补充
export type FundingSeed = {
  company: string
  companyEn: string
  market: 'CN' | 'US' | 'EU' | 'JP' | 'KR' | 'IN' | 'SEA' | 'LATAM' | 'MEA' | 'OTHER'
  sector: string
  stage: 'angel' | 'seed' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'pe' | 'preipo'
  roundLabel: string
  date: string
  amountUsd: number | null
  valuationUsd: number | null
  leadInvestors: string
  desc: string
  tags: string[]
}

export const FUNDING_SEED: FundingSeed[] = [
  // ============ 中国 · AI 大模型 ============
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
    company: '零一万物', companyEn: '01.AI', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2023-11', amountUsd: 3.2e8, valuationUsd: 1.0e9,
    leadInvestors: '创新工场、阿里巴巴等', desc: '李开复创办，Yi 系列开源模型，迅速跻身独角兽', tags: ['大模型', '开源'],
  },
  {
    company: '生数科技', companyEn: 'Shengshu Technology', market: 'CN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-12', amountUsd: 4.2e7, valuationUsd: 4.2e8,
    leadInvestors: '启明创投、达泰资本等', desc: '视频生成大模型 Vidu，清华系团队', tags: ['视频生成', '多模态'],
  },
  {
    company: '爱诗科技', companyEn: 'Aishi Technology (PixVerse)', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮系列', date: '2024-03', amountUsd: 1.4e8, valuationUsd: null,
    leadInvestors: '达晨财智、凯辉基金等', desc: 'AI 视频生成 PixVerse，出海与字节系背景', tags: ['视频生成', 'AIGC'],
  },
  {
    company: '面壁智能', companyEn: 'ModelBest', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮及后续', date: '2024-04', amountUsd: 1.4e8, valuationUsd: null,
    leadInvestors: '春华创投、知乎等', desc: '「小钢炮」端侧高效模型路线，清华 NLP 系', tags: ['大模型', '端侧'],
  },
  {
    company: '硅基流动', companyEn: 'SiliconFlow', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-07', amountUsd: 1.1e8, valuationUsd: null,
    leadInvestors: '创新工场、启明创投等', desc: '一站式大模型推理云（SiliconCloud），AI Infra 稀缺标的', tags: ['AI Infra', '推理云'],
  },
  // ============ 中国 · 机器人 / 具身智能 ============
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
    company: '星动纪元', companyEn: 'Robot Era', market: 'CN', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮系列', date: '2024-08', amountUsd: 4.2e7, valuationUsd: null,
    leadInvestors: '联想创投、金沙江创投等', desc: '清华系人形机器人，全尺寸人形「小星」', tags: ['人形机器人', '具身智能'],
  },
  {
    company: '逐际动力', companyEn: 'LimX Dynamics', market: 'CN', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮系列', date: '2024-05', amountUsd: 2.8e7, valuationUsd: null,
    leadInvestors: '峰瑞资本、绿洲资本等', desc: '全尺寸人形机器人 + 四轮足，运动控制见长', tags: ['人形机器人', '运动控制'],
  },
  {
    company: '帕西尼感知', companyEn: 'PaXini Tech', market: 'CN', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮系列', date: '2024-09', amountUsd: 4.2e7, valuationUsd: null,
    leadInvestors: '蓝驰创投、挚金资本等', desc: '机器人多维触觉传感器头部，具身感知入口', tags: ['传感器', '具身智能'],
  },
  {
    company: '众擎机器人', companyEn: 'EngineAI', market: 'CN', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮', date: '2024-10', amountUsd: 1.4e7, valuationUsd: null,
    leadInvestors: '京东、宁德时代旗下基金等', desc: '人形机器人「SE01」，前空翻等高动态动作出圈', tags: ['人形机器人'],
  },
  {
    company: '云深处科技', companyEn: 'DeepRobotics', market: 'CN', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2024-12', amountUsd: 4.2e7, valuationUsd: null,
    leadInvestors: '国新基金等', desc: '四足机器人电力巡检落地标杆，行业场景出货领先', tags: ['四足机器人', '巡检'],
  },
  // ============ 中国 · 半导体 / 硬科技 ============
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
  {
    company: '壁仞科技', companyEn: 'Biren Technology', market: 'CN', sector: 'tech',
    stage: 'd', roundLabel: 'D轮及战略轮', date: '2024-08', amountUsd: 2.1e8, valuationUsd: 2.1e9,
    leadInvestors: '上海国资、启明创投等', desc: '国产 GPU 大芯片（BR100），启动 IPO 辅导', tags: ['GPU', '半导体'],
  },
  {
    company: '摩尔线程', companyEn: 'Moore Threads', market: 'CN', sector: 'tech',
    stage: 'd', roundLabel: 'D轮及以上', date: '2024-11', amountUsd: 5.6e8, valuationUsd: 2.0e9,
    leadInvestors: '国家集成电路产业投资基金三期等', desc: '全功能国产 GPU，科创板 IPO 获受理', tags: ['GPU', '半导体'],
  },
  {
    company: '沐曦集成电路', companyEn: 'MetaX', market: 'CN', sector: 'tech',
    stage: 'd', roundLabel: 'D轮及Pre-IPO', date: '2024-07', amountUsd: 1.4e8, valuationUsd: null,
    leadInvestors: '上海国资等', desc: '国产 GPGPU 芯片，科创板 IPO 推进中', tags: ['GPGPU', '半导体'],
  },
  {
    company: '燧原科技', companyEn: 'Enflame', market: 'CN', sector: 'tech',
    stage: 'd', roundLabel: 'E轮', date: '2024-08', amountUsd: 2.8e8, valuationUsd: null,
    leadInvestors: '上海市人工智能产业投资基金等', desc: 'AI 训练/推理加速卡，云厂商批量部署', tags: ['AI芯片', '算力'],
  },
  {
    company: '地平线机器人', companyEn: 'Horizon Robotics', market: 'CN', sector: 'industrial',
    stage: 'preipo', roundLabel: 'Pre-IPO', date: '2024-04', amountUsd: 2.2e8, valuationUsd: 8.7e9,
    leadInvestors: '百度、比亚迪、宁德时代等', desc: '智能驾驶芯片龙头，2024 年 10 月港股上市', tags: ['智驾芯片', '自动驾驶'],
  },
  {
    company: '黑芝麻智能', companyEn: 'Black Sesame Technologies', market: 'CN', sector: 'industrial',
    stage: 'preipo', roundLabel: 'Pre-IPO（战略轮）', date: '2024-01', amountUsd: null, valuationUsd: 2.6e9,
    leadInvestors: '小米、博世、吉利等', desc: '车规级大算力芯片，2024 年 8 月港股上市', tags: ['智驾芯片', '半导体'],
  },
  {
    company: '此芯科技', companyEn: 'Cix Technology', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-10', amountUsd: 7.0e7, valuationUsd: null,
    leadInvestors: '联想创投、道禾长期投资等', desc: 'ARM 架构端侧 CPU 芯片，AI PC/边缘计算', tags: ['CPU', '端侧AI'],
  },
  // ============ 中国 · 自动驾驶 / 出行 / 低空 ============
  {
    company: '文远知行', companyEn: 'WeRide', market: 'CN', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮及Pre-IPO', date: '2024-06', amountUsd: null, valuationUsd: 5.1e9,
    leadInvestors: '广汽集团等', desc: 'Robotaxi/Robobus 全球化落地，2024 年 10 月美股上市', tags: ['自动驾驶', 'Robotaxi'],
  },
  {
    company: '小马智行', companyEn: 'Pony.ai', market: 'CN', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮及Pre-IPO', date: '2024-10', amountUsd: 6.7e8, valuationUsd: null,
    leadInvestors: '广汽、沙特 NEOM 基金等', desc: 'Robotaxi 头部，2024 年 11 月美股上市', tags: ['自动驾驶', 'Robotaxi'],
  },
  {
    company: 'Momenta', companyEn: 'Momenta', market: 'CN', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮及战略轮', date: '2024-06', amountUsd: null, valuationUsd: 5.1e9,
    leadInvestors: '上汽、奔驰、腾讯、淡马锡等', desc: '量产智驾方案供应商，配套车企车型最多之一', tags: ['智驾方案', '自动驾驶'],
  },
  {
    company: '沃飞长空', companyEn: 'Aerofugia', market: 'CN', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮系列', date: '2024-11', amountUsd: null, valuationUsd: 1.1e9,
    leadInvestors: '吉利控股旗下基金等', desc: 'eVTOL「AE200」，吉利系低空经济头部', tags: ['eVTOL', '低空经济'],
  },
  {
    company: '峰飞航空', companyEn: 'AutoFlight', market: 'CN', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮及战略轮', date: '2024-08', amountUsd: 1.4e8, valuationUsd: null,
    leadInvestors: '云晖资本、变现猫等', desc: 'eVTOL 盛世龙完成全球首次跨海航线演示飞行', tags: ['eVTOL', '低空经济'],
  },
  // ============ 中国 · 商业航天 / 量子 / 聚变 ============
  {
    company: '蓝箭航天', companyEn: 'LandSpace', market: 'CN', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-12', amountUsd: 1.3e8, valuationUsd: null,
    leadInvestors: '国家军民融合产业基金等', desc: '朱雀三号可回收火箭，商业航天第一梯队，IPO 辅导中', tags: ['商业航天', '火箭'],
  },
  {
    company: '垣信卫星', companyEn: 'Spacesail', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮（战略）', date: '2024-02', amountUsd: 9.7e7, valuationUsd: null,
    leadInvestors: '国开制造业转型升级基金等', desc: '「千帆星座」万颗级低轨卫星组网，对标 Starlink', tags: ['卫星互联网', '星座'],
  },
  {
    company: '中科宇航', companyEn: 'CAS Space', market: 'CN', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2024-09', amountUsd: null, valuationUsd: 1.1e9,
    leadInvestors: '国科投资等', desc: '力箭系列固体火箭，中科宇航力学所背景', tags: ['商业航天', '火箭'],
  },
  {
    company: '本源量子', companyEn: 'Origin Quantum', market: 'CN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-01', amountUsd: null, valuationUsd: 1.0e9,
    leadInvestors: '中电信方舟基金等', desc: '国内超导量子计算整机与量子芯片龙头', tags: ['量子计算'],
  },
  {
    company: '国仪量子', companyEn: 'CIQTEK', market: 'CN', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2024-08', amountUsd: null, valuationUsd: 1.1e9,
    leadInvestors: '深投控、讯飞创投等', desc: '量子精密测量/电子顺磁共振科学仪器，出海放量', tags: ['量子测量', '科学仪器'],
  },
  {
    company: '能量奇点', companyEn: 'Energy Singularity', market: 'CN', sector: 'energy',
    stage: 'a', roundLabel: 'A轮及战略轮', date: '2024-06', amountUsd: 1.1e8, valuationUsd: null,
    leadInvestors: '米哈游、耀途资本等', desc: '高温超导托卡马克「洪荒70」全球率先等离子体放电', tags: ['可控核聚变', '超导'],
  },
  // ============ 中国 · 生物医药 / 医疗 ============
  {
    company: '科笛集团', companyEn: 'Cutia Medical', market: 'CN', sector: 'health',
    stage: 'd', roundLabel: 'C-2轮', date: '2023-08', amountUsd: 9.1e7, valuationUsd: 9.1e8,
    leadInvestors: '弘晖基金、易方达资产等', desc: '医美/皮肤科管线（外用非那雄胺等），港股上市推进', tags: ['医美', '创新药'],
  },
  {
    company: '药明合联', companyEn: 'WuXi XDC', market: 'CN', sector: 'health',
    stage: 'preipo', roundLabel: 'Pre-IPO', date: '2023-11', amountUsd: 2.4e8, valuationUsd: null,
    leadInvestors: '药明生物分拆，引入多名基石', desc: 'ADC 生物偶联药 CDMO 独角兽，2023 年 11 月港股上市', tags: ['ADC', 'CXO'],
  },
  {
    company: '剂泰医药', companyEn: 'METiS Pharmaceuticals', market: 'CN', sector: 'health',
    stage: 'c', roundLabel: 'C轮', date: '2024-12', amountUsd: null, valuationUsd: 1.0e9,
    leadInvestors: '启明创投、招商局资本等', desc: 'AI 驱动制剂与 mRNA 递送设计，AI4S 标杆', tags: ['AI制药', '递送技术'],
  },
  {
    company: '先通医药', companyEn: 'Xiantong Pharma', market: 'CN', sector: 'health',
    stage: 'd', roundLabel: '新一轮', date: '2024-07', amountUsd: 1.5e8, valuationUsd: null,
    leadInvestors: '国投创业、中关村科学城等', desc: '放射性诊断/治疗药物龙头，核药风口', tags: ['核药', '创新药'],
  },
  // ============ 中国 · 新消费 / 其他 ============
  {
    company: '蜜雪冰城（Pre-IPO 前最后一轮）', companyEn: 'Mixue', market: 'CN', sector: 'consumer',
    stage: 'preipo', roundLabel: 'Pre-IPO（历史轮）', date: '2022-01', amountUsd: 3.0e8, valuationUsd: 3.1e9,
    leadInvestors: '高瓴、美团龙珠', desc: '现制茶饮供应链霸主，门店数全球第一，2025 年港股上市', tags: ['茶饮', '供应链'],
  },
  {
    company: '西井科技', companyEn: 'Westwell', market: 'CN', sector: 'industrial',
    stage: 'd', roundLabel: 'E轮', date: '2024-12', amountUsd: 1.4e8, valuationUsd: null,
    leadInvestors: '临港科创投、浦江国际金融等', desc: '自动驾驶港口/物流重卡，全球化出货', tags: ['自动驾驶', '港口'],
  },
  {
    company: '行云集成电路', companyEn: 'Xingyun Electronics', market: 'CN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-11', amountUsd: 7.0e7, valuationUsd: null,
    leadInvestors: '方广资本、鼎晖VGC等', desc: '大模型时代存算一体 SRAM 芯片，推理成本杀手路线', tags: ['存算一体', 'AI芯片'],
  },
  {
    company: '后摩智能', companyEn: 'Houmo.AI', market: 'CN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮及战略轮', date: '2024-08', amountUsd: 4.2e7, valuationUsd: null,
    leadInvestors: '中移基金、苏创投等', desc: '存算一体大算力 AI 芯片（鸿途），边缘推理', tags: ['存算一体', 'AI芯片'],
  },
  {
    company: '卫蓝新能源', companyEn: 'WeLion', market: 'CN', sector: 'materials',
    stage: 'd', roundLabel: 'D轮及战略轮', date: '2023-06', amountUsd: null, valuationUsd: 2.1e9,
    leadInvestors: '蔚来资本、小米产投、吉利等', desc: '半固态电池出货蔚来 150kWh 包，锂电下一代技术', tags: ['固态电池', '锂电'],
  },
  {
    company: '清陶能源', companyEn: 'QingTao Energy', market: 'CN', sector: 'materials',
    stage: 'd', roundLabel: 'D轮及战略轮', date: '2024-05', amountUsd: null, valuationUsd: 1.4e9,
    leadInvestors: '上汽集团、北汽、广汽等', desc: '全固态电池量产线推进，车企深度绑定', tags: ['固态电池', '锂电'],
  },
  {
    company: '正浩EcoFlow', companyEn: 'EcoFlow', market: 'CN', sector: 'consumer',
    stage: 'd', roundLabel: 'D轮及以上', date: '2023-04', amountUsd: null, valuationUsd: 1.5e9,
    leadInvestors: '红杉中国、高瓴等', desc: '便携储能全球头部，户外能源生态', tags: ['储能', '出海'],
  },
  {
    company: '元气森林', companyEn: 'Genki Forest', market: 'CN', sector: 'consumer',
    stage: 'pe', roundLabel: 'PE轮（成长期，历史轮）', date: '2021-11', amountUsd: 2.0e8, valuationUsd: 1.5e10,
    leadInvestors: '淡马锡、红杉中国、华平等', desc: '无糖气泡水龙头，新消费估值峰谷样本', tags: ['饮料', '新消费'],
  },
  {
    company: '千寻智能', companyEn: 'Spirit AI', market: 'CN', sector: 'industrial',
    stage: 'seed', roundLabel: 'Pre-A轮系列', date: '2024-09', amountUsd: 7.4e7, valuationUsd: null,
    leadInvestors: '中关村科学城、达晨财智等', desc: '具身智能机器人（清华系），Embot 亮相即获大额融资', tags: ['具身智能', '人形机器人'],
  },
  {
    company: '自变量机器人', companyEn: 'Variable Robot', market: 'CN', sector: 'industrial',
    stage: 'angel', roundLabel: '天使+轮（数亿元）', date: '2025-03', amountUsd: null, valuationUsd: null,
    leadInvestors: '德联资本、柏睿资本等', desc: '端到端具身智能大模型 WALL-A，连续多轮天使', tags: ['具身智能', '大模型'],
  },
  {
    company: '灵初智能', companyEn: 'Bit Robot', market: 'CN', sector: 'industrial',
    stage: 'angel', roundLabel: '天使轮', date: '2024-12', amountUsd: 1.4e7, valuationUsd: null,
    leadInvestors: '高瓴创投等', desc: '分层强化学习驱动机器人操作技能（Psi Bot）', tags: ['机器人', '强化学习'],
  },
  {
    company: '周期实验室', companyEn: 'Periodic Labs', market: 'US', sector: 'tech',
    stage: 'seed', roundLabel: '种子轮', date: '2025-09', amountUsd: 3.0e8, valuationUsd: 1.5e9,
    leadInvestors: 'a16z、Nvidia 等', desc: '前 Meta/OpenAI 科学家创办，AI 驱动材料科学与物理实验自动化', tags: ['AI for Science', '材料'],
  },

  // ============ 美国 · AI ============
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
    company: 'Perplexity', companyEn: 'Perplexity AI', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2024-12', amountUsd: 5.0e8, valuationUsd: 9.0e9,
    leadInvestors: 'NEA、IVP 等', desc: 'AI 搜索引擎，挑战 Google 的答案机器', tags: ['AI搜索', '大模型', 'C端'],
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
    company: 'Cursor', companyEn: 'Anysphere (Cursor)', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'D轮', date: '2025-11', amountUsd: 2.3e9, valuationUsd: 2.93e10,
    leadInvestors: 'Accel、Coatue', desc: 'AI 编程工具，史上 ARR 从 0 到 10 亿美元最快的软件公司之一', tags: ['AI编程', 'SaaS', '开发者'],
  },
  {
    company: 'Scale AI', companyEn: 'Scale AI', market: 'US', sector: 'tech',
    stage: 'pe', roundLabel: '战略投资（49%控股）', date: '2025-05', amountUsd: 1.43e10, valuationUsd: 2.9e10,
    leadInvestors: 'Meta', desc: '数据标注与评估龙头；Meta 以近半控股进入——一级市场股权结构设计案例', tags: ['数据', 'AI基础设施'],
  },
  {
    company: 'Together AI', companyEn: 'Together AI', market: 'US', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2025-02', amountUsd: 3.0e8, valuationUsd: 3.3e9,
    leadInvestors: 'Salesforce Ventures、Nvidia 等', desc: '开源模型训练/推理云，DeepSeek 时刻最大受益者之一', tags: ['AI Infra', '开源'],
  },
  {
    company: '世界实验室', companyEn: 'World Labs', market: 'US', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-09', amountUsd: 2.3e8, valuationUsd: 1.0e9,
    leadInvestors: 'a16z、NEA 等', desc: '李飞飞创办，空间智能（世界模型），AI 下一个范式', tags: ['空间智能', '世界模型'],
  },
  {
    company: 'xAI（后续轮）', companyEn: 'xAI follow-on', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮系列（股权+债务）', date: '2025-09', amountUsd: 1.0e10, valuationUsd: 2.0e11,
    leadInvestors: 'Fidelity、a16z 等', desc: 'xAI 后续巨额轮：估值一年五倍的 AI 算力豪赌', tags: ['大模型', '算力'],
  },
  {
    company: 'Harvey', companyEn: 'Harvey AI', market: 'US', sector: 'tech',
    stage: 'd', roundLabel: 'E轮', date: '2025-06', amountUsd: 3.0e8, valuationUsd: 5.0e9,
    leadInvestors: 'Kleiner Perkins、Coatue', desc: '法律 AI 助手标杆，Big Law 渗透率最快软件之一', tags: ['法律AI', '垂直SaaS'],
  },
  {
    company: 'Abridge', companyEn: 'Abridge', market: 'US', sector: 'health',
    stage: 'e', roundLabel: 'E轮', date: '2025-06', amountUsd: 3.0e8, valuationUsd: 5.3e9,
    leadInvestors: 'Kleiner Perkins', desc: '医疗对话记录 AI，Epic 生态最热标的', tags: ['医疗AI', 'SaaS'],
  },
  {
    company: 'Replit', companyEn: 'Replit', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮系列', date: '2025-09', amountUsd: 2.5e8, valuationUsd: 3.0e9,
    leadInvestors: 'a16z、Amex Ventures 等', desc: 'AI Agent 开发平台，vibe coding 起飞', tags: ['AI编程', '开发者'],
  },
  {
    company: 'Poolside', companyEn: 'Poolside', market: 'US', sector: 'tech',
    stage: 'b', roundLabel: 'B轮系列', date: '2025-10', amountUsd: 5.0e8, valuationUsd: 1.2e10,
    leadInvestors: 'Nvidia、Cisosero 等', desc: '代码大模型（与 Anthropic/Cursor 并列），与 Nvidia 深度绑定', tags: ['代码大模型', 'AI编程'],
  },
  {
    company: 'Si', companyEn: 'Si (Reflection AI)', market: 'US', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2025-10', amountUsd: 2.0e9, valuationUsd: 8.0e9,
    leadInvestors: 'Nvidia 等', desc: '自主编程智能体（前 DeepMind 团队），开源 AGI 路线', tags: ['AI智能体', '代码'],
  },
  {
    company: 'Hugging Face', companyEn: 'Hugging Face', market: 'US', sector: 'tech',
    stage: 'd', roundLabel: 'D轮', date: '2023-08', amountUsd: 2.35e8, valuationUsd: 4.5e9,
    leadInvestors: 'Salesforce、Google、Nvidia 等', desc: '开源模型社区事实标准，AI 时代的 GitHub', tags: ['开源', '模型社区'],
  },
  {
    company: 'Cognition', companyEn: 'Cognition Labs (Devin)', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2025-03', amountUsd: 3.0e8, valuationUsd: 4.0e9,
    leadInvestors: 'Thrive Capital', desc: 'AI 软件工程师 Devin，收购 Windsurf 整合 IDE', tags: ['AI编程', '智能体'],
  },
  {
    company: 'Sierra', companyEn: 'Sierra', market: 'US', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2025-09', amountUsd: 3.5e8, valuationUsd: 4.5e9,
    leadInvestors: 'Greenoaks', desc: 'Bret Taylor 创办的客服 AI Agent， ARR 年内破亿', tags: ['AI Agent', '客服'],
  },
  {
    company: 'Glean', companyEn: 'Glean', market: 'US', sector: 'tech',
    stage: 'f', roundLabel: 'F轮', date: '2025-06', amountUsd: 1.5e8, valuationUsd: 7.2e9,
    leadInvestors: 'Coatue、Durable Capital', desc: '企业搜索 + AI 工作助手，ARR 1 亿美元+', tags: ['企业搜索', 'AI助手'],
  },
  {
    company: 'ElevenLabs', companyEn: 'ElevenLabs', market: 'EU', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2025-01', amountUsd: 1.8e8, valuationUsd: 3.3e9,
    leadInvestors: 'ICONIQ、a16z 等', desc: 'AI 语音合成龙头（伦敦/纽约双总部），多语种语音克隆标杆', tags: ['语音AI', '多模态'],
  },
  {
    company: 'Suno', companyEn: 'Suno', market: 'US', sector: 'comm',
    stage: 'c', roundLabel: 'C轮', date: '2025-03', amountUsd: 1.25e8, valuationUsd: 2.0e9,
    leadInvestors: 'Menlo Ventures、Nat Friedman', desc: 'AI 音乐生成（V4），版权诉讼阴影下的爆款', tags: ['AI音乐', 'AIGC'],
  },
  {
    company: 'Decagon', companyEn: 'Decagon', market: 'US', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2025-06', amountUsd: 1.31e8, valuationUsd: 1.5e9,
    leadInvestors: 'Accel、a16z', desc: '企业级客服 AI Agent（Notion/Substack 客户）', tags: ['AI Agent', '客服'],
  },
  {
    company: 'OpenEvidence', companyEn: 'OpenEvidence', market: 'US', sector: 'health',
    stage: 'b', roundLabel: 'B轮系列', date: '2025-10', amountUsd: 2.0e8, valuationUsd: 6.0e9,
    leadInvestors: 'Khosla、Sequoia', desc: '临床医学 AI 问答，美国 40% 医生日用', tags: ['医疗AI', '循证'],
  },
  // ============ 美国 · 机器人 / 具身智能 ============
  {
    company: 'Figure AI', companyEn: 'Figure AI', market: 'US', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2025-09', amountUsd: 1.0e9, valuationUsd: 3.9e10,
    leadInvestors: 'Parkway Venture Capital', desc: '人形机器人 Figure 系列，宝马产线部署', tags: ['机器人', '人形机器人', '具身智能'],
  },
  {
    company: '实体智能', companyEn: 'Physical Intelligence', market: 'US', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮', date: '2024-11', amountUsd: 4.0e8, valuationUsd: 2.4e9,
    leadInvestors: 'Bezos Expeditions、Thrive、OpenAI', desc: '通用机器人基座模型 π0——机器人界的 GPT 时刻', tags: ['机器人', '具身智能', '基座模型'],
  },
  {
    company: 'Skild AI', companyEn: 'Skild AI', market: 'US', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-07', amountUsd: 3.0e8, valuationUsd: 1.5e9,
    leadInvestors: 'SoftBank、Menlo Ventures 等', desc: '机器人通用「大脑」Skild Brain，软银重仓', tags: ['机器人', '基座模型'],
  },
  {
    company: 'Apptronik', companyEn: 'Apptronik', market: 'US', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮扩展', date: '2025-02', amountUsd: 4.0e8, valuationUsd: null,
    leadInvestors: 'B Capital、Capital Factory 等', desc: '人形机器人 Apollo，与 Google DeepMind 合作', tags: ['人形机器人'],
  },
  {
    company: 'Serve Robotics', companyEn: 'Serve Robotics', market: 'US', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮及战略轮', date: '2024-07', amountUsd: 4.0e7, valuationUsd: null,
    leadInvestors: 'Nvidia（战略增持）', desc: '人行道配送机器人，Uber Eats 独家部署', tags: ['配送机器人', 'Robotaxi生态'],
  },
  // ============ 美国 · 金融科技 / 企业服务 ============
  {
    company: 'Ramp', companyEn: 'Ramp', market: 'US', sector: 'finance',
    stage: 'c', roundLabel: 'C轮系列', date: '2025-04', amountUsd: 2.0e8, valuationUsd: 1.3e10,
    leadInvestors: 'Founders Fund', desc: '企业支出管理 + AI 财务自动化', tags: ['金融科技', 'SaaS', '企业服务'],
  },
  {
    company: 'Mercury', companyEn: 'Mercury', market: 'US', sector: 'finance',
    stage: 'c', roundLabel: 'C轮（员工要约）', date: '2025-03', amountUsd: null, valuationUsd: 3.5e9,
    leadInvestors: '二级要约（Sequoia 等参与）', desc: '初创企业银行平台，ARR 5 亿美元级别', tags: ['数字银行', 'SaaS'],
  },
  {
    company: 'Plaid', companyEn: 'Plaid', market: 'US', sector: 'finance',
    stage: 'd', roundLabel: 'F轮（员工要约）', date: '2025-07', amountUsd: 5.75e8, valuationUsd: 6.1e9,
    leadInvestors: 'Franklin Templeton 等', desc: '开放银行 API 霸主，Visa 收购失败后二次增长', tags: ['开放银行', 'API'],
  },
  {
    company: 'Rippling', companyEn: 'Rippling', market: 'US', sector: 'tech',
    stage: 'f', roundLabel: 'F轮', date: '2025-04', amountUsd: 2.5e8, valuationUsd: 1.35e10,
    leadInvestors: 'Sands Capital', desc: 'HR+IT 一体化平台，Deel 诉讼风波后估值不降反升', tags: ['HR SaaS', '企业服务'],
  },
  {
    company: 'Grammarly（Coda 合并）', companyEn: 'Grammarly + Coda', market: 'US', sector: 'tech',
    stage: 'pe', roundLabel: '合并及后续（PE）', date: '2025-05', amountUsd: 1.0e9, valuationUsd: 1.3e10,
    leadInvestors: 'General Catalyst', desc: '写作助手 + 工作流平台合并，转型 AI 生产力平台 Superhuman', tags: ['AI助手', '生产力'],
  },
  {
    company: 'Waymo', companyEn: 'Waymo', market: 'US', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮（战略）', date: '2024-10', amountUsd: 5.6e9, valuationUsd: 4.5e10,
    leadInvestors: 'a16z、Fidelity、Alphabet', desc: 'Robotaxi 商业化领跑者（Alphabet 分拆）', tags: ['自动驾驶', 'Robotaxi'],
  },
  // ============ 美国 · 国防 / 航天 ============
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
    company: 'Shield AI', companyEn: 'Shield AI', market: 'US', sector: 'industrial',
    stage: 'f', roundLabel: 'F轮系列', date: '2025-03', amountUsd: 2.4e8, valuationUsd: 5.3e9,
    leadInvestors: 'L3Harris 等', desc: '军用无人机自主系统 Hivemind，国防 AI 双雄之一', tags: ['军工', '无人机'],
  },
  {
    company: 'Castelion', companyEn: 'Castelion', market: 'US', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮', date: '2025-10', amountUsd: 3.5e8, valuationUsd: 2.3e9,
    leadInvestors: 'Lightspeed、a16z 等', desc: '低成本高超音速反舰导弹，量产型国防新贵', tags: ['军工', '导弹'],
  },
  {
    company: 'Epirus', companyEn: 'Epirus', market: 'US', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮', date: '2025-07', amountUsd: 2.5e8, valuationUsd: 1.6e9,
    leadInvestors: '8VC 等', desc: '高功率微波反无人机武器 Leonidas，反无人机第一标的', tags: ['军工', '反无人机'],
  },
  {
    company: 'Varda Space', companyEn: 'Varda Space Industries', market: 'US', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮系列', date: '2025-06', amountUsd: 1.7e8, valuationUsd: 1.7e9,
    leadInvestors: 'Founders Fund、a16z', desc: '太空制药/在轨制造，W 系列返回舱四次成功再入', tags: ['航天', '太空制造'],
  },
  {
    company: 'Starcloud', companyEn: 'Starcloud', market: 'US', sector: 'tech',
    stage: 'a', roundLabel: 'A轮系列', date: '2025-06', amountUsd: 4.0e7, valuationUsd: null,
    leadInvestors: 'Nvidia、Y Combinator 等', desc: '轨道数据中心（太空算力），Nvidia H100 已上天', tags: ['算力', '航天', '数据中心'],
  },
  // ============ 美国 · 生物医药 / 气候 ============
  {
    company: 'Xaira Therapeutics', companyEn: 'Xaira Therapeutics', market: 'US', sector: 'health',
    stage: 'a', roundLabel: 'A轮（创纪录）', date: '2024-04', amountUsd: 1.0e9, valuationUsd: null,
    leadInvestors: 'ARCH Venture、Foresite Capital 等', desc: '2024 最大生物科技首轮融资，AI+药物发现', tags: ['AI制药', '生物医药'],
  },
  {
    company: 'Formation Bio', companyEn: 'Formation Bio', market: 'US', sector: 'health',
    stage: 'd', roundLabel: 'D轮', date: '2024-05', amountUsd: 3.72e8, valuationUsd: 1.0e9,
    leadInvestors: 'a16z、Sequoia 等', desc: 'AI 优先的临床管线公司，a16z 生物组合核心', tags: ['AI制药', '临床试验'],
  },
  {
    company: 'Altos Labs', companyEn: 'Altos Labs', market: 'US', sector: 'health',
    stage: 'a', roundLabel: 'A轮（累计30亿）', date: '2022-01', amountUsd: 3.0e9, valuationUsd: null,
    leadInvestors: 'Altos Management、Bezos 等', desc: '细胞重编程/抗衰老科学豪赌，史上最大生物初创融资', tags: ['长寿科技', '细胞重编程'],
  },
  {
    company: 'Commonwealth Fusion', companyEn: 'Commonwealth Fusion Systems', market: 'US', sector: 'energy',
    stage: 'pe', roundLabel: '战略轮（PE）', date: '2025-08', amountUsd: 8.6e8, valuationUsd: null,
    leadInvestors: 'Eni、谷歌、Nvidia 等', desc: 'SPARC 托卡马克聚变示范堆，MIT 系聚变第一股', tags: ['可控核聚变', '能源'],
  },
  {
    company: 'Sila Nanotechnologies', companyEn: 'Sila', market: 'US', sector: 'materials',
    stage: 'pe', roundLabel: 'PE轮（成长期）', date: '2025-01', amountUsd: 3.75e8, valuationUsd: null,
    leadInvestors: '摩根大通、三星等', desc: '硅基电池负极材料，特斯拉/奔驰供应链', tags: ['电池材料', '新能源'],
  },
  {
    company: 'Redwood Materials', companyEn: 'Redwood Materials', market: 'US', sector: 'materials',
    stage: 'e', roundLabel: 'E轮', date: '2025-07', amountUsd: 3.5e8, valuationUsd: null,
    leadInvestors: 'T. Rowe Price 等', desc: '电池回收+储能系统（AI 数据中心供电新故事）', tags: ['电池回收', '储能'],
  },
  {
    company: 'Bright Machines', companyEn: 'Bright Machines', market: 'US', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-06', amountUsd: 1.06e8, valuationUsd: null,
    leadInvestors: 'BlackRock、Nvidia 等', desc: 'AI 驱动的软件定义制造（微工厂）', tags: ['智能制造', '机器人'],
  },
  {
    company: 'Udio', companyEn: 'Udio (Uncharted Labs)', market: 'US', sector: 'comm',
    stage: 'seed', roundLabel: '种子轮', date: '2024-06', amountUsd: 1.0e8, valuationUsd: null,
    leadInvestors: 'a16z、前 Google 董事长等天使', desc: '前 DeepMind 团队 AI 音乐（Udio），版权和解后合规化', tags: ['AI音乐', 'AIGC'],
  },
  {
    company: '小马智行（美区 Pre-IPO 轮）', companyEn: 'Pony.ai (US tranche)', market: 'US', sector: 'industrial',
    stage: 'preipo', roundLabel: 'Pre-IPO', date: '2024-08', amountUsd: 1.0e8, valuationUsd: 8.5e9,
    leadInvestors: '大族控股等', desc: 'Robotaxi 中美双主场，上市前战略轮', tags: ['自动驾驶', 'Robotaxi'],
  },
  {
    company: 'Saronic', companyEn: 'Saronic', market: 'US', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2025-07', amountUsd: 6.0e8, valuationUsd: 4.0e9,
    leadInvestors: 'a16z、Elastic Ventures', desc: '自主海军无人艇（ASW），海军国防新贵', tags: ['军工', '无人艇'],
  },
  {
    company: 'Cohere', companyEn: 'Cohere', market: 'US', sector: 'tech',
    stage: 'd', roundLabel: 'D轮', date: '2024-07', amountUsd: 5.0e8, valuationUsd: 5.5e9,
    leadInvestors: 'Cisco、Fujitsu、AMD Ventures 等', desc: '企业级大模型（主权 AI 部署），加拿大背景美区主体', tags: ['大模型', '企业AI'],
  },
  {
    company: 'Datavant', companyEn: 'Datavant', market: 'US', sector: 'health',
    stage: 'pe', roundLabel: 'PE轮（并购后增资）', date: '2024-12', amountUsd: null, valuationUsd: 1.05e10,
    leadInvestors: 'Roivant、TPG 等', desc: '医疗数据去标识化交换枢纽，健康数据霸权', tags: ['医疗数据', 'PE'],
  },
  {
    company: 'Mach Industries', companyEn: 'Mach Industries', market: 'US', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮', date: '2025-06', amountUsd: 7.9e7, valuationUsd: 4.9e8,
    leadInvestors: 'Khosla、8VC', desc: '氢能高超音速武器 + 低成本弹药工厂', tags: ['军工', '高超音速'],
  },
  {
    company: 'Vercel', companyEn: 'Vercel', market: 'US', sector: 'tech',
    stage: 'e', roundLabel: 'E轮', date: '2025-05', amountUsd: 3.0e8, valuationUsd: 9.3e9,
    leadInvestors: 'Accel、GIC、Salesforce Ventures', desc: '前端云 + AI 应用部署（v0），AI 应用默认底座', tags: ['云服务', '开发者'],
  },
  {
    company: 'Wordware', companyEn: 'Wordware', market: 'US', sector: 'tech',
    stage: 'seed', roundLabel: '种子轮', date: '2024-09', amountUsd: 3.0e7, valuationUsd: 2.0e8,
    leadInvestors: 'Felicis、Y Combinator', desc: 'AI Agent IDE（自然语言编程），史上最大 YC 种子轮之一', tags: ['AI Agent', '开发工具'],
  },
  {
    company: 'Aledade', companyEn: 'Aledade', market: 'US', sector: 'health',
    stage: 'f', roundLabel: 'F轮（要约/增资）', date: '2025-06', amountUsd: null, valuationUsd: 4.6e9,
    leadInvestors: 'Avidity Partners 等', desc: '独立医生诊所价值医疗网络，AI 辅助慢病管理', tags: ['医疗网络', '价值医疗'],
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
  {
    company: '1X Technologies', companyEn: '1X Technologies', market: 'EU', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-01', amountUsd: 1.0e8, valuationUsd: null,
    leadInvestors: 'EQT Ventures 等', desc: '挪威人形机器人 NEO（家用），OpenAI 早期投资', tags: ['人形机器人', '家用机器人'],
  },
  {
    company: 'Oura', companyEn: 'Oura Health', market: 'EU', sector: 'consumer',
    stage: 'd', roundLabel: 'D轮', date: '2024-12', amountUsd: 5.2e8, valuationUsd: 5.2e9,
    leadInvestors: 'Fidelity 等', desc: '智能戒指龙头，健康可穿戴 20 亿美元俱乐部', tags: ['可穿戴', '健康硬件'],
  },
  {
    company: 'Stegra（H2 Green Steel）', companyEn: 'Stegra', market: 'EU', sector: 'materials',
    stage: 'pe', roundLabel: 'PE轮（项目融资）', date: '2024-06', amountUsd: 6.5e9, valuationUsd: null,
    leadInvestors: 'Altor、GIC、Just Climate 等', desc: '瑞典绿色钢铁，欧洲史上最大私募气候融资之一', tags: ['绿色钢铁', '氢能'],
  },
  {
    company: 'Northvolt（重组前最后一轮）', companyEn: 'Northvolt', market: 'EU', sector: 'materials',
    stage: 'pe', roundLabel: '扩展轮（后破产重组）', date: '2024-01', amountUsd: 1.2e9, valuationUsd: null,
    leadInvestors: 'BlackRock、加拿大养老金等', desc: '欧洲电池希望，2024 年底破产——一级市场风险教材', tags: ['电池', '风险案例'],
  },
  {
    company: 'Isar Aerospace', companyEn: 'Isar Aerospace', market: 'EU', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮系列', date: '2024-06', amountUsd: 6.5e8, valuationUsd: null,
    leadInvestors: 'Earlybird、Lakestar 等', desc: '德国商业火箭 Spectrum，欧洲 SpaceX 对标', tags: ['商业航天', '火箭'],
  },
  {
    company: 'The Exploration Company', companyEn: 'The Exploration Company', market: 'EU', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-11', amountUsd: 1.6e8, valuationUsd: null,
    leadInvestors: 'Balderton、Plural 等', desc: '欧洲可回收货运飞船 Nyx，ESA 商业货运首选', tags: ['商业航天', '飞船'],
  },
  {
    company: 'Helsing 竞品 Quantum Systems', companyEn: 'Quantum Systems', market: 'EU', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮系列', date: '2025-06', amountUsd: 1.8e8, valuationUsd: null,
    leadInvestors: 'Balderton、HV Capital 等', desc: '德国军用无人机/矢量 eVTOL，乌克兰实战部署', tags: ['军工', '无人机'],
  },
  {
    company: 'Synthesia', companyEn: 'Synthesia', market: 'EU', sector: 'tech',
    stage: 'd', roundLabel: 'D轮', date: '2025-01', amountUsd: 1.8e8, valuationUsd: 2.1e9,
    leadInvestors: 'NEA、Google Ventures', desc: 'AI 数字人视频（伦敦），企业培训视频霸主', tags: ['数字人', 'AIGC'],
  },
  {
    company: 'Photoroom', companyEn: 'Photoroom', market: 'EU', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-02', amountUsd: 4.3e7, valuationUsd: 3.0e8,
    leadInvestors: 'Balderton、Y Combinator', desc: 'AI 图片编辑（巴黎），电商商品图自动化', tags: ['AI图像', '电商工具'],
  },
  {
    company: 'Mews', companyEn: 'Mews', market: 'EU', sector: 'tech',
    stage: 'd', roundLabel: 'D轮', date: '2024-03', amountUsd: 1.1e8, valuationUsd: 1.2e9,
    leadInvestors: 'Kinnevik、Goldman Sachs Alternatives', desc: '酒店 SaaS（布拉格），欧洲垂直 SaaS 独角兽', tags: ['SaaS', '酒店'],
  },
  {
    company: 'Doctolib', companyEn: 'Doctolib', market: 'EU', sector: 'health',
    stage: 'pe', roundLabel: 'PE轮（次级+增资）', date: '2025-07', amountUsd: null, valuationUsd: 6.0e9,
    leadInvestors: 'Bpifrance、General Atlantic 等', desc: '欧洲医疗预约/AI 问诊平台，法国数字医疗旗舰', tags: ['数字医疗', 'AI问诊'],
  },
  {
    company: 'Back Market', companyEn: 'Back Market', market: 'EU', sector: 'consumer',
    stage: 'e', roundLabel: 'E轮后（员工要约）', date: '2025-05', amountUsd: null, valuationUsd: 5.0e9,
    leadInvestors: '次级要约（Quantum 等）', desc: '翻新电子产品市场（巴黎），循环经济电商', tags: ['二手电商', '循环经济'],
  },
  {
    company: 'Alan', companyEn: 'Alan', market: 'EU', sector: 'health',
    stage: 'pe', roundLabel: 'F轮', date: '2025-06', amountUsd: 2.3e8, valuationUsd: 2.7e9,
    leadInvestors: '安大略教师养老金计划等', desc: '法国数字医保龙头，AI 健康助手', tags: ['数字医疗', '保险'],
  },
  {
    company: 'IQM量子', companyEn: 'IQM Quantum Computers', market: 'EU', sector: 'tech',
    stage: 'b', roundLabel: 'B轮扩展', date: '2025-05', amountUsd: 3.2e8, valuationUsd: 1.0e9,
    leadInvestors: '欧洲量子产业联盟基金等', desc: '芬兰超导量子计算整机（欧洲最大量子融资）', tags: ['量子计算', '欧洲'],
  },
  {
    company: 'Lovable', companyEn: 'Lovable', market: 'EU', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2025-07', amountUsd: 2.0e8, valuationUsd: 1.8e9,
    leadInvestors: 'Accel、Meritech', desc: 'AI 应用生成（斯德哥尔摩），欧洲史上最快独角兽（8 个月）', tags: ['AI编程', 'Vibe Coding'],
  },
  {
    company: 'Proxima Fusion', companyEn: 'Proxima Fusion', market: 'EU', sector: 'energy',
    stage: 'a', roundLabel: 'A轮', date: '2025-06', amountUsd: 1.3e8, valuationUsd: null,
    leadInvestors: 'Redalpine、Cherry 等', desc: '德国仿星器聚变（Max Planck 衍生），欧洲聚变新旗舰', tags: ['可控核聚变'],
  },
  {
    company: 'Helsing 竞品 ARX Robotics', companyEn: 'ARX Robotics', market: 'EU', sector: 'industrial',
    stage: 'a', roundLabel: 'A轮系列', date: '2025-04', amountUsd: 3.7e7, valuationUsd: null,
    leadInvestors: 'Cherry Ventures、UV等', desc: '模块化地面无人战车（慕尼黑），乌克兰战场验证', tags: ['军工', '无人战车'],
  },
  {
    company: 'Sword Health', companyEn: 'Sword Health', market: 'EU', sector: 'health',
    stage: 'e', roundLabel: 'E轮后（要约）', date: '2025-07', amountUsd: 3.0e8, valuationUsd: 4.0e9,
    leadInvestors: 'General Catalyst 等', desc: 'AI 数字肌肉骨骼治疗（葡萄牙），欧洲医疗独角兽', tags: ['数字医疗', 'AI康复'],
  },
  {
    company: 'Wandelbots', companyEn: 'Wandelbots', market: 'EU', sector: 'industrial',
    stage: 'c', roundLabel: 'C轮', date: '2024-06', amountUsd: 8.4e7, valuationUsd: null,
    leadInvestors: 'HV Capital、Logic Instruments 等', desc: '机器人无代码示教平台（德累斯顿），英伟达生态', tags: ['机器人软件', '工业'],
  },

  // ============ 日本 ============
  {
    company: 'Sakana AI', companyEn: 'Sakana AI', market: 'JP', sector: 'tech',
    stage: 'a', roundLabel: 'A轮系列（B轮并入）', date: '2025-08', amountUsd: 1.35e8, valuationUsd: 1.3e9,
    leadInvestors: 'MUFG Innovation Partners 等', desc: '东京大学团队，进化式模型合并；日本最快独角兽之一', tags: ['大模型', '日本AI'],
  },
  {
    company: 'Preferred Networks', companyEn: 'Preferred Networks', market: 'JP', sector: 'tech',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-08', amountUsd: 1.0e8, valuationUsd: null,
    leadInvestors: '丰田、日立等产业资本', desc: '日本 AI 老牌（PFN），工业大模型与机器人智能', tags: ['大模型', '工业AI'],
  },
  {
    company: 'Elyza', companyEn: 'ELYZA', market: 'JP', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-05', amountUsd: 1.6e7, valuationUsd: null,
    leadInvestors: 'Glassview、Salesforce Ventures 等', desc: '日语特化 LLM（東大松尾研究室系）', tags: ['日语大模型', 'LLM'],
  },
  {
    company: 'LIQUID（e-Well）', companyEn: 'LIQUID', market: 'JP', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-11', amountUsd: 1.4e7, valuationUsd: null,
    leadInvestors: '三菱UFJ Capital 等', desc: '超轻量 LLM（手机端推理），日本端侧 AI 代表', tags: ['端侧模型', 'LLM'],
  },
  {
    company: 'Tier IV', companyEn: 'TIER IV', market: 'JP', sector: 'industrial',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-07', amountUsd: 1.2e8, valuationUsd: null,
    leadInvestors: '日本政策投资银行、铃木等', desc: '开源自动驾驶 Autoware 母体，日本智驾国家队', tags: ['自动驾驶', '开源'],
  },
  {
    company: 'SmartNews（次级要约）', companyEn: 'SmartNews', market: 'JP', sector: 'comm',
    stage: 'pe', roundLabel: '次级要约（PE）', date: '2025-01', amountUsd: null, valuationUsd: 7.5e8,
    leadInvestors: '老股转让（US IPO 失败后重整）', desc: '新闻聚合 App，一级市场估值大幅回调样本', tags: ['资讯', '估值回调'],
  },
  {
    company: 'Nablas', companyEn: 'Nablas', market: 'JP', sector: 'tech',
    stage: 'a', roundLabel: 'A轮', date: '2024-09', amountUsd: 1.0e7, valuationUsd: null,
    leadInvestors: 'みずほキャピタル等', desc: '生成式 AI 视频质检（制造业），日本 AI 应用落地', tags: ['视觉AI', '制造业'],
  },
  {
    company: 'SmartHR', companyEn: 'SmartHR', market: 'JP', sector: 'tech',
    stage: 'pe', roundLabel: 'PE轮（历史轮，E轮系列）', date: '2022-01', amountUsd: 1.7e8, valuationUsd: 1.7e9,
    leadInvestors: 'KDDI、SoftBank Vision Fund 2 等', desc: '日本 HR SaaS 龙头，上市准备中', tags: ['HR SaaS', '日本'],
  },
  {
    company: 'Space One', companyEn: 'Space One (Canon Electronics)', market: 'JP', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-03', amountUsd: 5.0e7, valuationUsd: null,
    leadInvestors: '佳能电子、伊藤忠等', desc: '日本商业航天小型火箭 KAIROS，亚洲商业发射入局者', tags: ['商业航天', '火箭'],
  },
  {
    company: 'GITAI', companyEn: 'GITAI', market: 'JP', sector: 'industrial',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-05', amountUsd: 3.0e7, valuationUsd: null,
    leadInvestors: '三井住友海上、SBI 等', desc: '太空机器人机械臂（日美双线），ISS/月面任务', tags: ['太空机器人', '航天'],
  },

  // ============ 韩国 ============
  {
    company: 'DeepX', companyEn: 'DeepX', market: 'KR', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-07', amountUsd: 8.0e7, valuationUsd: 1.0e9,
    leadInvestors: 'SK Telecom 等', desc: '韩国 NPU 芯片（DX-M1），韩系独角兽最快纪录之一', tags: ['NPU', 'AI芯片'],
  },
  {
    company: 'Rebellions', companyEn: 'Rebellions', market: 'KR', sector: 'tech',
    stage: 'd', roundLabel: '合并+战略轮', date: '2024-10', amountUsd: 1.24e8, valuationUsd: 7.4e8,
    leadInvestors: 'KSQD Ventures、SK hynix 等', desc: '与 Sapeon 合并的韩国 AI 芯片双雄合一，对标 Groq', tags: ['NPU', 'AI芯片'],
  },
  {
    company: 'Upstage', companyEn: 'Upstage', market: 'KR', sector: 'tech',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-08', amountUsd: 2.1e7, valuationUsd: null,
    leadInvestors: 'SK Networks、KDB 等', desc: '韩国企业级 LLM（Solar），文档 AI 见长', tags: ['LLM', '企业AI'],
  },
  {
    company: 'Twelve Labs', companyEn: 'Twelve Labs', market: 'KR', sector: 'tech',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-06', amountUsd: 5.0e7, valuationUsd: null,
    leadInvestors: 'Nvidia、Kakao Ventures 等', desc: '视频多模态搜索/理解（韩裔创始团队，美韩双线）', tags: ['多模态', '视频AI'],
  },
  {
    company: 'Skelter Labs', companyEn: 'Skelter Labs', market: 'KR', sector: 'tech',
    stage: 'b', roundLabel: 'B轮及战略轮', date: '2024-03', amountUsd: 1.2e7, valuationUsd: null,
    leadInvestors: 'Hanwha 等', desc: '韩国企业 AI（对话/文档），财阀生态渗透', tags: ['企业AI', '对话'],
  },
  {
    company: 'GLi', companyEn: 'GLi', market: 'KR', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-04', amountUsd: 7.2e7, valuationUsd: 1.0e9,
    leadInvestors: 'Altos Ventures 等', desc: '韩国大模型独角兽（前 Naver 研究团队），韩语 LLM 旗舰', tags: ['大模型', '韩国AI'],
  },
  {
    company: 'VUNO', companyEn: 'VUNO', market: 'KR', sector: 'health',
    stage: 'c', roundLabel: 'C轮', date: '2022-02', amountUsd: 2.1e7, valuationUsd: null,
    leadInvestors: 'KDB产业银行等', desc: '韩国医疗影像 AI 头部，医院渗透率第一梯队', tags: ['医疗AI', '影像'],
  },
  {
    company: '今天之家（Bucketplace）', companyEn: 'Bucketplace (Ohouse)', market: 'KR', sector: 'consumer',
    stage: 'd', roundLabel: 'D轮（历史轮）', date: '2021-11', amountUsd: 2.0e8, valuationUsd: 2.0e9,
    leadInvestors: 'Mirae Asset 等', desc: '韩国家装社区电商「今天的家」，IPO 候补', tags: ['家装', '社区电商'],
  },

  // ============ 印度 ============
  {
    company: 'Zepto', companyEn: 'Zepto', market: 'IN', sector: 'consumer',
    stage: 'c', roundLabel: 'G轮', date: '2024-11', amountUsd: 1.35e9, valuationUsd: 5.0e9,
    leadInvestors: 'Motilal Oswal、Lightspeed 等', desc: '印度 10 分钟即时零售，IPO 前冲刺', tags: ['即时零售', '电商', '印度'],
  },
  {
    company: 'Meesho', companyEn: 'Meesho', market: 'IN', sector: 'consumer',
    stage: 'pe', roundLabel: 'PE轮（IPO前）', date: '2024-05', amountUsd: 3.0e8, valuationUsd: 5.0e9,
    leadInvestors: 'SoftBank、Facebook（早轮）等', desc: '印度社交电商，软银重仓 IPO 前抢筹轮', tags: ['社交电商', '印度'],
  },
  {
    company: 'Rapido', companyEn: 'Rapido', market: 'IN', sector: 'consumer',
    stage: 'e', roundLabel: 'E轮', date: '2024-06', amountUsd: 2.0e8, valuationUsd: 1.1e9,
    leadInvestors: 'WestBridge、Hero MotoCorp 等', desc: '印度摩托出租车/网约，Ola/Uber 三强格局', tags: ['出行', '印度'],
  },
  {
    company: 'Infra.Market', companyEn: 'Infra.Market', market: 'IN', sector: 'materials',
    stage: 'preipo', roundLabel: 'Pre-IPO', date: '2024-04', amountUsd: 1.0e8, valuationUsd: 2.5e9,
    leadInvestors: 'Tiger Pacific 等', desc: '建材采购平台 IPO 前最后轮，印度基建数字化', tags: ['建材', 'B2B'],
  },
  {
    company: 'Lenskart', companyEn: 'Lenskart', market: 'IN', sector: 'consumer',
    stage: 'preipo', roundLabel: 'Pre-IPO（SoftBank 老股）', date: '2024-04', amountUsd: 2.0e8, valuationUsd: 5.0e9,
    leadInvestors: 'SoftBank（次级）', desc: '眼镜垂直 D2C，2025 年 IPO 大热门', tags: ['D2C', '眼镜'],
  },
  {
    company: 'Flipkart（Google 战略轮）', companyEn: 'Flipkart', market: 'IN', sector: 'consumer',
    stage: 'pe', roundLabel: 'PE轮（战略）', date: '2024-05', amountUsd: 3.5e8, valuationUsd: 3.6e10,
    leadInvestors: 'Google、Walmart', desc: 'Walmart 旗下印度电商旗舰，IPO 前战略融资', tags: ['电商', '战略投资'],
  },
  {
    company: 'PhonePe', companyEn: 'PhonePe', market: 'IN', sector: 'finance',
    stage: 'pe', roundLabel: 'PE轮系列（IPO前）', date: '2024-03', amountUsd: null, valuationUsd: 1.2e10,
    leadInvestors: 'General Atlantic、Walmart 等', desc: '印度 UPI 支付霸主分拆独立，独角兽之王', tags: ['支付', 'UPI'],
  },
  {
    company: 'Dhan（Raise Financial）', companyEn: 'Raise Financial (Dhan)', market: 'IN', sector: 'finance',
    stage: 'c', roundLabel: 'C轮', date: '2024-07', amountUsd: 1.2e8, valuationUsd: 1.5e9,
    leadInvestors: 'Mistral Intelligence（Family Office）等', desc: '印度新券商/交易生态，Zerodha 挑战者', tags: ['券商', '金融科技'],
  },
  {
    company: 'Groww', companyEn: 'Groww', market: 'IN', sector: 'finance',
    stage: 'preipo', roundLabel: 'Pre-IPO', date: '2024-05', amountUsd: 8.3e7, valuationUsd: 3.0e9,
    leadInvestors: 'Peak XV、Tiger Global 等', desc: '印度散户投资平台 IPO 前内部轮', tags: ['投资平台', '印度'],
  },
  {
    company: 'Fractal Analytics', companyEn: 'Fractal Analytics', market: 'IN', sector: 'tech',
    stage: 'pe', roundLabel: 'PE轮（次级要约）', date: '2024-01', amountUsd: null, valuationUsd: 3.6e9,
    leadInvestors: 'TPG、Apax（次级）', desc: '印度 AI 分析服务，AI 服务公司 IPO 前老股转让', tags: ['AI服务', '分析'],
  },
  {
    company: 'Krutrim', companyEn: 'Krutrim', market: 'IN', sector: 'tech',
    stage: 'b', roundLabel: 'B轮', date: '2024-01', amountUsd: 5.0e7, valuationUsd: 1.0e9,
    leadInvestors: 'Ola 创始人 Bhavish Aggarwal 及关联方', desc: '印度首个十亿美元估值 AI 初创（Ola 系）', tags: ['大模型', '印度AI'],
  },
  {
    company: 'Sarvam AI', companyEn: 'Sarvam AI', market: 'IN', sector: 'tech',
    stage: 'a', roundLabel: 'A轮系列', date: '2024-10', amountUsd: 4.1e7, valuationUsd: null,
    leadInvestors: 'Peak XV、Lightspeed 等', desc: '印度主权大模型（政府合作），印度 AI 国家队', tags: ['大模型', '主权AI'],
  },
  {
    company: 'Physics Wallah', companyEn: 'Physics Wallah', market: 'IN', sector: 'consumer',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-09', amountUsd: 2.1e8, valuationUsd: 2.8e9,
    leadInvestors: 'Hornbill、WestBridge 等', desc: '印度教培转型样本，从 YouTube 到独角兽', tags: ['教育', '印度'],
  },
  {
    company: 'Atlan', companyEn: 'Atlan', market: 'IN', sector: 'tech',
    stage: 'c', roundLabel: 'C轮', date: '2024-10', amountUsd: 1.05e8, valuationUsd: 7.5e8,
    leadInvestors: 'D1 Capital Partners', desc: '数据治理平台（印度 SaaS 出海标杆）', tags: ['数据平台', 'SaaS出海'],
  },
  {
    company: 'Chargezone 系 Exponent Energy', companyEn: 'Exponent Energy', market: 'IN', sector: 'energy',
    stage: 'c', roundLabel: 'C轮', date: '2024-11', amountUsd: 5.0e7, valuationUsd: null,
    leadInvestors: 'Eight Roads、Lightspeed 等', desc: '印度电动车 15 分钟快充网络', tags: ['充电', '电动出行'],
  },
  {
    company: 'Zetwerk', companyEn: 'Zetwerk', market: 'IN', sector: 'industrial',
    stage: 'f', roundLabel: 'F轮系列', date: '2024-06', amountUsd: 3.0e8, valuationUsd: 2.7e9,
    leadInvestors: 'Peak XV、B Capital 等', desc: '印度制造业 B2B 订单平台，IPO 前回调后重回增长', tags: ['B2B制造', '供应链'],
  },
  {
    company: 'Porter', companyEn: 'Porter', market: 'IN', sector: 'industrial',
    stage: 'f', roundLabel: 'F轮', date: '2025-05', amountUsd: 2.0e8, valuationUsd: 1.2e9,
    leadInvestors: 'KSFB、Lightstone 等', desc: '印度城配物流卡车平台，IPO 前扩张', tags: ['物流', '印度'],
  },
  {
    company: 'Ola Electric（上市前最后一级轮）', companyEn: 'Ola Electric', market: 'IN', sector: 'industrial',
    stage: 'preipo', roundLabel: 'Pre-IPO（历史轮）', date: '2023-10', amountUsd: 2.4e8, valuationUsd: 5.4e9,
    leadInvestors: 'Temasek、MoneyFront 等', desc: '印度电动两轮车龙头，2024 年 8 月 IPO', tags: ['电动车', '印度'],
  },

  // ============ 东南亚 ============
  {
    company: 'Advance Intelligence Group', companyEn: 'Advance Intelligence Group (Atome)', market: 'SEA', sector: 'finance',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-05', amountUsd: 8.0e7, valuationUsd: null,
    leadInvestors: 'Lau Choon Peng、GA 等', desc: '先买后付 Atome + 风控 AI（新加坡），东南亚支付旗舰', tags: ['BNPL', '风控'],
  },
  {
    company: 'Ajaib', companyEn: 'Ajaib', market: 'SEA', sector: 'finance',
    stage: 'c', roundLabel: 'C轮系列', date: '2024-06', amountUsd: 6.5e7, valuationUsd: 1.0e9,
    leadInvestors: 'SoftBank Vision Fund 2 等', desc: '印尼散户投资 App，软银重仓', tags: ['投资平台', '印尼'],
  },
  {
    company: 'Sky Mavis', companyEn: 'Sky Mavis', market: 'SEA', sector: 'tech',
    stage: 'b', roundLabel: 'B轮扩展（游戏）', date: '2024-06', amountUsd: null, valuationUsd: null,
    leadInvestors: 'Folius Ventures 等', desc: 'Axie Infinity 母公司（越南），Web3 游戏重生叙事', tags: ['游戏', 'Web3'],
  },
  {
    company: 'VNG', companyEn: 'VNG', market: 'SEA', sector: 'comm',
    stage: 'preipo', roundLabel: 'Pre-IPO（战略轮）', date: '2023-08', amountUsd: null, valuationUsd: 2.6e9,
    leadInvestors: 'Vietnam Investments Group 等', desc: '越南互联网旗舰（Zalo），纳斯达克 IPO 折戟后再启', tags: ['互联网', '越南'],
  },
  {
    company: 'XTransfer', companyEn: 'XTransfer', market: 'CN', sector: 'finance',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-02', amountUsd: null, valuationUsd: 1.0e9,
    leadInvestors: '宜信等', desc: '外贸 B2B 跨境收付（上海+新加坡双总部），中小外贸企业收款基建', tags: ['跨境支付', 'B2B'],
  },
  {
    company: 'ShopUp', companyEn: 'ShopUp', market: 'SEA', sector: 'finance',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-10', amountUsd: 1.1e8, valuationUsd: null,
    leadInvestors: 'Peak XV、Flint Capital', desc: '孟加拉小微商户供货+信贷网络，服务百万级小店', tags: ['小微金融', 'B2B'],
  },
  {
    company: 'Ninja Van（次级要约）', companyEn: 'Ninja Van', market: 'SEA', sector: 'industrial',
    stage: 'pe', roundLabel: 'PE轮（次级）', date: '2024-03', amountUsd: null, valuationUsd: 1.1e9,
    leadInvestors: 'B Capital（次级要约）', desc: '东南亚快递网络，估值从峰值回调的样本', tags: ['物流', '估值回调'],
  },
  {
    company: 'Pathao', companyEn: 'Pathao', market: 'SEA', sector: 'consumer',
    stage: 'c', roundLabel: 'C轮系列', date: '2023-11', amountUsd: 1.2e7, valuationUsd: null,
    leadInvestors: 'Upside VC 等', desc: '孟加拉出行/物流平台，南亚次大陆本土化样本', tags: ['出行', '物流', '孟加拉'],
  },
  {
    company: 'GudangAda', companyEn: 'GudangAda', market: 'SEA', sector: 'consumer',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-01', amountUsd: 2.5e7, valuationUsd: null,
    leadInvestors: 'Wavemaker、Jungle Ventures', desc: '印尼 B2B 批发电商', tags: ['B2B电商', '印尼'],
  },
  {
    company: 'Paywatch', companyEn: 'Paywatch', market: 'SEA', sector: 'finance',
    stage: 'a', roundLabel: 'A轮', date: '2024-07', amountUsd: 2.0e7, valuationUsd: null,
    leadInvestors: '韩国 KIP、Z venture capital 等', desc: '马来西亚/东南亚 Earned Wage Access（工资预支）', tags: ['普惠金融', '马来西亚'],
  },

  // ============ 拉美 ============
  {
    company: 'Clip', companyEn: 'Clip', market: 'LATAM', sector: 'finance',
    stage: 'pe', roundLabel: 'PE轮（成长期）', date: '2023-11', amountUsd: 1.0e8, valuationUsd: null,
    leadInvestors: 'Vibrant Ventures 等', desc: '墨西哥移动 POS 支付龙头，金融科技复苏样本', tags: ['支付', '墨西哥'],
  },
  {
    company: 'Kavak', companyEn: 'Kavak', market: 'LATAM', sector: 'consumer',
    stage: 'pe', roundLabel: 'PE轮（扭亏后）', date: '2024-05', amountUsd: 4.5e7, valuationUsd: null,
    leadInvestors: 'General Catalyst 等', desc: '墨西哥二手车电商，从估值 87 亿峰值回调后实现盈利', tags: ['二手车', '估值回调'],
  },
  {
    company: 'Creditas', companyEn: 'Creditas', market: 'LATAM', sector: 'finance',
    stage: 'f', roundLabel: 'F轮系列', date: '2024-02', amountUsd: null, valuationUsd: null,
    leadInvestors: '次级+老股重组', desc: '巴西资产抵押贷款平台，巴西利率地狱里的幸存者', tags: ['信贷', '巴西'],
  },
  {
    company: 'Belvo', companyEn: 'Belvo', market: 'LATAM', sector: 'finance',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-08', amountUsd: 4.3e7, valuationUsd: null,
    leadInvestors: 'Octopus Ventures 等', desc: '拉美开放金融 API（墨/巴西），Plaid 对标', tags: ['开放金融', 'API'],
  },
  {
    company: 'Jeeves', companyEn: 'Jeeves', market: 'LATAM', sector: 'finance',
    stage: 'c', roundLabel: 'C轮', date: '2023-11', amountUsd: 1.8e8, valuationUsd: 2.1e9,
    leadInvestors: 'Credit Suisse（后瑞银接手）、CRV 等', desc: '拉美/全球跨境企业支出与信贷平台，估值一年三倍', tags: ['企业卡', '跨境'],
  },
  {
    company: 'Matera', companyEn: 'Matera', market: 'LATAM', sector: 'finance',
    stage: 'c', roundLabel: 'C轮', date: '2024-09', amountUsd: 6.0e7, valuationUsd: null,
    leadInvestors: 'Tiger Global 等', desc: '巴西银行核心系统云化（Core Banking SaaS）', tags: ['银行SaaS', '巴西'],
  },

  // ============ 中东非 ============
  {
    company: 'Tabby', companyEn: 'Tabby', market: 'MEA', sector: 'finance',
    stage: 'pe', roundLabel: 'E轮及债务融资', date: '2025-09', amountUsd: null, valuationUsd: 3.3e9,
    leadInvestors: '阿联酋主权基金等', desc: '中东北非 BNPL 龙头，估值翻倍冲刺 IPO', tags: ['BNPL', '中东'],
  },
  {
    company: 'Tamara', companyEn: 'Tamara', market: 'MEA', sector: 'finance',
    stage: 'c', roundLabel: 'C轮（债务+股权）', date: '2023-09', amountUsd: 3.4e8, valuationUsd: 1.0e9,
    leadInvestors: 'Sanabil Investments（PIF 旗下）', desc: '沙特 BNPL 双雄之一，C 轮即独角兽', tags: ['BNPL', '沙特'],
  },
  {
    company: 'Flutterwave', companyEn: 'Flutterwave', market: 'MEA', sector: 'finance',
    stage: 'd', roundLabel: 'D轮系列', date: '2024-06', amountUsd: null, valuationUsd: 3.0e9,
    leadInvestors: 'B Capital（D轮领投，持续跟投）', desc: '非洲支付基础设施，IPO 前整改治理后重回增长', tags: ['支付', '非洲'],
  },
  {
    company: 'Nana', companyEn: 'Nana', market: 'MEA', sector: 'consumer',
    stage: 'c', roundLabel: 'C轮系列', date: '2023-10', amountUsd: 1.3e8, valuationUsd: null,
    leadInvestors: 'SAED、MNT-P 等', desc: '沙特生鲜杂货电商，海湾市场头部', tags: ['电商', '沙特'],
  },
  {
    company: 'Instabug', companyEn: 'Instabug', market: 'MEA', sector: 'tech',
    stage: 'b', roundLabel: 'B轮系列', date: '2024-01', amountUsd: 4.6e7, valuationUsd: null,
    leadInvestors: 'Insight Partners 等', desc: '移动应用监控 SDK（埃及出海标杆）', tags: ['开发者工具', '埃及'],
  },
  {
    company: 'Rain（加密金融）', companyEn: 'Rain', market: 'MEA', sector: 'finance',
    stage: 'c', roundLabel: 'C轮系列', date: '2024-08', amountUsd: null, valuationUsd: null,
    leadInvestors: '科威特投资局（KIA）等主权基金', desc: '中东合规加密交易所（科威特/巴林），主权基金入场', tags: ['加密', '交易所'],
  },
]
