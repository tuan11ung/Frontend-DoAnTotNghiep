'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Video as VideoIcon, X } from 'lucide-react';
import { VideoItem } from '../types';

interface NewsFeaturedVideoProps {
  mainVideo: VideoItem;
  sideVideos: VideoItem[];
}

export const NewsFeaturedVideo: React.FC<NewsFeaturedVideoProps> = ({
  mainVideo,
  sideVideos,
}) => {
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  return (
    <section data-purpose="featured-video" id="featured-video">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
          <VideoIcon className="w-4 h-4" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Video Nổi Bật
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Featured Video */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPlayingVideo(mainVideo)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setPlayingVideo(mainVideo);
          }}
          className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden relative shadow-md group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="relative aspect-video w-full h-full min-h-[300px] sm:min-h-[380px]">
            <Image
              src={mainVideo.thumbnail}
              alt={mainVideo.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-90 group-hover:scale-102 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-center justify-center">
              {/* Red Play Button */}
              <button
                type="button"
                aria-label="Phát video"
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayingVideo(mainVideo);
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition cursor-pointer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
            </div>

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white mb-2 shadow-xs">
                {mainVideo.category}
              </span>
              <h3 className="text-base sm:text-xl font-bold leading-snug drop-shadow-sm">
                {mainVideo.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">{mainVideo.publisher}</p>
            </div>
          </div>
        </div>

        {/* Video Playlist Side Items */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {sideVideos.map((vid) => (
            <article
              key={vid.id}
              onClick={() => setPlayingVideo(vid)}
              className="p-3 bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all flex gap-3 cursor-pointer group flex-1 items-center"
            >
              <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                <Image
                  src={vid.thumbnail}
                  alt={vid.title}
                  fill
                  sizes="112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xs">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <span className={`text-[11px] font-bold ${vid.categoryColorClass}`}>
                  {vid.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors mt-0.5 leading-snug">
                  {vid.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">{vid.publisher}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {playingVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
        >
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-800">
            <div className="p-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-bold uppercase">
                  Video
                </span>
                <h4 className="text-sm font-bold truncate">{playingVideo.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {playingVideo.videoUrl ? (
                <iframe
                  src={playingVideo.videoUrl}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  Video đang được xử lý hoặc tải lên...
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
              <span>Được cung cấp bởi: {playingVideo.publisher}</span>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
