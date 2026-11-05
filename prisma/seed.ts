/**
 * 棱镜投研 PrismLens — 种子数据脚本
 * 运行: bun prisma/seed.ts
 * 说明: 所有数据均为演示用模拟数据，不构成任何投资建议。
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/* ---------------- 类型 ---------------- */
type Signal = { label: string; score: number; reason: string }
type Signals = { dow: Signal; value: Signal; fundamental: Signal; quant: Signal }

/* ---------------- 宏观数据（12 个季度，衰退→复苏叙事） ---------------- */
const macroRows = [
  { period: '2023Q1', gdpGrowth: 4.5, cpi: 1.3, pmi: 51.9, yield10Y: 2.9, m2Growth: 12.6, phase: 'recession' },
  { period: '2023Q2', gdpGrowth: 6.3, cpi: 0.1, pmi: 50.3, yield10Y: 2.65, m2Growth: 11.3, phase: 'recession' },
  { period: '2023Q3', gdpGrowth: 4.9, cpi: -0.1, pmi: 50.2, yield10Y: 2.64, m2Growth: 10.3, phase: 'recession' },
  { period: '2023Q4', gdpGrowth: 5.2, cpi: -0.3, pmi: 49.0, yield10Y: 2.56, m2Growth: 9.7, phase: 'recession' },
  { period: '2024Q1', gdpGrowth: 5.3, cpi: 0.1, pmi: 50.8, yield10Y: 2.3, m2Growth: 8.3, phase: 'recession' },
  { period: '2024Q2', gdpGrowth: 4.7, cpi: 0.3, pmi: 49.5, yield10Y: 2.21, m2Growth: 6.2, phase: 'recession' },
  { period: '2024Q3', gdpGrowth: 4.6, cpi: 0.4, pmi: 49.8, yield10Y: 2.15, m2Growth: 6.8, phase: 'recession' },
  { period: '2024Q4', gdpGrowth: 5.4, cpi: 0.2, pmi: 50.1, yield10Y: 1.7, m2Growth: 7.3, phase: 'recovery' },
  { period: '2025Q1', gdpGrowth: 5.4, cpi: 0.1, pmi: 50.5, yield10Y: 1.82, m2Growth: 7.0, phase: 'recovery' },
  { period: '2025Q2', gdpGrowth: 5.2, cpi: 0.4, pmi: 49.7, yield10Y: 1.64, m2Growth: 8.3, phase: 'recovery' },
  { period: '2025Q3', gdpGrowth: 5.1, cpi: 0.5, pmi: 50.2, yield10Y: 1.78, m2Growth: 8.1, phase: 'recovery' },
  { period: '2025Q4', gdpGrowth: 5.2, cpi: 0.6, pmi: 50.8, yield10Y: 1.9, m2Growth: 7.9, phase: 'recovery' },
]

