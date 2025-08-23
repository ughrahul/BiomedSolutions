"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface VideoBackgroundProps {
  videoSrc: string;
  posterSrc: string;
  className?: string;
  overlayClassName?: string;
  showLoadingIndicator?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  filter?: string;
  onVideoLoad?: () => void;
  onVideoError?: () => void;
}

export default function VideoBackground({
  videoSrc,
  posterSrc,
  className = "absolute inset-0 w-full h-full object-cover opacity-90",
  overlayClassName = "",
  showLoadingIndicator = true,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = "auto",
  filter = "contrast(1.3) brightness(0.7) saturate(1.4) hue-rotate(5deg)",
  onVideoLoad,
  onVideoError,
}: VideoBackgroundProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);
      setIsLoading(false);
      onVideoLoad?.();
      
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        video.style.opacity = '1';
      }, 100);
    };

    const handleError = () => {
      setVideoError(true);
      setIsLoading(false);
      console.warn('Video failed to load, using poster image');
      onVideoError?.();
    };

    const handleCanPlay = () => {
      // Video is ready to play
      setVideoLoaded(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onVideoLoad, onVideoError]);

  return (
    <div className="relative w-full h-full">
      {/* Poster Image - Always visible first */}
      <div 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${className}`}
        style={{
          backgroundImage: `url(${posterSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: filter,
          opacity: videoLoaded ? 0 : 1,
        }}
      />
      
      {/* Video - Fades in when loaded */}
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        className={`absolute inset-0 transition-opacity duration-1000 ${className}`}
        poster={posterSrc}
        style={{
          filter: filter,
          opacity: videoLoaded ? 1 : 0,
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        {/* Fallback text if video fails completely */}
        <p className="sr-only">Video not supported</p>
      </video>
      
      {/* Overlay gradients */}
      <div className={`absolute inset-0 ${overlayClassName}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-purple-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20" />
      </div>
      
      {/* Loading indicator */}
      {showLoadingIndicator && isLoading && !videoError && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin opacity-50" />
        </motion.div>
      )}
    </div>
  );
}
