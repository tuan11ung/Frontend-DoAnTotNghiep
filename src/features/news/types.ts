export interface FeaturedHighlightItem {
  id: string;
  badge: string;
  badgeBgClass: string;
  titlePrefix?: string;
  titleHighlight: string;
  titleRest: string;
  subtitle: string;
  note: string;
  image: string;
  tags?: string[];
  gradientClass: string;
  textClass?: string;
}

export type DictionaryTab = 'thuoc' | 'duoc-lieu' | 'benh' | 'co-the';

export interface DictionaryItem {
  id: string;
  name: string;
  category: DictionaryTab;
  firstLetter: string;
  shortDesc: string;
  detailDesc?: string;
  author: string;
  publishDate: string;
  image: string;
  activeIngredient?: string;
  usage?: string;
  contraindications?: string;
}

export interface TopicItem {
  id: string;
  name: string;
  icon: string;
  slug: string;
  colorClass?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  categoryColorClass: string;
  publisher: string;
  thumbnail: string;
  videoUrl?: string;
  duration?: string;
  isMain?: boolean;
}

export interface ExpertAdvisorItem {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  avatar: string;
  workplace?: string;
}

export interface TrustPillarItem {
  id: string;
  icon: string;
  title: string;
}

export interface MediaPartnerItem {
  id: string;
  partnerName: string;
  quote: string;
  logoUrl?: string;
  textLogo?: {
    prefix: string;
    suffix: string;
  };
}

export interface NewsArticleItem {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  categoryColorClass: string;
  publishDate: string;
  author: string;
  image: string;
  isSponsored?: boolean;
}

export interface NewsSectionData {
  id: string;
  title: string;
  categorySlug: string;
  viewAllHref: string;
  featuredArticle: NewsArticleItem;
  sideArticles: NewsArticleItem[];
}