/* ---------------- 行业数据 ---------------- */
const industries = [
  {
    slug: 'new-energy', name: '新能源与储能', lifecycle: '成长期', cyclicality: '强周期',
    avgPe: 28, growthYoY: 32, prosperity: 78,
    summary: '全球双碳主线下的高景气赛道，储能与出海构成第二增长曲线；国内产能阶段性过剩，落后产能正在出清，头部集中度提升。',
    pest: {
      political: '双碳目标与新型电力系统建设长期利好；欧美对本土制造的补贴（IRA 等）带来出海壁垒与机遇并存。',
      economic: '全球储能装机年复合增速 40%+，锂价企稳后电芯盈利修复；国内价格战压缩二线厂商利润。',
      social: '工商业与户用储能渗透率快速提升，绿色消费理念普及。',
      technological: '大容量电芯、钠离子电池、构网型储能技术迭代加速，研发投入成为护城河。',
    },
    porter: { rivalry: 78, suppliers: 42, buyers: 65, entrants: 55, substitutes: 35 },
    chain: { upstream: ['锂矿/碳酸锂', '正负极材料', '电解液', '隔膜'], midstream: ['电芯制造', 'PACK 集成', 'PCS 变流器'], downstream: ['储能电站', '新能源车企', '工商业用户'] },
    leaders: ['华晟新能', '中恒光伏', '沧澜动力'],
  },
  {
    slug: 'semiconductor', name: '半导体', lifecycle: '成长期', cyclicality: '强周期',
    avgPe: 45, growthYoY: 24, prosperity: 72,
    summary: 'AI 算力与国产替代双轮驱动，设备/材料环节国产化率仍低，成长空间大；估值对流动性敏感，波动剧烈。',
    pest: {
      political: '出口管制倒逼国产替代，国家大基金持续投入，政策安全边际高。',
      economic: '全球半导体销售额重回上行周期，晶圆厂稼动率回升；车规与 AI 芯片需求旺盛。',
      social: '数字基础设施成为社会共识性投资方向。',
      technological: '先进制程受限背景下，Chiplet、第三代半导体成为弯道超车路径。',
    },
    porter: { rivalry: 60, suppliers: 70, buyers: 50, entrants: 40, substitutes: 30 },
    chain: { upstream: ['硅片', '光刻胶', '电子特气', 'EDA/IP'], midstream: ['晶圆代工', '存储', '封测'], downstream: ['消费电子', '汽车电子', 'AI 服务器'] },
    leaders: ['芯睿微电', '九章材料'],
  },
  {
    slug: 'biotech', name: '创新药与生物科技', lifecycle: '引入期', cyclicality: '弱周期',
    avgPe: 58, growthYoY: 18, prosperity: 66,
    summary: '研发周期长、不确定性高、天花板极高；管线价值与 License-out 交易是核心变量，一级市场活跃。',
    pest: {
      political: '创新药全链条支持政策落地，医保谈判规则趋于温和，鼓励真创新。',
      economic: 'Biotech 融资环境边际改善，BD 交易（对外授权）金额屡创新高。',
      social: '人口老龄化与慢病负担带来长期需求。',
      technological: 'ADC、双抗、细胞与基因治疗平台技术爆发，AI 制药提升研发效率。',
    },
    porter: { rivalry: 55, suppliers: 35, buyers: 60, entrants: 45, substitutes: 40 },
    chain: { upstream: ['靶点发现', 'CRO 服务', '原料药/试剂'], midstream: ['创新药企', 'CDMO 生产'], downstream: ['医院终端', '医保/商保', '海外授权'] },
    leaders: ['珀生生物', '康桥医疗'],
  },
  {
    slug: 'liquor', name: '白酒与食品饮料', lifecycle: '成熟期', cyclicality: '弱周期',
    avgPe: 21, growthYoY: 7, prosperity: 54,
    summary: '现金流充沛、品牌护城河深厚的经典价值投资板块；量减价增，高端集中、大众分化，股息率具备吸引力。',
    pest: {
      political: '消费刺激政策频出，禁酒令对政务场景仍有扰动。',
      economic: '商务需求弱复苏，批价承压；龙头主动控量挺价。',
      social: '年轻群体饮酒习惯变化，健康化、低度化趋势明显。',
      technological: '数字化营销与直销渠道占比提升。',
    },
    porter: { rivalry: 45, suppliers: 25, buyers: 70, entrants: 15, substitutes: 50 },
    chain: { upstream: ['高粱/小麦', '包装材料'], midstream: ['酿造生产', '品牌运营'], downstream: ['经销商', '商超/电商', '宴席/商务'] },
    leaders: ['云顶酿坊', '丰年食品'],
  },
  {
    slug: 'electronics', name: '消费电子与智能制造', lifecycle: '成熟期', cyclicality: '强周期',
    avgPe: 17, growthYoY: 5, prosperity: 50,
    summary: '手机整机进入存量博弈，零部件环节受益于 AI 终端创新周期；机器人、AIoT 是打开第二曲线的关键。',
    pest: {
      political: '出口环境与关税扰动供应链布局，东南亚转移加速。',
      economic: '全球手机出货量低个位数复苏，换机周期拉长；AI 手机带动 BOM 升级。',
      social: '消费分级：高端化与性价比并存。',
      technological: '端侧 AI、折叠屏、人形机器人零部件复用成为新增长点。',
    },
    porter: { rivalry: 72, suppliers: 45, buyers: 75, entrants: 35, substitutes: 40 },
    chain: { upstream: ['MLCC/阻容感', '面板', '存储芯片'], midstream: ['整机 ODM', '零部件模组', '精密结构件'], downstream: ['品牌手机/PC', '汽车电子', '机器人'] },
    leaders: ['星澜智造', '澜庭电子', '天工智造'],
  },
  {
    slug: 'utility', name: '公用事业（电力）', lifecycle: '成熟期', cyclicality: '弱周期',
    avgPe: 14, growthYoY: 4, prosperity: 58,
    summary: '类债券资产：现金流稳定、股息率高，是利率下行周期的核心受益板块；电改带来绿电弹性。',
    pest: {
      political: '电力市场化改革推进，容量电价与绿电交易机制逐步完善。',
      economic: '10 年期国债收益率降至 2% 下方，高股息资产配置价值凸显。',
      social: '全社会用电量保持中速增长，新能源车充电需求抬升。',
      technological: '特高压、虚拟电厂与源网荷储一体化改造。',
    },
    porter: { rivalry: 25, suppliers: 40, buyers: 55, entrants: 20, substitutes: 30 },
    chain: { upstream: ['煤炭/天然气', '水风光资源', '发电设备'], midstream: ['发电运营', '输配电'], downstream: ['工商业用电', '居民用电', '电网公司'] },
    leaders: ['清江水电', '恒岳电网'],
  },
  {
    slug: 'realestate', name: '房地产', lifecycle: '衰退期', cyclicality: '强周期',
    avgPe: 9, growthYoY: -12, prosperity: 28,
    summary: '行业总量见顶后的深度调整期，政策底已现但基本面仍在寻底；剩者为王，代建与物业是转型方向。',
    pest: {
      political: '限购全面松绑、收储与白名单融资支持，政策态度从压制转为托底。',
      economic: '销售与开工仍在负增长，房价预期尚未扭转，库存高企。',
      social: '人口结构与城镇化速率变化，改善需求替代刚需成为主力。',
      technological: '装配式建筑与代建数字化提升管理效率。',
    },
    porter: { rivalry: 85, suppliers: 60, buyers: 80, entrants: 10, substitutes: 45 },
    chain: { upstream: ['土地/建材', '建筑承包'], midstream: ['开发建设', '销售运营'], downstream: ['购房人', '物业管理', '存量运营'] },
    leaders: ['泽川置业', '泰筑控股'],
  },
  {
    slug: 'retail', name: '传统零售', lifecycle: '衰退期', cyclicality: '强周期',
    avgPe: 14, growthYoY: -6, prosperity: 32,
    summary: '线下客流被电商与即时零售持续分流，传统商超收缩；转型折扣店、会员店与国货美妆的个股存在结构性机会。',
    pest: {
      political: '促消费政策与线下业态创新获得支持。',
      economic: '社零总额低增速运行，线上渗透率仍在提升。',
      social: '消费习惯迁移：性价比、即时性、体验感成为关键词。',
      technological: '即时零售、直播电商重塑履约链路。',
    },
    porter: { rivalry: 80, suppliers: 50, buyers: 78, entrants: 40, substitutes: 75 },
    chain: { upstream: ['品牌供应商', '物流仓配'], midstream: ['门店零售', '电商平台'], downstream: ['消费者'] },
    leaders: ['万客隆商超', '悦己美妆'],
  },
  {
    slug: 'coal', name: '煤炭与传统能源', lifecycle: '衰退期', cyclicality: '强周期',
    avgPe: 7, growthYoY: -8, prosperity: 40,
    summary: '长期需求见顶，但供给约束下的盈利韧性超预期；高股息策略主力板块，价值重估仍在演绎。',
    pest: {
      political: '能源安全优先，先进产能核增与长协机制保障盈利下限。',
      economic: '煤价中枢回落但成本同步下降，行业利润仍处历史较高分位。',
      social: '双碳长期约束资本开支，行业进入红利分配期。',
      technological: '智能化矿井降本增效，煤电联营与绿电转型。',
    },
    porter: { rivalry: 40, suppliers: 30, buyers: 65, entrants: 5, substitutes: 60 },
    chain: { upstream: ['采掘设备', '爆破服务'], midstream: ['煤炭开采', '洗选/煤化工'], downstream: ['火电', '钢铁/建材', '化工'] },
    leaders: ['昆仑能源', '岭南矿业'],
  },
]

