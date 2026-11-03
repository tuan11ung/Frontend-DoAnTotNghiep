import { MOCK_ARTICLE_SECTIONS } from '../data/news-mock-data';

export const NEWS_ARTICLES = MOCK_ARTICLE_SECTIONS.flatMap((section) => [
  section.featuredArticle,
  ...section.sideArticles,
]);
