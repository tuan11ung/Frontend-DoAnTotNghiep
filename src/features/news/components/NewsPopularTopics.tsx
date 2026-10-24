import React from 'react';
import { Layers } from 'lucide-react';
import { TopicItem } from '../types';

interface NewsPopularTopicsProps {
  topics: TopicItem[];
  onSelectTopic?: (topic: TopicItem) => void;
}

export const NewsPopularTopics: React.FC<NewsPopularTopicsProps> = ({
  topics,
  onSelectTopic,
}) => {
  return (
    <section data-purpose="popular-topics" id="popular-topics">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Chủ Đề Được Quan Tâm
        </h2>
      </div>

      {/* 12 Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {topics.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTopic?.(item)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-200">
              {item.icon}
            </div>
            <span
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                item.colorClass || 'text-slate-700 group-hover:text-blue-600'
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