/* ---------------- 企业数据 ---------------- */
type Co = {
  ticker: string; name: string; ind: string; stage: string; round: string; listed: boolean;
  marketCapE8: number; price: number; chg1Y: number;
  pe: number | null; pb: number; psTtm: number | null;
  roe: number; grossMargin: number; netMargin: number; debtRatio: number;
  revenueGrowth: number; profitGrowth: number; dividendYield: number | null;
  moatType: string; moatScore: number; moatDesc: string;
  revenueE8: number; profitE8: number; // 最新年度营收/净利（亿）
  desc: string; tags: string[]; foundedYear: number;
}

const companies: Co[] = [
  // —— 新能源与储能 ——
  { ticker: 'HSXN', name: '华晟新能', ind: 'new-energy', stage: '成长期', round: '已上市', listed: true, marketCapE8: 860, price: 42.5, chg1Y: 38.2, pe: 32.4, pb: 5.2, psTtm: 3.1, roe: 18.6, grossMargin: 26.4, netMargin: 11.2, debtRatio: 58, revenueGrowth: 42, profitGrowth: 55, dividendYield: 0.6, moatType: '成本优势 + 规模效应', moatScore: 8.5, moatDesc: '单位能耗与良率行业最优，海外基地规避关税，出货规模全球前三摊薄研发费用。', revenueE8: 386, profitE8: 43.2, desc: '全球储能电池头部企业，大容量电芯出货量全球前三，海外收入占比提升至 45%。', tags: ['储能', '出海', '碳中和'], foundedYear: 2011 },
  { ticker: 'CLDL', name: '沧澜动力', ind: 'new-energy', stage: '成长期', round: 'A轮', listed: false, marketCapE8: 28, price: 0, chg1Y: 0, pe: null, pb: 6.5, psTtm: 22, roe: -8.2, grossMargin: 18.5, netMargin: -22, debtRatio: 41, revenueGrowth: 120, profitGrowth: -18, dividendYield: null, moatType: '专利技术', moatScore: 7.2, moatDesc: '氢燃料电池电堆功率密度行业领先，已获 217 项发明专利，绑定两家头部商用车企定点。', revenueE8: 1.3, profitE8: -0.29, desc: '氢燃料电池电堆与系统开发商，A 轮融资 2.8 亿元，商业化定点车型逐步放量。', tags: ['氢能', 'VC/早期', '未盈利'], foundedYear: 2019 },
  { ticker: 'ZHGF', name: '中恒光伏', ind: 'new-energy', stage: '成长期', round: '已上市', listed: true, marketCapE8: 312, price: 15.6, chg1Y: -8.5, pe: 21.5, pb: 2.8, psTtm: 1.4, roe: 12.4, grossMargin: 18.5, netMargin: 6.5, debtRatio: 58, revenueGrowth: 18, profitGrowth: 9.5, dividendYield: 1.1, moatType: '成本优势', moatScore: 6.8, moatDesc: '一体化产能成本位于行业第一梯队，但行业整体产能过剩压制盈利弹性。', revenueE8: 218, profitE8: 14.2, desc: '光伏组件一体化厂商，盈利处于周期底部，TOPCon 新技术产能占比过半。', tags: ['光伏', '周期底部'], foundedYear: 2008 },
  // —— 半导体 ——
  { ticker: 'XRWD', name: '芯睿微电', ind: 'semiconductor', stage: '成长期', round: '已上市', listed: true, marketCapE8: 528, price: 66.2, chg1Y: 52.4, pe: 48.6, pb: 6.8, psTtm: 9.2, roe: 15.2, grossMargin: 41.2, netMargin: 18.6, debtRatio: 32, revenueGrowth: 35, profitGrowth: 42, dividendYield: 0.4, moatType: '转换成本', moatScore: 8.2, moatDesc: '车规级 MCU 通过 AEC-Q100 认证并进入 20 余家车企供应链，车规认证周期构成天然壁垒。', revenueE8: 57.4, profitE8: 10.7, desc: '车规级 MCU 设计龙头，受益于电动智能化与国产替代双击，在研芯片制程持续升级。', tags: ['车规MCU', '国产替代'], foundedYear: 2012 },
  { ticker: 'JZCL', name: '九章材料', ind: 'semiconductor', stage: '成长期', round: 'PE轮(Pre-IPO)', listed: false, marketCapE8: 96, price: 0, chg1Y: 0, pe: null, pb: 8.2, psTtm: 14, roe: 9.8, grossMargin: 52, netMargin: 14, debtRatio: 28, revenueGrowth: 52, profitGrowth: 66, dividendYield: null, moatType: '专利技术（无形资产）', moatScore: 8.4, moatDesc: '高端光刻胶通过多家晶圆厂验证并批量供货，配方与工艺 know-how 构成核心壁垒， Pre-IPO 估值对应 2025 年约 12 倍 PS。', revenueE8: 6.9, profitE8: 0.96, desc: '半导体光刻胶国产替代领军者，KrF/ArF 产品批量出货，PE 轮融资后拟申报科创板。', tags: ['光刻胶', 'PE轮', 'Pre-IPO'], foundedYear: 2015 },
  // —— 创新药与生物科技 ——
  { ticker: 'PSSW', name: '珀生生物', ind: 'biotech', stage: '初创期', round: 'B轮', listed: false, marketCapE8: 45, price: 0, chg1Y: 0, pe: null, pb: 9.5, psTtm: null, roe: -15.5, grossMargin: 78, netMargin: -60, debtRatio: 22, revenueGrowth: 180, profitGrowth: -25, dividendYield: null, moatType: '专利技术', moatScore: 8.8, moatDesc: 'ADC 平台分子设计全球差异化，核心管线 II 期数据优异，已与海外大药企签订总额 12 亿美元 License-out。', revenueE8: 2.2, profitE8: -1.32, desc: '聚焦 ADC 创新药的研发型 Biotech，B 轮融资 5 亿元，核心管线处于关键 II 期临床。', tags: ['创新药', 'VC/早期', '临床II期'], foundedYear: 2018 },
  { ticker: 'KQYL', name: '康桥医疗', ind: 'biotech', stage: '成长期', round: '已上市', listed: true, marketCapE8: 402, price: 33.8, chg1Y: 26.8, pe: 41.2, pb: 5.6, psTtm: 7.8, roe: 13.8, grossMargin: 38.5, netMargin: 15.2, debtRatio: 30, revenueGrowth: 24, profitGrowth: 28, dividendYield: 0.5, moatType: '规模效应 + 客户粘性', moatScore: 7.4, moatDesc: 'CXO 一体化服务平台，产能与项目经验形成交付优势，海外大订单占比稳定。', revenueE8: 51.5, profitE8: 7.8, desc: '临床前 CRO + CDMO 一体化服务商，受益于创新药研发外包率提升与海外订单回流。', tags: ['CXO', '创新药产业链'], foundedYear: 2009 },
  // —— 白酒与食品饮料 ——
  { ticker: 'YDNF', name: '云顶酿坊', ind: 'liquor', stage: '成熟期', round: '已上市', listed: true, marketCapE8: 2100, price: 168, chg1Y: 12.5, pe: 19.8, pb: 4.9, psTtm: 8.5, roe: 26.5, grossMargin: 78.2, netMargin: 34.2, debtRatio: 18, revenueGrowth: 9.5, profitGrowth: 12, dividendYield: 3.1, moatType: '品牌（无形资产）', moatScore: 9.2, moatDesc: '百年老窖池不可复制，品牌溢价支撑批价，预收款蓄水池平滑周期波动。', revenueE8: 247, profitE8: 84.5, desc: '高端酱香白酒龙头，渠道库存去化充分，分红率提升至 55%，股息率超 3%。', tags: ['高端白酒', '消费龙头'], foundedYear: 1952 },
  { ticker: 'FNSP', name: '丰年食品', ind: 'liquor', stage: '成熟期', round: '已上市', listed: true, marketCapE8: 486, price: 38.5, chg1Y: 5.2, pe: 25.6, pb: 4.1, psTtm: 6.2, roe: 19.8, grossMargin: 42.5, netMargin: 16.1, debtRatio: 25, revenueGrowth: 6.8, profitGrowth: 8.5, dividendYield: 2.2, moatType: '渠道网络', moatScore: 7.6, moatDesc: '百万级终端网点密织，餐饮渠道粘性强，提价能力温和但稳定。', revenueE8: 78.4, profitE8: 12.6, desc: '复合调味品绝对龙头，餐饮供应链复苏受益标的，第二曲线复调菜品持续放量。', tags: ['调味品', '餐饮链'], foundedYear: 1996 },
  // —— 消费电子与智能制造 ——
  { ticker: 'XLZZ', name: '星澜智造', ind: 'electronics', stage: '成熟期', round: '已上市', listed: true, marketCapE8: 286, price: 24.8, chg1Y: 8.6, pe: 14.2, pb: 2.3, psTtm: 0.6, roe: 16.1, grossMargin: 12.8, netMargin: 4.2, debtRatio: 62, revenueGrowth: 5.2, profitGrowth: 3.8, dividendYield: 2.8, moatType: '规模效应', moatScore: 6.8, moatDesc: '全球手机 ODM 出货量第一，规模摊薄成本，AI 服务器电源与汽车电子打开第二曲线。', revenueE8: 958, profitE8: 40.2, desc: '消费电子 ODM 龙头，低毛利高周转模式，向 AIoT 与汽车电子平台化扩展。', tags: ['ODM', '低估值'], foundedYear: 2001 },
  { ticker: 'LTDZ', name: '澜庭电子', ind: 'electronics', stage: '成长期', round: '已上市', listed: true, marketCapE8: 356, price: 48.6, chg1Y: 45.2, pe: 26.8, pb: 3.6, psTtm: 4.5, roe: 14.2, grossMargin: 24.5, netMargin: 8.6, debtRatio: 44, revenueGrowth: 22, profitGrowth: 30, dividendYield: 0.9, moatType: '转换成本', moatScore: 7.0, moatDesc: 'MLCC 高容产品进入大客户供应链，车规品认证周期长、替换成本高。', revenueE8: 79.1, profitE8: 6.8, desc: '被动元件平台型企业，AI 终端与汽车电子拉动高容 MLCC 需求反转。', tags: ['MLCC', 'AI终端'], foundedYear: 2002 },
  { ticker: 'TGZZ', name: '天工智造', ind: 'electronics', stage: '初创期', round: '天使轮', listed: false, marketCapE8: 3.5, price: 0, chg1Y: 0, pe: null, pb: 4.2, psTtm: 28, roe: -6.5, grossMargin: 32, netMargin: -18, debtRatio: 18, revenueGrowth: 150, profitGrowth: -35, dividendYield: null, moatType: '专利技术 + 团队', moatScore: 6.2, moatDesc: '核心团队来自头部机器人实验室，人形机器人关节模组完成三代迭代，尚处小批量交付阶段。', revenueE8: 0.12, profitE8: -0.02, desc: '人形机器人整机与关节模组初创公司，天使轮融资 8000 万元，估值 3.5 亿元。', tags: ['人形机器人', '天使轮', '具身智能'], foundedYear: 2024 },
  // —— 公用事业 ——
  { ticker: 'QJSD', name: '清江水电', ind: 'utility', stage: '成熟期', round: '已上市', listed: true, marketCapE8: 1560, price: 25.6, chg1Y: 18.5, pe: 16.8, pb: 2.6, psTtm: 5.8, roe: 13.2, grossMargin: 58.2, netMargin: 32.4, debtRatio: 55, revenueGrowth: 6.2, profitGrowth: 9.8, dividendYield: 4.6, moatType: '自然资源垄断', moatScore: 8.8, moatDesc: '流域梯级电站资源不可复制，折旧到期后利润自然释放，六库联调增发电量。', revenueE8: 269, profitE8: 87.2, desc: '流域水电运营龙头，来水改善 + 电价上行双击，承诺分红率不低于 70%。', tags: ['水电', '高股息', '核心资产'], foundedYear: 1993 },
  { ticker: 'HYDW', name: '恒岳电网', ind: 'utility', stage: '成熟期', round: '已上市', listed: true, marketCapE8: 980, price: 12.4, chg1Y: 15.2, pe: 11.2, pb: 1.4, psTtm: 2.2, roe: 9.6, grossMargin: 28.5, netMargin: 11.2, debtRatio: 60, revenueGrowth: 3.5, profitGrowth: 5.2, dividendYield: 5.2, moatType: '自然垄断', moatScore: 8.0, moatDesc: '区域输配电网特许经营，收益率受政策保障，现金流极其稳定。', revenueE8: 445, profitE8: 49.8, desc: '区域电网运营商，类债券资产，受益于利率下行与电力市场化改革。', tags: ['电网', '类债券'], foundedYear: 1988 },
  // —— 房地产 ——
  { ticker: 'ZCCZ', name: '泽川置业', ind: 'realestate', stage: '衰退期', round: '已上市', listed: true, marketCapE8: 128, price: 5.4, chg1Y: -22.5, pe: 7.8, pb: 0.55, psTtm: 0.3, roe: 2.1, grossMargin: 14.2, netMargin: 2.2, debtRatio: 76, revenueGrowth: -18, profitGrowth: -35, dividendYield: null, moatType: '无明显护城河', moatScore: 2.5, moatDesc: '土储集中在高能级城市是唯一亮点，但历史高价地块持续减值侵蚀净资产。', revenueE8: 426, profitE8: 9.4, desc: '区域型房企，销售仍在负增长，依赖白名单融资维持流动性，减值压力未出清。', tags: ['困境反转?', '高杠杆'], foundedYear: 1998 },
  { ticker: 'TZKG', name: '泰筑控股', ind: 'realestate', stage: '衰退期', round: '已上市', listed: true, marketCapE8: 86, price: 4.2, chg1Y: -15.8, pe: 9.4, pb: 0.48, psTtm: 0.2, roe: 1.2, grossMargin: 11.5, netMargin: 1.1, debtRatio: 81, revenueGrowth: -24, profitGrowth: -52, dividendYield: null, moatType: '转型中的代建能力', moatScore: 3.5, moatDesc: '轻资产代建业务毛利率 35%，占比快速提升，但开发主业拖累整体报表。', revenueE8: 385, profitE8: 4.2, desc: '房企转型样本：代建 + 物业双轮，开发业务缩表求存。', tags: ['转型', '代建'], foundedYear: 2001 },
  // —— 传统零售 ——
  { ticker: 'MKL', name: '万客隆商超', ind: 'retail', stage: '衰退期', round: '已上市', listed: true, marketCapE8: 96, price: 8.6, chg1Y: -5.5, pe: 12.6, pb: 1.1, psTtm: 0.4, roe: 7.8, grossMargin: 22.4, netMargin: 2.8, debtRatio: 52, revenueGrowth: -6.2, profitGrowth: -8.5, dividendYield: 2.4, moatType: '区域规模效应', moatScore: 5.0, moatDesc: '华东区域物流与网点密度仍具成本优势，自有品牌占比提升对冲客流下滑。', revenueE8: 245, profitE8: 6.9, desc: '区域商超龙头，门店调改与即时零售合作初见成效，行业出清后份额有望回升。', tags: ['商超', '出清受益'], foundedYear: 1997 },
  { ticker: 'YJMZ', name: '悦己美妆', ind: 'retail', stage: '成长期', round: '已上市', listed: true, marketCapE8: 152, price: 36.5, chg1Y: 62.4, pe: 28.5, pb: 4.2, psTtm: 5.2, roe: 14.5, grossMargin: 63.2, netMargin: 9.8, debtRatio: 30, revenueGrowth: 28, profitGrowth: 33, dividendYield: 0.8, moatType: '品牌（无形资产）', moatScore: 7.2, moatDesc: '大单品策略成功塑造国货高端心智，研发费用率提升至 2.8%，复购率行业领先。', revenueE8: 29.2, profitE8: 2.9, desc: '国货美妆龙头，电商与抖音渠道占比 65%，从流量驱动转向品牌驱动。', tags: ['国货美妆', '电商转型'], foundedYear: 2010 },
  // —— 煤炭与传统能源 ——
  { ticker: 'KLNY', name: '昆仑能源', ind: 'coal', stage: '衰退期', round: '已上市', listed: true, marketCapE8: 720, price: 14.2, chg1Y: 22.6, pe: 6.8, pb: 1.05, psTtm: 1.6, roe: 13.5, grossMargin: 28.4, netMargin: 12.5, debtRatio: 48, revenueGrowth: -5.8, profitGrowth: -2.4, dividendYield: 7.2, moatType: '资源禀赋 + 成本优势', moatScore: 6.5, moatDesc: '优质动力煤矿井吨煤成本行业最低 20% 分位，长协比例 80% 锁定盈利下限。', revenueE8: 450, profitE8: 56.2, desc: '动力煤核心标的，高长协 + 高分红（承诺分红率 60%+），深度价值与红利策略首选。', tags: ['高股息', '煤炭龙头'], foundedYear: 2001 },
  { ticker: 'LDNY', name: '岭南矿业', ind: 'coal', stage: '衰退期', round: '已上市', listed: true, marketCapE8: 158, price: 6.8, chg1Y: 9.5, pe: 8.9, pb: 0.9, psTtm: 1.1, roe: 8.2, grossMargin: 22.1, netMargin: 6.8, debtRatio: 55, revenueGrowth: -9.5, profitGrowth: -12, dividendYield: 5.8, moatType: '资源禀赋', moatScore: 5.8, moatDesc: '焦煤矿稀缺资源，但矿井老化导致成本抬升，吨煤毛利低于龙头。', revenueE8: 132, profitE8: 9.0, desc: '区域焦煤供应商，受益于焦煤供给收缩，但成长性有限，以分红回报为主。', tags: ['焦煤', '二线红利'], foundedYear: 1995 },
]

