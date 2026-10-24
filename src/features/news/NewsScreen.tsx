'use client';

import React, { useState } from 'react';
import {
  MOCK_FEATURED_HIGHLIGHTS,
  MOCK_DICTIONARY_ITEMS,
  MOCK_POPULAR_TOPICS,
  MOCK_FEATURED_VIDEOS,
  MOCK_EXPERT_ADVISORS,
  MOCK_TRUST_PILLARS,
  MOCK_MEDIA_PARTNERS,
  MOCK_ARTICLE_SECTIONS,
} from './data/news-mock-data';
import { NewsSubNav } from './components/NewsSubNav';
import { NewsFeaturedHighlights } from './components/NewsFeaturedHighlights';
import { NewsDictionarySection } from './components/NewsDictionarySection';
import { NewsPopularTopics } from './components/NewsPopularTopics';
import { NewsFeaturedVideo } from './components/NewsFeaturedVideo';
import { NewsAdvisoryBoard } from './components/NewsAdvisoryBoard';
import { NewsCommitmentTrust } from './components/NewsCommitmentTrust';
import { NewsSectionArticles } from './components/NewsSectionArticles';
import { NewsArticleModal } from './components/NewsArticleModal';
import { NewsArticleItem, TopicItem, FeaturedHighlightItem } from './types';

export const NewsScreen: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleItem | null>(null);

  const handleSelectHighlight = (highlight: FeaturedHighlightItem) => {
    // Open article modal with highlight details
    setSelectedArticle({
      id: highlight.id,
      title: `${highlight.titleHighlight} ${highlight.titleRest} - ${highlight.subtitle}`,
      excerpt: highlight.note,
      category: highlight.badge,
      categoryColorClass: 'bg-blue-100 text-blue-700',
      publishDate: 'Mới cập nhật',
      author: 'Ban Biên Tập Y Khoa MedConnect',
      image: highlight.image,
    });
  };

  const handleSelectTopic = (topic: TopicItem) => {
    // Scroll to dictionary or show notification
    const dictEl = document.getElementById('medical-dictionary');
    if (dictEl) {
      dictEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-grow bg-[#f8fafc] text-slate-800 font-sans antialiased min-h-screen">
      {/* 1. Secondary Sub-Navigation Strip */}
      <NewsSubNav />

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12 sm:space-y-16">
        {/* Section 1: Featured Highlights */}
        <NewsFeaturedHighlights
          highlights={MOCK_FEATURED_HIGHLIGHTS}
          onSelectHighlight={handleSelectHighlight}
        />

        {/* Section 2: Medical Dictionary & Quick Services */}
        <NewsDictionarySection dictionaryItems={MOCK_DICTIONARY_ITEMS} />

        {/* Section 3: Popular Topics (12 Topics) */}
        <NewsPopularTopics
          topics={MOCK_POPULAR_TOPICS}
          onSelectTopic={handleSelectTopic}
        />

        {/* Section 4: Featured Video & Playlist */}
        <NewsFeaturedVideo
          mainVideo={MOCK_FEATURED_VIDEOS.mainVideo}
          sideVideos={MOCK_FEATURED_VIDEOS.sideVideos}
        />

        {/* Section 5: Medical Advisory Board */}
        <NewsAdvisoryBoard experts={MOCK_EXPERT_ADVISORS} />

        {/* Section 6: Commitments & Trust / Media Partners */}
        <NewsCommitmentTrust
          pillars={MOCK_TRUST_PILLARS}
          mediaPartners={MOCK_MEDIA_PARTNERS}
        />

        {/* Section 7, 8, 9: Reusable Article Sections */}
        {MOCK_ARTICLE_SECTIONS.map((section) => (
          <NewsSectionArticles
            key={section.id}
            section={section}
            onSelectArticle={setSelectedArticle}
          />
        ))}
      </main>

      {/* Article Detail Reading Modal */}
      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};
