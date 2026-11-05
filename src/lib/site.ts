// 站点级常量：全站唯一的域名与品牌基线，换域名只改环境变量
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://prismlens.app').replace(/\/$/, '')

export const SITE_NAME = '棱镜投研 PrismLens'
export const SITE_BRAND = 'PrismLens'
export const SITE_TAGLINE = '全球真实市场 AI 投研终端'

export const SITE_DESC =
  '基于真实行情与财报的 AI 投研终端：宏观周期 × 行业格局（PEST/波特五力/产业链）× 公司质地三层分析，融合道氏理论、价值投资、基本面与量化的四维决策引擎。覆盖美国、中国A股、香港、日本、韩国、印度、欧洲七大市场。'