/* ---------------- 信号计算引擎 ---------------- */
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))
const round1 = (v: number) => Math.round(v * 10) / 10

function labelOf(score: number): string {
  if (score >= 72) return '强烈看多'
  if (score >= 58) return '看多'
  if (score >= 42) return '中性'
  if (score >= 28) return '看空'
  return '强烈看空'
}

// 价值投资信号：估值 vs 行业 + 股息 + 成长（PEG 思想）
function valueSignal(c: Co, indAvgPe: number): Signal {
  if (c.pe === null) {
    const s = clamp(42 + c.revenueGrowth * 0.25 + (c.moatScore >= 8 ? 8 : 0))
    return { label: labelOf(s), score: round1(s), reason: `尚未盈利，PE 不适用；以 PS ${c.psTtm ?? '—'} 倍衡量，营收增速 ${c.revenueGrowth}%。适合以管线/赛道期权价值视角评估，需容忍高波动。` }
  }
  const peRatio = c.pe / indAvgPe
  let s = 50
  if (peRatio < 0.5) s += 22; else if (peRatio < 0.75) s += 14; else if (peRatio < 0.95) s += 6; else if (peRatio > 1.4) s -= 18; else if (peRatio > 1.15) s -= 9
  if (c.pb < 1) s += 10; else if (c.pb < 2) s += 5; else if (c.pb > 6) s -= 8
  if ((c.dividendYield ?? 0) >= 5) s += 12; else if ((c.dividendYield ?? 0) >= 3) s += 7; else if ((c.dividendYield ?? 0) >= 1.5) s += 3
  const peg = c.profitGrowth > 0 ? c.pe / c.profitGrowth : 99
  if (peg < 0.8) s += 10; else if (peg < 1.2) s += 5; else if (peg > 2.5) s -= 10
  s = clamp(s)
  const parts = [`PE ${c.pe}x（行业均值 ${indAvgPe}x）`, `PB ${c.pb}x`]
  if (c.dividendYield) parts.push(`股息率 ${c.dividendYield}%`)
  if (c.profitGrowth > 0) parts.push(`PEG ≈ ${peg.toFixed(2)}`)
  const verdict = s >= 72 ? '估值显著低于内在价值，安全边际充足' : s >= 58 ? '估值合理偏低，具备一定安全边际' : s >= 42 ? '估值与价值基本匹配' : s >= 28 ? '估值偏高，安全边际不足' : '价格已透支价值，等待更好击球区'
  return { label: labelOf(s), score: round1(s), reason: `${parts.join('，')}。${verdict}。` }
}

