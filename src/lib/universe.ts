// 真实公司池：覆盖 美国 / 中国A股 / 香港 / 日本 / 韩国 / 印度 / 欧洲 七大市场
// 全部为真实上市公司的真实代码（Yahoo Finance 代码格式）
export type MarketKey = 'US' | 'CN' | 'HK' | 'JP' | 'KR' | 'IN' | 'EU'
export type SectorKey =
  | 'tech' | 'consumer' | 'finance' | 'health' | 'energy'
  | 'industrial' | 'materials' | 'utility' | 'comm' | 'realestate'
export type StageKey = 'startup' | 'growth' | 'mature' | 'turnaround'

export type UItem = {
  s: string
  n: { zh: string; en: string; ja?: string }
  mkt: MarketKey
  ctry: string
  sec: SectorKey
  stage: StageKey
  tags: string[]
  cur?: string
}

export const MARKETS: { key: MarketKey; flag: string; label: { zh: string; en: string; ja: string } }[] = [
  { key: 'US', flag: '🇺🇸', label: { zh: '美国', en: 'United States', ja: '米国' } },
  { key: 'CN', flag: '🇨🇳', label: { zh: '中国A股', en: 'China A-shares', ja: '中国A株' } },
  { key: 'HK', flag: '🇭🇰', label: { zh: '香港', en: 'Hong Kong', ja: '香港' } },
  { key: 'JP', flag: '🇯🇵', label: { zh: '日本', en: 'Japan', ja: '日本' } },
  { key: 'KR', flag: '🇰🇷', label: { zh: '韩国', en: 'South Korea', ja: '韓国' } },
  { key: 'IN', flag: '🇮🇳', label: { zh: '印度', en: 'India', ja: 'インド' } },
  { key: 'EU', flag: '🇪🇺', label: { zh: '欧洲', en: 'Europe', ja: '欧州' } },
]

export const SECTORS: { key: SectorKey; label: { zh: string; en: string; ja: string } }[] = [
  { key: 'tech', label: { zh: '科技', en: 'Technology', ja: 'テクノロジー' } },
  { key: 'consumer', label: { zh: '消费', en: 'Consumer', ja: '消費財' } },
  { key: 'finance', label: { zh: '金融', en: 'Financials', ja: '金融' } },
  { key: 'health', label: { zh: '医药健康', en: 'Healthcare', ja: 'ヘルスケア' } },
  { key: 'energy', label: { zh: '能源', en: 'Energy', ja: 'エネルギー' } },
  { key: 'industrial', label: { zh: '工业', en: 'Industrials', ja: '資本財・工業' } },
  { key: 'materials', label: { zh: '原材料', en: 'Materials', ja: '素材' } },
  { key: 'utility', label: { zh: '公用事业', en: 'Utilities', ja: '公益事業' } },
  { key: 'comm', label: { zh: '传媒通信', en: 'Communication', ja: '通信・メディア' } },
  { key: 'realestate', label: { zh: '房地产', en: 'Real Estate', ja: '不動産' } },
]

export const STAGES: { key: StageKey; label: { zh: string; en: string; ja: string } }[] = [
  { key: 'startup', label: { zh: '初创期', en: 'Startup', ja: 'スタートアップ期' } },
  { key: 'growth', label: { zh: '成长期', en: 'Growth', ja: '成長期' } },
  { key: 'mature', label: { zh: '成熟期', en: 'Mature', ja: '成熟期' } },
  { key: 'turnaround', label: { zh: '转型/衰退期', en: 'Turnaround / Decline', ja: '転換・衰退期' } },
]

export const MARKET_CURRENCY: Record<MarketKey, string> = {
  US: 'USD', CN: 'CNY', HK: 'HKD', JP: 'JPY', KR: 'KRW', IN: 'INR', EU: 'EUR',
}