// 基本面信号：成长 / 盈利质量 / 财务安全
function fundamentalSignal(c: Co): Signal {
  let s = 50
  const g = c.revenueGrowth * 0.6 + c.profitGrowth * 0.4
  if (g > 40) s += 18; else if (g > 20) s += 12; else if (g > 8) s += 5; else if (g > 0) s += 1; else if (g > -10) s -= 12; else if (g > -25) s -= 20; else s -= 28
  if (c.roe > 20) s += 16; else if (c.roe > 14) s += 10; else if (c.roe > 9) s += 4; else if (c.roe < 3) s -= 14; else if (c.roe < 0) s -= 22
  if (c.netMargin > 25) s += 8; else if (c.netMargin > 10) s += 4; else if (c.netMargin < 3 && c.netMargin > 0) s -= 6; else if (c.netMargin <= 0) s -= 10
  if (c.debtRatio > 75) s -= 12; else if (c.debtRatio > 65) s -= 6; else if (c.debtRatio < 35) s += 5
  s = clamp(s)
  const health = c.debtRatio > 70 ? '高杠杆需警惕流动性风险' : c.debtRatio < 35 ? '财务结构稳健' : '杠杆水平适中'
  const trend = g > 15 ? '收入利润双增' : g > 0 ? '温和增长' : '基本面处于下行通道'
  return { label: labelOf(s), score: round1(s), reason: `营收增速 ${c.revenueGrowth}%、净利增速 ${c.profitGrowth}%，ROE ${c.roe}%，净利率 ${c.netMargin}%，资产负债率 ${c.debtRatio}%。${trend}，${health}。` }
}

// 量化信号：动量 / 价值 / 质量 / 成长四因子合成
function quantFactorsOf(c: Co) {
  const momentum = clamp(50 + c.chg1Y * 0.8)
  const value = clamp(c.pe === null ? 35 : 100 - (c.pe / 80) * 60 + ((c.dividendYield ?? 0) * 3))
  const quality = clamp(c.roe * 3 + c.netMargin * 0.8 + (c.moatScore * 2))
  const growth = clamp(50 + c.revenueGrowth * 0.9 + c.profitGrowth * 0.35)
  return { momentum: round1(momentum), value: round1(value), quality: round1(quality), growth: round1(growth) }
}
function quantSignal(f: { momentum: number; value: number; quality: number; growth: number }): Signal {
  const s = clamp(f.momentum * 0.25 + f.value * 0.3 + f.quality * 0.25 + f.growth * 0.2)
  const top = (Object.entries(f) as [string, number][]).sort((a, b) => b[1] - a[1])
  const names: Record<string, string> = { momentum: '动量', value: '价值', quality: '质量', growth: '成长' }
  return { label: labelOf(s), score: round1(s), reason: `四因子合成得分 ${round1(s)}：${top.map(([k, v]) => `${names[k]} ${round1(v)}`).join(' / ')}。因子${s >= 58 ? '多头排列' : s >= 42 ? '互有强弱' : '整体偏空'}。` }
}