export const UNIVERSE: UItem[] = [
  // ============ 美国 🇺🇸 ============
  { s: 'AAPL', n: { zh: '苹果', en: 'Apple', ja: 'アップル' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['消费电子', 'iPhone', '品牌', '生态', '高毛利', 'AI', 'hardware'] },
  { s: 'MSFT', n: { zh: '微软', en: 'Microsoft', ja: 'マイクロソフト' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['云计算', 'Azure', 'AI', '软件', 'office', 'cloud'] },
  { s: 'NVDA', n: { zh: '英伟达', en: 'NVIDIA', ja: 'エヌビディア' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['AI', '芯片', 'GPU', '算力', '半导体', 'semiconductor'] },
  { s: 'GOOGL', n: { zh: '谷歌', en: 'Alphabet (Google)', ja: 'アルファベット' }, mkt: 'US', ctry: 'US', sec: 'comm', stage: 'mature', tags: ['搜索', '广告', 'AI', '云计算', 'Android', 'search'] },
  { s: 'AMZN', n: { zh: '亚马逊', en: 'Amazon', ja: 'アマゾン' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['电商', '云计算', 'AWS', '物流', '订阅', 'ecommerce'] },
  { s: 'META', n: { zh: 'Meta', en: 'Meta Platforms', ja: 'メタ' }, mkt: 'US', ctry: 'US', sec: 'comm', stage: 'mature', tags: ['社交', '广告', 'AI', '元宇宙', 'social'] },
  { s: 'TSLA', n: { zh: '特斯拉', en: 'Tesla', ja: 'テスラ' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'growth', tags: ['新能源车', '自动驾驶', '电动车', '储能', 'EV'] },
  { s: 'AVGO', n: { zh: '博通', en: 'Broadcom', ja: 'ブロードコム' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['半导体', 'AI', '芯片', '网络设备'] },
  { s: 'ORCL', n: { zh: '甲骨文', en: 'Oracle', ja: 'オラクル' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['数据库', '云计算', '企业软件', 'AI'] },
  { s: 'CRM', n: { zh: '赛富时', en: 'Salesforce', ja: 'セールスフォース' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['SaaS', 'CRM', '企业软件', 'AI'] },
  { s: 'ADBE', n: { zh: 'Adobe', en: 'Adobe', ja: 'アドビ' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['创意软件', 'SaaS', '订阅', 'AI'] },
  { s: 'AMD', n: { zh: '超威半导体', en: 'AMD', ja: 'AMD' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['芯片', 'CPU', 'GPU', 'AI', '半导体'] },
  { s: 'INTC', n: { zh: '英特尔', en: 'Intel', ja: 'インテル' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'turnaround', tags: ['芯片', '代工', '半导体', '转型'] },
  { s: 'QCOM', n: { zh: '高通', en: 'Qualcomm', ja: 'クアルコム' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['芯片', '5G', '手机', '半导体'] },
  { s: 'TXN', n: { zh: '德州仪器', en: 'Texas Instruments', ja: 'テキサス・インスツルメンツ' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['模拟芯片', '高股息', '工业芯片'] },
  { s: 'MU', n: { zh: '美光科技', en: 'Micron', ja: 'マイクロン' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['存储', 'HBM', '内存', 'AI', '周期'] },
  { s: 'AMAT', n: { zh: '应用材料', en: 'Applied Materials', ja: 'アプリド・マテリアルズ' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['半导体设备', '芯片', '资本开支'] },
  { s: 'LRCX', n: { zh: '泛林集团', en: 'Lam Research', ja: 'ラム・リサーチ' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['半导体设备', '刻蚀', '周期'] },
  { s: 'KLAC', n: { zh: '科磊', en: 'KLA', ja: 'KLA' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['半导体设备', '检测', '高毛利'] },
  { s: 'ASML.AS', n: { zh: '阿斯麦', en: 'ASML', ja: 'ASML' }, mkt: 'EU', ctry: 'NL', sec: 'tech', stage: 'growth', tags: ['光刻机', '半导体设备', '垄断', 'EUV', '荷兰'], cur: 'EUR' },
  { s: 'PLTR', n: { zh: 'Palantir', en: 'Palantir', ja: 'パランティア' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['AI', '大数据', '政府订单', '软件'] },
  { s: 'SNOW', n: { zh: 'Snowflake', en: 'Snowflake', ja: 'スノーフレーク' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'startup', tags: ['云数据', 'SaaS', '高增长', '尚未稳定盈利'] },
  { s: 'CRWD', n: { zh: 'CrowdStrike', en: 'CrowdStrike', ja: 'クラウドストライク' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['网络安全', 'SaaS', '订阅'] },
  { s: 'DDOG', n: { zh: 'Datadog', en: 'Datadog', ja: 'データドッグ' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'growth', tags: ['云监控', '可观测性', 'SaaS'] },
  { s: 'IBM', n: { zh: 'IBM', en: 'IBM', ja: 'IBM' }, mkt: 'US', ctry: 'US', sec: 'tech', stage: 'mature', tags: ['企业服务', 'AI', '高股息', '混合云'] },
  { s: 'UBER', n: { zh: '优步', en: 'Uber', ja: 'ウーバー' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'growth', tags: ['出行', '平台经济', '共享', '外卖'] },
  { s: 'NFLX', n: { zh: '奈飞', en: 'Netflix', ja: 'ネットフリックス' }, mkt: 'US', ctry: 'US', sec: 'comm', stage: 'mature', tags: ['流媒体', '订阅', '内容'] },
  { s: 'DIS', n: { zh: '迪士尼', en: 'Disney', ja: 'ディズニー' }, mkt: 'US', ctry: 'US', sec: 'comm', stage: 'mature', tags: ['IP', '主题公园', '流媒体', '品牌'] },
  { s: 'JPM', n: { zh: '摩根大通', en: 'JPMorgan Chase', ja: 'JPモルガン・チェース' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['银行', '息差', '华尔街'] },
  { s: 'BAC', n: { zh: '美国银行', en: 'Bank of America', ja: 'バンク・オブ・アメリカ' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['银行', '零售银行'] },
  { s: 'WFC', n: { zh: '富国银行', en: 'Wells Fargo', ja: 'ウェルズ・ファーゴ' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['银行', '零售银行'] },
  { s: 'GS', n: { zh: '高盛', en: 'Goldman Sachs', ja: 'ゴールドマン・サックス' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['投行', '资管', '华尔街'] },
  { s: 'MS', n: { zh: '摩根士丹利', en: 'Morgan Stanley', ja: 'モルガン・スタンレー' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['投行', '财富管理'] },
  { s: 'BLK', n: { zh: '贝莱德', en: 'BlackRock', ja: 'ブラックロック' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['资管', 'ETF', '指数基金'] },
  { s: 'V', n: { zh: 'Visa', en: 'Visa', ja: 'Visa' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['支付', '网络效应', '高毛利'] },
  { s: 'MA', n: { zh: '万事达', en: 'Mastercard', ja: 'マスターカード' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['支付', '网络效应', '高毛利'] },
  { s: 'BRK-B', n: { zh: '伯克希尔', en: 'Berkshire Hathaway', ja: 'バークシャー・ハサウェイ' }, mkt: 'US', ctry: 'US', sec: 'finance', stage: 'mature', tags: ['价值投资', '巴菲特', '保险', '多元化'] },
  { s: 'WMT', n: { zh: '沃尔玛', en: 'Walmart', ja: 'ウォルマート' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['零售', '折扣店', '防御性', '高股息'] },
  { s: 'COST', n: { zh: '开市客', en: 'Costco', ja: 'コストコ' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['会员制', '仓储超市', '复购'] },
  { s: 'PG', n: { zh: '宝洁', en: 'Procter & Gamble', ja: 'P&G' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['日用品', '品牌', '高股息', '防御性'] },
  { s: 'KO', n: { zh: '可口可乐', en: 'Coca-Cola', ja: 'コカ・コーラ' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['饮料', '品牌', '高股息', '护城河'] },
  { s: 'PEP', n: { zh: '百事', en: 'PepsiCo', ja: 'ペプシコ' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['饮料', '零食', '高股息'] },
  { s: 'MCD', n: { zh: '麦当劳', en: "McDonald's", ja: 'マクドナルド' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['餐饮连锁', '特许经营', '高股息'] },
  { s: 'SBUX', n: { zh: '星巴克', en: 'Starbucks', ja: 'スターバックス' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['咖啡', '连锁', '品牌', '中国业务'] },
  { s: 'NKE', n: { zh: '耐克', en: 'Nike', ja: 'ナイキ' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'turnaround', tags: ['运动服饰', '品牌', '转型'] },
  { s: 'HD', n: { zh: '家得宝', en: 'Home Depot', ja: 'ホーム・デポ' }, mkt: 'US', ctry: 'US', sec: 'consumer', stage: 'mature', tags: ['建材零售', '地产链'] },
  { s: 'UNH', n: { zh: '联合健康', en: 'UnitedHealth', ja: 'ユナイテッドヘルス' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'mature', tags: ['医保', '健康管理'] },
  { s: 'JNJ', n: { zh: '强生', en: 'Johnson & Johnson', ja: 'ジョンソン・エンド・ジョンソン' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'mature', tags: ['制药', '医疗器械', '高股息'] },
  { s: 'LLY', n: { zh: '礼来', en: 'Eli Lilly', ja: 'イーライリリー' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'growth', tags: ['减肥药', 'GLP-1', '创新药'] },
  { s: 'NVO', n: { zh: '诺和诺德', en: 'Novo Nordisk', ja: 'ノボノルディスク' }, mkt: 'US', ctry: 'DK', sec: 'health', stage: 'growth', tags: ['减肥药', 'GLP-1', '胰岛素', '丹麦'], cur: 'USD' },
  { s: 'PFE', n: { zh: '辉瑞', en: 'Pfizer', ja: 'ファイザー' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'mature', tags: ['制药', '高股息', '疫苗'] },
  { s: 'MRK', n: { zh: '默沙东', en: 'Merck', ja: 'メルク' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'mature', tags: ['制药', 'K药', '肿瘤'] },
  { s: 'ABBV', n: { zh: '艾伯维', en: 'AbbVie', ja: 'アッヴィ' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'mature', tags: ['制药', '修美乐', '高股息'] },
  { s: 'TMO', n: { zh: '赛默飞', en: 'Thermo Fisher', ja: 'サーモフィッシャー' }, mkt: 'US', ctry: 'US', sec: 'health', stage: 'mature', tags: ['生命科学', '实验室服务'] },
  { s: 'XOM', n: { zh: '埃克森美孚', en: 'Exxon Mobil', ja: 'エクソンモービル' }, mkt: 'US', ctry: 'US', sec: 'energy', stage: 'mature', tags: ['石油', '高股息', '周期'] },
  { s: 'CVX', n: { zh: '雪佛龙', en: 'Chevron', ja: 'シェブロン' }, mkt: 'US', ctry: 'US', sec: 'energy', stage: 'mature', tags: ['石油', '高股息', '周期'] },
  { s: 'COP', n: { zh: '康菲石油', en: 'ConocoPhillips', ja: 'コノコフィリップス' }, mkt: 'US', ctry: 'US', sec: 'energy', stage: 'mature', tags: ['油气', '周期'] },
  { s: 'CAT', n: { zh: '卡特彼勒', en: 'Caterpillar', ja: 'キャタピラー' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['工程机械', '基建', '周期'] },
  { s: 'BA', n: { zh: '波音', en: 'Boeing', ja: 'ボーイング' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'turnaround', tags: ['飞机', '军工', '困境反转'] },
  { s: 'GE', n: { zh: 'GE航空航天', en: 'GE Aerospace', ja: 'GEアエロスペース' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['航空发动机', '售后服务'] },
  { s: 'HON', n: { zh: '霍尼韦尔', en: 'Honeywell', ja: 'ハネウェル' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['多元化工业', '自动化'] },
  { s: 'LMT', n: { zh: '洛克希德·马丁', en: 'Lockheed Martin', ja: 'ロッキード・マーティン' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['军工', '国防', '高股息'] },
  { s: 'RTX', n: { zh: '雷神技术', en: 'RTX', ja: 'RTX' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['军工', '航空发动机'] },
  { s: 'UNP', n: { zh: '联合太平洋', en: 'Union Pacific', ja: 'ユニオン・パシフィック' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['铁路', '垄断', '高股息'] },
  { s: 'DE', n: { zh: '迪尔', en: 'Deere', ja: 'ディア・アンド・カンパニー' }, mkt: 'US', ctry: 'US', sec: 'industrial', stage: 'mature', tags: ['农机', '精准农业'] },

  // ============ 中国A股 🇨🇳 ============
  { s: '600519.SS', n: { zh: '贵州茅台', en: 'Kweichow Moutai', ja: '貴州茅台酒' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['白酒', '品牌', '高毛利', '消费', '提价权'] },
  { s: '000858.SZ', n: { zh: '五粮液', en: 'Wuliangye', ja: '五糧液' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['白酒', '品牌', '消费'] },
  { s: '601318.SS', n: { zh: '中国平安', en: 'Ping An Insurance', ja: '中国平安保険' }, mkt: 'CN', ctry: 'CN', sec: 'finance', stage: 'mature', tags: ['保险', '金融', '高股息'] },
  { s: '600036.SS', n: { zh: '招商银行', en: 'China Merchants Bank', ja: '招商銀行' }, mkt: 'CN', ctry: 'CN', sec: 'finance', stage: 'mature', tags: ['银行', '零售银行', '高股息'] },
  { s: '601398.SS', n: { zh: '工商银行', en: 'ICBC', ja: '中国工商銀行' }, mkt: 'CN', ctry: 'CN', sec: 'finance', stage: 'mature', tags: ['银行', '国有大行', '高股息'] },
  { s: '300059.SZ', n: { zh: '东方财富', en: 'East Money', ja: '東方財富' }, mkt: 'CN', ctry: 'CN', sec: 'finance', stage: 'growth', tags: ['互联网金融', '券商', '基金销售', '流量平台'] },
  { s: '000333.SZ', n: { zh: '美的集团', en: 'Midea Group', ja: '美的グループ' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['家电', '出口', '机器人', '高股息'] },
  { s: '000651.SZ', n: { zh: '格力电器', en: 'Gree Electric', ja: '格力電器' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['空调', '家电', '高股息'] },
  { s: '600887.SS', n: { zh: '伊利股份', en: 'Yili', ja: '伊利集団' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['乳制品', '消费', '高股息'] },
  { s: '603288.SS', n: { zh: '海天味业', en: 'Foshan Haitian', ja: '海天味業' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['调味品', '酱油', '消费'] },
  { s: '601888.SS', n: { zh: '中国中免', en: 'CTG Duty Free', ja: '中国旅遊集団免税' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['免税', '消费', '海南', '旅游零售'] },
  { s: '600276.SS', n: { zh: '恒瑞医药', en: 'Hengrui Pharma', ja: '恒瑞医薬' }, mkt: 'CN', ctry: 'CN', sec: 'health', stage: 'growth', tags: ['创新药', '医药', '研发'] },
  { s: '300760.SS', n: { zh: '迈瑞医疗', en: 'Mindray', ja: 'マインドレイ' }, mkt: 'CN', ctry: 'CN', sec: 'health', stage: 'growth', tags: ['医疗器械', '出口', '体外诊断'] },
  { s: '300750.SZ', n: { zh: '宁德时代', en: 'CATL', ja: 'CATL寧徳時代' }, mkt: 'CN', ctry: 'CN', sec: 'industrial', stage: 'growth', tags: ['动力电池', '储能', '新能源', '全球龙头'] },
  { s: '002594.SZ', n: { zh: '比亚迪', en: 'BYD', ja: 'BYD比亜迪' }, mkt: 'CN', ctry: 'CN', sec: 'consumer', stage: 'growth', tags: ['新能源车', '电动车', '电池', '出海'] },
  { s: '601012.SS', n: { zh: '隆基绿能', en: 'LONGi', ja: 'LONGi隆基' }, mkt: 'CN', ctry: 'CN', sec: 'industrial', stage: 'turnaround', tags: ['光伏', '太阳能', '产能过剩', '困境反转'] },
  { s: '300274.SZ', n: { zh: '阳光电源', en: 'Sungrow', ja: 'サングロウ' }, mkt: 'CN', ctry: 'CN', sec: 'industrial', stage: 'growth', tags: ['逆变器', '储能', '光伏'] },
  { s: '688981.SS', n: { zh: '中芯国际', en: 'SMIC', ja: 'SMIC中芯国際' }, mkt: 'CN', ctry: 'CN', sec: 'tech', stage: 'growth', tags: ['晶圆代工', '半导体', '国产替代'] },
  { s: '002371.SZ', n: { zh: '北方华创', en: 'Naura', ja: 'ノーア' }, mkt: 'CN', ctry: 'CN', sec: 'tech', stage: 'growth', tags: ['半导体设备', '国产替代', '刻蚀'] },
  { s: '603501.SS', n: { zh: '韦尔股份', en: 'Will Semiconductor', ja: 'ウェル半導体' }, mkt: 'CN', ctry: 'CN', sec: 'tech', stage: 'growth', tags: ['CIS', '芯片', '图像传感器'] },
  { s: '688111.SS', n: { zh: '金山办公', en: 'Kingsoft Office', ja: '金山オフィス' }, mkt: 'CN', ctry: 'CN', sec: 'tech', stage: 'growth', tags: ['办公软件', 'WPS', '订阅', 'AI'] },
  { s: '300124.SZ', n: { zh: '汇川技术', en: 'Inovance', ja: 'イノバンス' }, mkt: 'CN', ctry: 'CN', sec: 'industrial', stage: 'growth', tags: ['工控', '伺服', '新能源车电控', '机器人'] },
  { s: '601899.SS', n: { zh: '紫金矿业', en: 'Zijin Mining', ja: '紫金鉱業' }, mkt: 'CN', ctry: 'CN', sec: 'materials', stage: 'growth', tags: ['黄金', '铜', '矿业', '金属涨价'] },
  { s: '601088.SS', n: { zh: '中国神华', en: 'China Shenhua', ja: '中国神華' }, mkt: 'CN', ctry: 'CN', sec: 'energy', stage: 'mature', tags: ['煤炭', '高股息', '一体化'] },
  { s: '600900.SS', n: { zh: '长江电力', en: 'China Yangtze Power', ja: '長江電力' }, mkt: 'CN', ctry: 'CN', sec: 'utility', stage: 'mature', tags: ['水电', '垄断', '高股息', '公用事业'] },
  { s: '601857.SS', n: { zh: '中国石油', en: 'PetroChina', ja: '中国石油' }, mkt: 'CN', ctry: 'CN', sec: 'energy', stage: 'mature', tags: ['石油', '天然气', '高股息'] },
  { s: '000002.SZ', n: { zh: '万科A', en: 'Vanke A', ja: '万科A' }, mkt: 'CN', ctry: 'CN', sec: 'realestate', stage: 'turnaround', tags: ['房地产', '地产', '困境', '转型'] },

  // ============ 港股 🇭🇰 ============
  { s: '0700.HK', n: { zh: '腾讯控股', en: 'Tencent', ja: 'テンセント' }, mkt: 'HK', ctry: 'HK', sec: 'comm', stage: 'mature', tags: ['社交', '游戏', '微信', '广告', 'AI'] },
  { s: '9988.HK', n: { zh: '阿里巴巴-W', en: 'Alibaba', ja: 'アリババ' }, mkt: 'HK', ctry: 'HK', sec: 'consumer', stage: 'mature', tags: ['电商', '云计算', 'AI', '淘宝'] },
  { s: '3690.HK', n: { zh: '美团-W', en: 'Meituan', ja: '美団' }, mkt: 'HK', ctry: 'HK', sec: 'consumer', stage: 'growth', tags: ['外卖', '本地生活', '平台经济'] },
  { s: '9618.HK', n: { zh: '京东集团-SW', en: 'JD.com', ja: 'JDドットコム' }, mkt: 'HK', ctry: 'HK', sec: 'consumer', stage: 'mature', tags: ['电商', '物流', '自营'] },
  { s: '9999.HK', n: { zh: '网易-S', en: 'NetEase', ja: 'ネットイース' }, mkt: 'HK', ctry: 'HK', sec: 'comm', stage: 'mature', tags: ['游戏', '音乐', '教育'] },
  { s: '0941.HK', n: { zh: '中国移动', en: 'China Mobile', ja: '中国移動' }, mkt: 'HK', ctry: 'HK', sec: 'comm', stage: 'mature', tags: ['电信', '高股息', '算力'] },
  { s: '1299.HK', n: { zh: '友邦保险', en: 'AIA Group', ja: 'AIA友邦保険' }, mkt: 'HK', ctry: 'HK', sec: 'finance', stage: 'mature', tags: ['保险', '亚太', '高股息'] },
  { s: '0005.HK', n: { zh: '汇丰控股', en: 'HSBC', ja: 'HSBC' }, mkt: 'HK', ctry: 'GB', sec: 'finance', stage: 'mature', tags: ['银行', '高股息', '国际化'] },
  { s: '0939.HK', n: { zh: '建设银行', en: 'China Construction Bank', ja: '中国建設銀行' }, mkt: 'HK', ctry: 'CN', sec: 'finance', stage: 'mature', tags: ['银行', '高股息'] },
  { s: '1810.HK', n: { zh: '小米集团-W', en: 'Xiaomi', ja: 'シャオミ' }, mkt: 'HK', ctry: 'HK', sec: 'tech', stage: 'growth', tags: ['手机', 'IoT', '新能源车', '生态链'] },
  { s: '2020.HK', n: { zh: '安踏体育', en: 'ANTA Sports', ja: 'アンタ・スポーツ' }, mkt: 'HK', ctry: 'HK', sec: 'consumer', stage: 'growth', tags: ['运动服饰', '多品牌', ' FILA', '始祖鸟'] },
  { s: '1211.HK', n: { zh: '比亚迪股份', en: 'BYD (H)', ja: 'BYD(H株)' }, mkt: 'HK', ctry: 'CN', sec: 'consumer', stage: 'growth', tags: ['新能源车', '出海', '电池'] },
  { s: '2333.HK', n: { zh: '长城汽车', en: 'Great Wall Motor', ja: '長城汽車' }, mkt: 'HK', ctry: 'CN', sec: 'consumer', stage: 'turnaround', tags: ['汽车', 'SUV', '出口', '转型'] },
  { s: '2269.HK', n: { zh: '药明生物', en: 'WuXi Biologics', ja: 'ウーシーバイオ' }, mkt: 'HK', ctry: 'CN', sec: 'health', stage: 'growth', tags: ['CXO', '生物药', 'CDMO'] },
  { s: '0002.HK', n: { zh: '中电控股', en: 'CLP Holdings', ja: 'CLP Holdings' }, mkt: 'HK', ctry: 'HK', sec: 'utility', stage: 'mature', tags: ['电力', '公用事业', '高股息'] },
  { s: '0688.HK', n: { zh: '中国海外发展', en: 'China Overseas Land', ja: '中国海外発展' }, mkt: 'HK', ctry: 'CN', sec: 'realestate', stage: 'turnaround', tags: ['房地产', '央企', '地产'] },
  { s: '1928.HK', n: { zh: '金沙中国', en: 'Sands China', ja: 'サンズ・チャイナ' }, mkt: 'HK', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['澳门', '博彩', '度假村'] },

  // ============ 日本 🇯🇵 ============
  { s: '7203.T', n: { zh: '丰田汽车', en: 'Toyota', ja: 'トヨタ自動車' }, mkt: 'JP', ctry: 'JP', sec: 'consumer', stage: 'mature', tags: ['汽车', '混动', '全球化', '高股息'] },
  { s: '6758.T', n: { zh: '索尼集团', en: 'Sony Group', ja: 'ソニーグループ' }, mkt: 'JP', ctry: 'JP', sec: 'tech', stage: 'mature', tags: ['游戏', '影像传感器', '娱乐', '音乐'] },
  { s: '9984.T', n: { zh: '软银集团', en: 'SoftBank Group', ja: 'ソフトバンクグループ' }, mkt: 'JP', ctry: 'JP', sec: 'tech', stage: 'growth', tags: ['投资', 'AI', 'ARM', '愿景基金'] },
  { s: '6861.T', n: { zh: '基恩士', en: 'Keyence', ja: 'キーエンス' }, mkt: 'JP', ctry: 'JP', sec: 'tech', stage: 'mature', tags: ['传感器', '自动化', '高毛利', '工业检测'] },
  { s: '6501.T', n: { zh: '日立制作所', en: 'Hitachi', ja: '日立製作所' }, mkt: 'JP', ctry: 'JP', sec: 'industrial', stage: 'mature', tags: ['基建', 'IT服务', '电力设备', '全球化'] },
  { s: '6954.T', n: { zh: '发那科', en: 'FANUC', ja: 'ファナック' }, mkt: 'JP', ctry: 'JP', sec: 'industrial', stage: 'mature', tags: ['机器人', '数控机床', '自动化', '高现金'] },
  { s: '7267.T', n: { zh: '本田技研', en: 'Honda', ja: 'ホンダ' }, mkt: 'JP', ctry: 'JP', sec: 'consumer', stage: 'mature', tags: ['汽车', '摩托', '高股息'] },
  { s: '9432.T', n: { zh: 'NTT', en: 'Nippon Telegraph & Telephone', ja: 'NTT' }, mkt: 'JP', ctry: 'JP', sec: 'comm', stage: 'mature', tags: ['电信', '高股息', '数据中心'] },
  { s: '9433.T', n: { zh: 'KDDI', en: 'KDDI', ja: 'KDDI' }, mkt: 'JP', ctry: 'JP', sec: 'comm', stage: 'mature', tags: ['电信', '高股息'] },
  { s: '8306.T', n: { zh: '三菱UFJ', en: 'Mitsubishi UFJ Financial', ja: '三菱UFJフィナンシャル' }, mkt: 'JP', ctry: 'JP', sec: 'finance', stage: 'mature', tags: ['银行', '加息受益', '日股权重'] },
  { s: '8316.T', n: { zh: '三井住友金融', en: 'Sumitomo Mitsui Financial', ja: '三井住友フィナンシャル' }, mkt: 'JP', ctry: 'JP', sec: 'finance', stage: 'mature', tags: ['银行', '加息受益'] },
  { s: '7974.T', n: { zh: '任天堂', en: 'Nintendo', ja: '任天堂' }, mkt: 'JP', ctry: 'JP', sec: 'comm', stage: 'mature', tags: ['游戏', 'IP', 'Switch', '高现金'] },
  { s: '4502.T', n: { zh: '武田药品', en: 'Takeda', ja: '武田薬品工業' }, mkt: 'JP', ctry: 'JP', sec: 'health', stage: 'mature', tags: ['制药', '全球化', '高股息'] },
  { s: '9983.T', n: { zh: '迅销', en: 'Fast Retailing', ja: 'ファーストリテイリング' }, mkt: 'JP', ctry: 'JP', sec: 'consumer', stage: 'mature', tags: ['优衣库', '服装零售', '全球化'] },
  { s: '6981.T', n: { zh: '村田制作所', en: 'Murata Manufacturing', ja: '村田製作所' }, mkt: 'JP', ctry: 'JP', sec: 'tech', stage: 'mature', tags: ['电子元件', 'MLCC', '苹果链'] },
  { s: '8031.T', n: { zh: '三菱商事', en: 'Mitsubishi Corp', ja: '三菱商事' }, mkt: 'JP', ctry: 'JP', sec: 'industrial', stage: 'mature', tags: ['综合商社', '资源', '巴菲特持仓', '高股息'] },
  { s: '7201.T', n: { zh: '日产汽车', en: 'Nissan Motor', ja: '日産自動車' }, mkt: 'JP', ctry: 'JP', sec: 'consumer', stage: 'turnaround', tags: ['汽车', '重组', '困境'] },
  { s: '4568.T', n: { zh: '大冢制药', en: 'Otsuka Holdings', ja: '大塚ホールディングス' }, mkt: 'JP', ctry: 'JP', sec: 'health', stage: 'mature', tags: ['制药', '精神类药物', '营养品'] },
  { s: '4507.T', n: { zh: '盐野义制药', en: 'Shionogi', ja: '塩野義製薬' }, mkt: 'JP', ctry: 'JP', sec: 'health', stage: 'mature', tags: ['制药', '抗感染', '新冠药'] },
  { s: '7751.T', n: { zh: '佳能', en: 'Canon', ja: 'キヤノン' }, mkt: 'JP', ctry: 'JP', sec: 'tech', stage: 'mature', tags: ['影像', '光刻机', '纳米压印', '高股息'] },
  { s: '6902.T', n: { zh: '电装', en: 'DENSO', ja: 'デンソー' }, mkt: 'JP', ctry: 'JP', sec: 'industrial', stage: 'mature', tags: ['汽车零部件', '丰田系', '半导体'] },
  { s: '6752.T', n: { zh: '松下电器', en: 'Panasonic', ja: 'パナソニック' }, mkt: 'JP', ctry: 'JP', sec: 'industrial', stage: 'mature', tags: ['电池', '家电', '工业'] },
  { s: '8035.T', n: { zh: '东京电子', en: 'Tokyo Electron', ja: '東京エレクトロン' }, mkt: 'JP', ctry: 'JP', sec: 'tech', stage: 'growth', tags: ['半导体设备', '涂胶显影', 'AI'] },
  { s: '6594.T', n: { zh: '尼得科', en: 'Nidec', ja: 'ニデック' }, mkt: 'JP', ctry: 'JP', sec: 'industrial', stage: 'growth', tags: ['马达', '电动车', '机器人'] },
  { s: '8766.T', n: { zh: 'SOMPO控股', en: 'Sompo Holdings', ja: 'SOMPOホールディングス' }, mkt: 'JP', ctry: 'JP', sec: 'finance', stage: 'mature', tags: ['保险', '高股息'] },
  { s: '9434.T', n: { zh: '软银电信', en: 'SoftBank Corp', ja: 'ソフトバンク' }, mkt: 'JP', ctry: 'JP', sec: 'comm', stage: 'mature', tags: ['电信', '高股息', 'AI数据中心'] },
  { s: '2502.T', n: { zh: '朝日集团', en: 'Asahi Group', ja: 'アサヒグループ' }, mkt: 'JP', ctry: 'JP', sec: 'consumer', stage: 'mature', tags: ['啤酒', '饮料', '高股息'] },
  { s: '2802.T', n: { zh: '味之素', en: 'Ajinomoto', ja: '味の素' }, mkt: 'JP', ctry: 'JP', sec: 'consumer', stage: 'mature', tags: ['食品', '调味料', '氨基酸'] },
  { s: '3402.T', n: { zh: '东丽', en: 'Toray Industries', ja: '東レ' }, mkt: 'JP', ctry: 'JP', sec: 'materials', stage: 'mature', tags: ['碳纤维', '材料', '隔膜'] },

  // ============ 韩国 🇰🇷 ============
  { s: '005930.KS', n: { zh: '三星电子', en: 'Samsung Electronics', ja: 'サムスン電子' }, mkt: 'KR', ctry: 'KR', sec: 'tech', stage: 'mature', tags: ['存储', 'HBM', '半导体', '手机', 'AI'] },
  { s: '000660.KS', n: { zh: 'SK海力士', en: 'SK Hynix', ja: 'SKハイニックス' }, mkt: 'KR', ctry: 'KR', sec: 'tech', stage: 'growth', tags: ['HBM', '存储', 'AI', '英伟达链'] },
  { s: '005380.KS', n: { zh: '现代汽车', en: 'Hyundai Motor', ja: '現代自動車' }, mkt: 'KR', ctry: 'KR', sec: 'consumer', stage: 'mature', tags: ['汽车', '高股息', '出口'] },
  { s: '035420.KS', n: { zh: 'NAVER', en: 'NAVER', ja: 'ネイバー' }, mkt: 'KR', ctry: 'KR', sec: 'comm', stage: 'mature', tags: ['搜索', '社交', '韩国互联网'] },
  { s: '051910.KS', n: { zh: 'LG化学', en: 'LG Chem', ja: 'LGケミカル' }, mkt: 'KR', ctry: 'KR', sec: 'materials', stage: 'growth', tags: ['电池材料', '化工', '新能源'] },
  { s: '068270.KS', n: { zh: '赛尔群', en: 'Celltrion', ja: 'セルトリオン' }, mkt: 'KR', ctry: 'KR', sec: 'health', stage: 'growth', tags: ['生物仿制药', '生物药'] },
  { s: '373220.KS', n: { zh: 'LG新能源', en: 'LG Energy Solution', ja: 'LGエナジー' }, mkt: 'KR', ctry: 'KR', sec: 'industrial', stage: 'growth', tags: ['动力电池', '储能', '新能源'] },
  { s: '015760.KS', n: { zh: '韩国电力', en: 'KEPCO', ja: '韓国電力' }, mkt: 'KR', ctry: 'KR', sec: 'utility', stage: 'turnaround', tags: ['电力', '公用事业', '核电'] },
  { s: '055550.KS', n: { zh: '新韩金融', en: 'Shinhan Financial', ja: '新韓金融' }, mkt: 'KR', ctry: 'KR', sec: 'finance', stage: 'mature', tags: ['银行', '高股息'] },

  // ============ 印度 🇮🇳 ============
  { s: 'RELIANCE.NS', n: { zh: '信实工业', en: 'Reliance Industries', ja: 'リライアンス・インダストリーズ' }, mkt: 'IN', ctry: 'IN', sec: 'energy', stage: 'mature', tags: ['能源', '零售', '电信', '印度龙头'] },
  { s: 'TCS.NS', n: { zh: '塔塔咨询', en: 'Tata Consultancy Services', ja: 'TCS' }, mkt: 'IN', ctry: 'IN', sec: 'tech', stage: 'mature', tags: ['IT外包', '软件服务', '高股息'] },
  { s: 'INFY.NS', n: { zh: '印孚瑟斯', en: 'Infosys', ja: 'インフォシス' }, mkt: 'IN', ctry: 'IN', sec: 'tech', stage: 'mature', tags: ['IT外包', '软件服务'] },
  { s: 'HDFCBANK.NS', n: { zh: 'HDFC银行', en: 'HDFC Bank', ja: 'HDFC銀行' }, mkt: 'IN', ctry: 'IN', sec: 'finance', stage: 'growth', tags: ['银行', '印度成长'] },
  { s: 'ICICIBANK.NS', n: { zh: 'ICICI银行', en: 'ICICI Bank', ja: 'ICICI銀行' }, mkt: 'IN', ctry: 'IN', sec: 'finance', stage: 'growth', tags: ['银行', '印度成长'] },
  { s: 'SBIN.NS', n: { zh: '印度国家银行', en: 'State Bank of India', ja: 'インド準備銀行' }, mkt: 'IN', ctry: 'IN', sec: 'finance', stage: 'mature', tags: ['银行', '国有银行'] },
  { s: 'BHARTIARTL.NS', n: { zh: '巴帝电信', en: 'Bharti Airtel', ja: 'バルティ・エアテル' }, mkt: 'IN', ctry: 'IN', sec: 'comm', stage: 'growth', tags: ['电信', '印度'] },
  { s: 'LT.NS', n: { zh: '拉森-图博', en: 'Larsen & Toubro', ja: 'L&T' }, mkt: 'IN', ctry: 'IN', sec: 'industrial', stage: 'mature', tags: ['基建', '工程', '国防'] },
  { s: 'HINDUNILVR.NS', n: { zh: '印度斯坦联合利华', en: 'Hindustan Unilever', ja: 'ヒンドゥスタン・ユニリーバ' }, mkt: 'IN', ctry: 'IN', sec: 'consumer', stage: 'mature', tags: ['日用品', '品牌', '印度消费'] },
  { s: 'BAJFINANCE.NS', n: { zh: '巴贾杰金融', en: 'Bajaj Finance', ja: 'バザージ・ファイナンス' }, mkt: 'IN', ctry: 'IN', sec: 'finance', stage: 'growth', tags: ['消费金融', '印度'] },

  // ============ 中概/全球 ADR（美股上市，带定性标签） ============
  { s: 'TSM', n: { zh: '台积电', en: 'TSMC (ADR)', ja: 'TSMC' }, mkt: 'US', ctry: 'TW', sec: 'tech', stage: 'growth', tags: ['晶圆代工', '半导体', 'AI', '先进制程', '台湾'] },
  { s: 'BABA', n: { zh: '阿里巴巴', en: 'Alibaba (ADR)', ja: 'アリババ' }, mkt: 'US', ctry: 'CN', sec: 'consumer', stage: 'mature', tags: ['电商', '云计算', 'AI', '淘宝'] },
  { s: 'PDD', n: { zh: '拼多多', en: 'PDD Holdings', ja: 'ピンドゥドゥオ' }, mkt: 'US', ctry: 'CN', sec: 'consumer', stage: 'growth', tags: ['电商', 'Temu', '出海', '低价'] },
  { s: 'BIDU', n: { zh: '百度', en: 'Baidu', ja: 'バイドゥ' }, mkt: 'US', ctry: 'CN', sec: 'comm', stage: 'mature', tags: ['搜索', 'AI', '自动驾驶', '萝卜快跑'] },

  // ============ 欧洲 🇪🇺（扩充） ============
  { s: 'RMS.PA', n: { zh: '爱马仕', en: 'Hermès', ja: 'エルメス' }, mkt: 'EU', ctry: 'FR', sec: 'consumer', stage: 'mature', tags: ['奢侈品', '品牌', '提价权'] },
  { s: 'DSY.PA', n: { zh: '达索系统', en: 'Dassault Systèmes', ja: 'ダッソー・システムズ' }, mkt: 'EU', ctry: 'FR', sec: 'tech', stage: 'mature', tags: ['工业软件', 'CAD', '3D'] },
  { s: 'AI.PA', n: { zh: '液化空气', en: 'Air Liquide', ja: 'エールリキッド' }, mkt: 'EU', ctry: 'FR', sec: 'materials', stage: 'mature', tags: ['工业气体', '高股息', '垄断'] },
  { s: 'ADS.DE', n: { zh: '阿迪达斯', en: 'Adidas', ja: 'アディダス' }, mkt: 'EU', ctry: 'DE', sec: 'consumer', stage: 'mature', tags: ['运动服饰', '品牌'] },
  { s: 'BMW.DE', n: { zh: '宝马', en: 'BMW', ja: 'BMW' }, mkt: 'EU', ctry: 'DE', sec: 'consumer', stage: 'mature', tags: ['豪华车', '汽车'] },
  { s: 'VOW3.DE', n: { zh: '大众汽车', en: 'Volkswagen', ja: 'フォルクスワーゲン' }, mkt: 'EU', ctry: 'DE', sec: 'consumer', stage: 'turnaround', tags: ['汽车', '电动化转型'] },
  { s: 'ALV.DE', n: { zh: '安联保险', en: 'Allianz', ja: 'アリアンツ' }, mkt: 'EU', ctry: 'DE', sec: 'finance', stage: 'mature', tags: ['保险', '资管', '高股息'] },
  { s: 'BAS.DE', n: { zh: '巴斯夫', en: 'BASF', ja: 'BASF' }, mkt: 'EU', ctry: 'DE', sec: 'materials', stage: 'turnaround', tags: ['化工', '周期', '欧洲能源成本'] },
  { s: 'DTE.DE', n: { zh: '德国电信', en: 'Deutsche Telekom', ja: 'ドイツテレコム' }, mkt: 'EU', ctry: 'DE', sec: 'comm', stage: 'mature', tags: ['电信', 'T-Mobile', '高股息'] },
  { s: 'NOVN.SW', n: { zh: '诺华', en: 'Novartis', ja: 'ノバルティス' }, mkt: 'EU', ctry: 'CH', sec: 'health', stage: 'mature', tags: ['制药', '创新药', '高股息'], cur: 'CHF' },
  { s: 'ROG.SW', n: { zh: '罗氏', en: 'Roche', ja: 'ロシュ' }, mkt: 'EU', ctry: 'CH', sec: 'health', stage: 'mature', tags: ['制药', '肿瘤', '诊断'], cur: 'CHF' },
  { s: 'UBSG.SW', n: { zh: '瑞银集团', en: 'UBS Group', ja: 'UBS' }, mkt: 'EU', ctry: 'CH', sec: 'finance', stage: 'mature', tags: ['投行', '财富管理', '瑞士'], cur: 'CHF' },
  { s: 'ULVR.L', n: { zh: '联合利华', en: 'Unilever', ja: 'ユニリーバ' }, mkt: 'EU', ctry: 'GB', sec: 'consumer', stage: 'mature', tags: ['日用品', '品牌', '高股息'], cur: 'GBP' },
  { s: 'GSK.L', n: { zh: 'GSK', en: 'GSK', ja: 'GSK' }, mkt: 'EU', ctry: 'GB', sec: 'health', stage: 'mature', tags: ['制药', '疫苗', '高股息'], cur: 'GBP' },
  { s: 'BP.L', n: { zh: '英国石油', en: 'BP', ja: 'BP' }, mkt: 'EU', ctry: 'GB', sec: 'energy', stage: 'mature', tags: ['石油', '天然气', '高股息'], cur: 'GBP' },
  { s: 'ITX.MC', n: { zh: '印地纺集团', en: 'Inditex (ZARA)', ja: 'インディテックス' }, mkt: 'EU', ctry: 'ES', sec: 'consumer', stage: 'mature', tags: ['服装', 'ZARA', '快时尚'] },
  { s: 'ENI.MI', n: { zh: '埃尼集团', en: 'Eni', ja: 'エニ' }, mkt: 'EU', ctry: 'IT', sec: 'energy', stage: 'mature', tags: ['石油', '天然气', '高股息'] },

  // ============ 欧洲 🇪🇺 ============
  { s: 'SAP.DE', n: { zh: 'SAP', en: 'SAP', ja: 'SAP' }, mkt: 'EU', ctry: 'DE', sec: 'tech', stage: 'mature', tags: ['企业软件', 'ERP', '云计算', '德国'] },
  { s: 'SIE.DE', n: { zh: '西门子', en: 'Siemens', ja: 'ジーメンス' }, mkt: 'EU', ctry: 'DE', sec: 'industrial', stage: 'mature', tags: ['工业自动化', '基建', '德国'] },
  { s: 'MC.PA', n: { zh: '路威酩轩', en: 'LVMH', ja: 'LVMH' }, mkt: 'EU', ctry: 'FR', sec: 'consumer', stage: 'mature', tags: ['奢侈品', '品牌', '中国消费'] },
  { s: 'OR.PA', n: { zh: '欧莱雅', en: "L'Oréal", ja: 'ロレアル' }, mkt: 'EU', ctry: 'FR', sec: 'consumer', stage: 'mature', tags: ['化妆品', '品牌', '美妆'] },
  { s: 'AIR.PA', n: { zh: '空中客车', en: 'Airbus', ja: 'エアバス' }, mkt: 'EU', ctry: 'FR', sec: 'industrial', stage: 'mature', tags: ['飞机', '军工', '积压订单'] },
  { s: 'TTE.PA', n: { zh: '道达尔能源', en: 'TotalEnergies', ja: 'トタルエナジーズ' }, mkt: 'EU', ctry: 'FR', sec: 'energy', stage: 'mature', tags: ['石油', '高股息'] },
  { s: 'NESN.SW', n: { zh: '雀巢', en: 'Nestlé', ja: 'ネスレ' }, mkt: 'EU', ctry: 'CH', sec: 'consumer', stage: 'mature', tags: ['食品', '品牌', '防御性', '高股息'], cur: 'CHF' },
  { s: 'AZN.L', n: { zh: '阿斯利康', en: 'AstraZeneca', ja: 'アストラゼネカ' }, mkt: 'EU', ctry: 'GB', sec: 'health', stage: 'growth', tags: ['制药', '肿瘤', '创新药'], cur: 'GBP' },
  { s: 'SHEL.L', n: { zh: '壳牌', en: 'Shell', ja: 'シェル' }, mkt: 'EU', ctry: 'GB', sec: 'energy', stage: 'mature', tags: ['石油', '天然气', '高股息'], cur: 'GBP' },
  { s: 'NOVO-B.CO', n: { zh: '诺和诺德', en: 'Novo Nordisk (B)', ja: 'ノボノルディスク(B株)' }, mkt: 'EU', ctry: 'DK', sec: 'health', stage: 'growth', tags: ['减肥药', 'GLP-1', '胰岛素'], cur: 'DKK' },
]

export const UNIVERSE_BY_SYMBOL: Record<string, UItem> = Object.fromEntries(UNIVERSE.map((u) => [u.s, u]))

// 市场总览：全球核心指数（真实代码）
export type IndexDef = { s: string; key: string; group: 'americas' | 'asia' | 'emea'; cur: string; tz?: string }

export const INDICES: IndexDef[] = [
  { s: '^GSPC', key: 'idx.gspc', group: 'americas', cur: 'USD', tz: 'America/New_York' },
  { s: '^IXIC', key: 'idx.ixic', group: 'americas', cur: 'USD', tz: 'America/New_York' },
  { s: '^DJI', key: 'idx.dji', group: 'americas', cur: 'USD', tz: 'America/New_York' },
  { s: '000001.SS', key: 'idx.sse', group: 'asia', cur: 'CNY', tz: 'Asia/Shanghai' },
  { s: '399001.SZ', key: 'idx.szs', group: 'asia', cur: 'CNY', tz: 'Asia/Shanghai' },
  { s: '^HSI', key: 'idx.hsi', group: 'asia', cur: 'HKD', tz: 'Asia/Hong_Kong' },
  { s: '^N225', key: 'idx.n225', group: 'asia', cur: 'JPY', tz: 'Asia/Tokyo' },
  { s: '^KS11', key: 'idx.kospi', group: 'asia', cur: 'KRW', tz: 'Asia/Seoul' },
  { s: '^TWII', key: 'idx.twii', group: 'asia', cur: 'TWD', tz: 'Asia/Taipei' },
  { s: '^FTSE', key: 'idx.ftse', group: 'emea', cur: 'GBP', tz: 'Europe/London' },
  { s: '^GDAXI', key: 'idx.gdaxi', group: 'emea', cur: 'EUR', tz: 'Europe/Berlin' },
  { s: '^FCHI', key: 'idx.fchi', group: 'emea', cur: 'EUR', tz: 'Europe/Paris' },
  { s: '^STOXX50E', key: 'idx.stoxx', group: 'emea', cur: 'EUR', tz: 'Europe/Berlin' },
]

// 宏观脉搏
export const PULSE: { s: string; key: string; kind: 'pct' | 'price'; cur?: string }[] = [
  { s: '^TNX', key: 'pulse.us10y', kind: 'pct' },
  { s: 'DX-Y.NYB', key: 'pulse.dxy', kind: 'price' },
  { s: 'GC=F', key: 'pulse.gold', kind: 'price', cur: 'USD' },
  { s: 'CL=F', key: 'pulse.oil', kind: 'price', cur: 'USD' },
  { s: '^VIX', key: 'pulse.vix', kind: 'price' },
  { s: 'BTC-USD', key: 'pulse.btc', kind: 'price', cur: 'USD' },
]

export const DEFAULT_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', '600519.SS', '0700.HK', '7203.T', '005930.KS', 'MC.PA']