// 道氏理论信号：趋势 / 量价 / 均线
function priceStateOf(c: Co & { overallHint: number }) {
  const s = c.overallHint
  const price = c.price > 0 ? c.price : Math.max(2, Math.round(c.marketCapE8 * 0.9) / 100)
  if (s >= 62) return { trend: '上升趋势（次级回撤健康）', phase: '主升浪', volume: '量价齐升', support: round1(price * 0.86), resistance: round1(price * 1.12), maSignal: '价格站上 20/60/200 日均线，多头排列' }
  if (s >= 48) return { trend: '箱体震荡', phase: '趋势酝酿期', volume: '地量缩量', support: round1(price * 0.92), resistance: round1(price * 1.1), maSignal: '20 日均线走平，等待方向选择' }
  return { trend: '下降趋势（反弹受阻）', phase: c.profitGrowth < -30 ? '主跌浪后段' : '下降通道', volume: '反弹缩量', support: round1(price * 0.82), resistance: round1(price * 1.05), maSignal: '价格位于 200 日均线下方，均线空头排列' }
}
function dowSignal(ps: ReturnType<typeof priceStateOf>): Signal {
  let s = 50
  if (ps.trend.includes('上升')) s += 26; else if (ps.trend.includes('下降')) s -= 24
  if (ps.volume.includes('齐升')) s += 10; else if (ps.volume.includes('地量')) s += 4; else if (ps.volume.includes('缩量')) s -= 6
  if (ps.maSignal.includes('多头')) s += 8; else if (ps.maSignal.includes('空头')) s -= 8
  s = clamp(s)
  return { label: labelOf(s), score: round1(s), reason: `${ps.trend}，${ps.volume}，${ps.maSignal}。关键支撑 ${ps.support} 元 / 压力 ${ps.resistance} 元。趋势确认依据道氏"高低点结构 + 量价验证"原则。` }
}

// 计算每家公司的完整信号（先给 hint 用于 priceState 的一致性）
function computeSignals(c: Co, indAvgPe: number) {
  const f = quantFactorsOf(c)
  const hintBase = 0.3 * valueSignal(c, indAvgPe).score + 0.3 * fundamentalSignal(c).score + 0.25 * (f.momentum * 0.25 + f.value * 0.3 + f.quality * 0.25 + f.growth * 0.2)
  const ps = priceStateOf({ ...c, overallHint: hintBase })
  const dow = dowSignal(ps)
  const value = valueSignal(c, indAvgPe)
  const fundamental = fundamentalSignal(c)
  const quant = quantSignal(f)
  const overallScore = round1(0.15 * dow.score + 0.3 * value.score + 0.3 * fundamental.score + 0.25 * quant.score)
  const scores = [dow.score, value.score, fundamental.score, quant.score]
  const dispersion = Math.max(...scores) - Math.min(...scores)
  const confidence = Math.round(clamp(60 + Math.abs(overallScore - 50) * 0.5 + (dispersion < 25 ? 12 : dispersion < 40 ? 4 : -4), 50, 92))
  return { signals: { dow, value, fundamental, quant }, priceState: ps, quantFactors: f, overallScore, overall: labelOf(overallScore), confidence }
}

/* ---------------- 财务历史生成（近 5 年，确定性伪随机） ---------------- */
function finHistoryOf(c: Co): { year: number; revenueE8: number; profitE8: number }[] {
  const wobble = [0.55, 0.72, 0.86, 0.95, 1.0] // 增速逐年后置（保持确定性）
  const stageWobble: Record<string, number[]> = {
    '初创期': [0.25, 0.45, 0.7, 0.9, 1.0], '成长期': [0.55, 0.7, 0.82, 0.92, 1.0],
    '成熟期': [0.9, 0.95, 0.97, 1.02, 1.0], '衰退期': [1.18, 1.12, 1.06, 1.03, 1.0],
  }
  const w = stageWobble[c.stage] ?? wobble
  const years = [2021, 2022, 2023, 2024, 2025]
  // 从 2025 反推
  const rev: number[] = [0, 0, 0, 0, c.revenueE8]
  const prof: number[] = [0, 0, 0, 0, c.profitE8]
  for (let i = 4; i >= 1; i--) {
    const g = c.revenueGrowth * w[i]
    rev[i - 1] = rev[i] / (1 + g / 100)
    const pg = c.profitGrowth * w[i]
    prof[i - 1] = prof[i] / (1 + pg / 100)
  }
  return years.map((year, i) => ({
    year,
    revenueE8: Math.round(rev[i] * 10) / 10,
    profitE8: Math.round(prof[i] * 10) / 10,
  }))
}

/* ---------------- 主流程 ---------------- */
async function main() {
  console.log('清空旧数据...')
  await db.company.deleteMany()
  await db.industry.deleteMany()
  await db.macroSnapshot.deleteMany()

  console.log('写入宏观快照...')
  await db.macroSnapshot.createMany({ data: macroRows })

  console.log('写入行业...')
  const indMap = new Map<string, string>()
  for (const it of industries) {
    const row = await db.industry.create({
      data: {
        slug: it.slug, name: it.name, lifecycle: it.lifecycle, cyclicality: it.cyclicality,
        summary: it.summary, pest: JSON.stringify(it.pest), porter: JSON.stringify(it.porter),
        chain: JSON.stringify(it.chain), leaders: JSON.stringify(it.leaders),
        avgPe: it.avgPe, growthYoY: it.growthYoY, prosperity: it.prosperity,
      },
    })
    indMap.set(it.slug, row.id)
  }

  console.log('写入企业并计算四维信号...')
  for (const c of companies) {
    const industryId = indMap.get(c.ind)
    if (!industryId) throw new Error(`行业不存在: ${c.ind}`)
    const ind = industries.find((i) => i.slug === c.ind)!
    const sig = computeSignals(c, ind.avgPe)
    await db.company.create({
      data: {
        ticker: c.ticker, name: c.name, industryId, stage: c.stage, round: c.round, listed: c.listed,
        marketCapE8: c.marketCapE8, price: c.price, chg1Y: c.chg1Y,
        pe: c.pe, pb: c.pb, psTtm: c.psTtm, roe: c.roe,
        grossMargin: c.grossMargin, netMargin: c.netMargin, debtRatio: c.debtRatio,
        revenueGrowth: c.revenueGrowth, profitGrowth: c.profitGrowth, dividendYield: c.dividendYield,
        moatType: c.moatType, moatScore: c.moatScore, moatDesc: c.moatDesc,
        finHistory: JSON.stringify(finHistoryOf(c)),
        priceState: JSON.stringify(sig.priceState),
        quantFactors: JSON.stringify(sig.quantFactors),
        signals: JSON.stringify(sig.signals),
        overall: sig.overall, overallScore: sig.overallScore, confidence: sig.confidence,
        desc: c.desc, tags: JSON.stringify(c.tags), foundedYear: c.foundedYear,
      },
    })
    console.log(`  ✓ ${c.name}（${c.ticker}）→ ${sig.overall} ${sig.overallScore} 置信度 ${sig.confidence}%`)
  }

  const counts = {
    macro: await db.macroSnapshot.count(),
    industries: await db.industry.count(),
    companies: await db.company.count(),
  }
  console.log('种子数据完成:', counts)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
