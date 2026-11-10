"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

// --- Helper: Format seconds to mm:ss ---
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// --- Helper: Get file extension badge ---
function getFileExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

// --- Audio Voice Note Player Component ---
function VoiceNotePlayer({ media, sender, isMe }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPlayed, setIsPlayed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 24);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setIsPlayed(true);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPlayed(true);
      }).catch((e) => {
        console.warn("Audio playback interrupted:", e);
      });
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = newRatio * duration;
    setCurrentTime(newRatio * duration);
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`p-2.5 rounded-xl border flex items-center space-x-3 min-w-[260px] sm:min-w-[300px] transition-colors ${
      isMe
        ? "bg-[#D9FDD3]/80 border-[#A7E894]"
        : "bg-[#F0F2F5] border-[#E9EDEF]"
    }`}>
      {media.url && <audio ref={audioRef} src={media.url} preload="metadata" />}

      {/* Avatar & Mic Indicator */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#00A884] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {sender ? sender.slice(0, 1).toUpperCase() : "U"}
        </div>
        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white shadow-sm ${
          isPlayed ? "bg-[#53BDEB]" : "bg-[#25D366]"
        }`} title={isPlayed ? "Played" : "Unplayed"}>
          🎙️
        </span>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#054740] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-all flex-shrink-0 cursor-pointer"
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? (
          <span className="text-xs">❚❚</span>
        ) : (
          <span className="text-xs ml-0.5">▶</span>
        )}
      </button>

      {/* Waveform Scrubber & Timers */}
      <div className="flex-1 space-y-1.5 min-w-0">
        <div
          onClick={handleSeek}
          className="h-6 flex items-center space-x-0.5 cursor-pointer group"
          title="Click to seek"
        >
          {[4, 8, 14, 10, 16, 22, 12, 18, 24, 14, 8, 18, 22, 12, 6, 14, 20, 16, 10, 6, 14, 18, 12, 8].map((h, i) => {
            const barPercent = (i / 24) * 100;
            const isFilled = barPercent <= progressPercent;
            return (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={`w-1 rounded-full transition-all ${
                  isFilled
                    ? isPlayed ? "bg-[#53BDEB]" : "bg-[#00A884]"
                    : "bg-[#8696A0]/40 group-hover:bg-[#8696A0]/60"
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#667781] font-medium">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={cycleSpeed}
              className="px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 font-bold text-[9px] text-[#111B21] transition-colors"
              title="Change playback speed"
            >
              {speed}x
            </button>
            <span>{formatTime(duration || 24)}</span>
          </div>
        </div>
      </div>

      {/* Download Action */}
      {media.url && (
        <a
          href={media.url}
          download={media.fileName || "voice_note.mp3"}
          className="text-[#667781] hover:text-[#00A884] p-1.5 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
          title="Download voice note"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      )}
    </div>
  );
}

// --- Video Bubble Component ---
function VideoBubble({ media, onOpenLightbox }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlayToggle = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-black/10 bg-black max-w-sm group">
      {media.url ? (
        <div className="relative">
          <video
            ref={videoRef}
            src={media.url}
            className="w-full max-h-72 object-cover bg-black"
            controls={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {!isPlaying && (
            <div
              onClick={handlePlayToggle}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity group-hover:bg-black/30"
            >
              <div className="w-14 h-14 rounded-full bg-white/90 text-[#075E54] flex items-center justify-center font-bold text-xl shadow-lg hover:scale-110 transition-transform">
                ▶
              </div>
            </div>
          )}

          {/* Top Bar Overlay */}
          <div className="absolute top-2 right-2 flex items-center space-x-1.5 z-10">
            <button
              onClick={() => onOpenLightbox(media)}
              className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs shadow transition-colors"
              title="Expand video"
            >
              ⛶
            </button>
            <a
              href={media.url}
              download={media.fileName || "whatsapp_video.mp4"}
              className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs shadow transition-colors"
              title="Download video"
            >
              ⬇
            </a>
          </div>

          {/* Bottom Duration Badge */}
          {!isPlaying && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1">
              <span>🎥</span>
              <span>{media.fileName || "Video"}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
          <span>🎥</span>
          <span>{media.fileName || "Video attachment"}</span>
        </div>
      )}
    </div>
  );
}

// --- Document Bubble Component ---
function DocumentBubble({ media }) {
  const ext = getFileExtension(media.fileName || "document.pdf");
  const extColors = {
    PDF: "bg-red-500",
    DOC: "bg-blue-600",
    DOCX: "bg-blue-600",
    XLS: "bg-emerald-600",
    XLSX: "bg-emerald-600",
    PPT: "bg-orange-500",
    PPTX: "bg-orange-500",
    ZIP: "bg-amber-600",
    RAR: "bg-amber-600",
  };
  const badgeColor = extColors[ext] || "bg-[#075E54]";

  return (
    <div className="p-3 bg-[#F0F2F5] hover:bg-[#E9EDEF] rounded-xl border border-[#E9EDEF] flex items-center space-x-3 min-w-[240px] max-w-sm transition-colors group">
      <div className={`w-11 h-11 rounded-lg ${badgeColor} text-white flex flex-col items-center justify-center font-extrabold text-[10px] shadow-sm flex-shrink-0`}>
        <span>📄</span>
        <span className="leading-none mt-0.5">{ext.slice(0, 4)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-[#111B21] truncate group-hover:text-[#00A884] transition-colors">
          {media.fileName || "Document"}
        </div>
        <div className="text-[10px] text-[#667781] flex items-center space-x-1 mt-0.5">
          <span>{media.size || "1.2 MB"}</span>
          <span>•</span>
          <span>{ext} Document</span>
        </div>
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0">
        {media.url && media.url !== "#" ? (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-[#075E54] border border-gray-200 text-xs font-bold shadow-sm transition-colors"
            title="Open document"
          >
            Open
          </a>
        ) : null}
        {media.url && (
          <a
            href={media.url}
            download={media.fileName || "document"}
            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 text-[#667781] hover:text-[#075E54] border border-gray-200 transition-colors"
            title="Download document"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// --- Main Chat Viewer Component ---
export default function WhatsAppChatViewer({ chatData, onClear }) {
  const [activeParticipant, setActiveParticipant] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxRotation, setLightboxRotation] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState("media"); // 'media', 'docs', 'audio'

  const rawMessages = useMemo(() => {
    if (!chatData || !Array.isArray(chatData.messages)) return [];
    return chatData.messages;
  }, [chatData]);

  // Extract participants
  const participants = useMemo(() => {
    const set = new Set();
    rawMessages.forEach((m) => {
      if (m && m.sender) set.add(m.sender);
    });
    return Array.from(set);
  }, [rawMessages]);

  // Determine main chat title and partner
  const chatTitle = useMemo(() => {
    if (participants.length === 2) {
      return participants.find((p) => p !== "You") || participants[0];
    }
    if (participants.length > 2) {
      return `Group Chat (${participants.length} members)`;
    }
    return chatData?.fileName?.replace(/\.txt$/i, "") || "WhatsApp Chat";
  }, [participants, chatData]);

  // Extract all media items for Lightbox & Media Gallery
  const allMediaList = useMemo(() => {
    const items = [];
    rawMessages.forEach((msg, idx) => {
      if (msg.media && (msg.media.url || msg.media.fileName)) {
        items.push({
          ...msg.media,
          messageIndex: idx,
          sender: msg.sender,
          date: msg.date,
          time: msg.time,
          text: msg.message,
        });
      }
    });
    return items;
  }, [rawMessages]);

  const photosAndVideos = useMemo(() => {
    return allMediaList.filter((m) => m.kind === "image" || m.kind === "video");
  }, [allMediaList]);

  const documentsList = useMemo(() => {
    return allMediaList.filter((m) => m.kind === "document");
  }, [allMediaList]);

  const audioList = useMemo(() => {
    return allMediaList.filter((m) => m.kind === "audio");
  }, [allMediaList]);

  // Filter messages by participant and search query
  const filteredMessages = useMemo(() => {
    return rawMessages.filter((msg) => {
      if (!msg) return false;
      const matchesSender = activeParticipant === "all" || msg.sender === activeParticipant;
      const matchesSearch =
        !searchQuery.trim() ||
        (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (msg.sender && msg.sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (msg.media?.fileName && msg.media.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSender && matchesSearch;
    });
  }, [rawMessages, activeParticipant, searchQuery]);

  // Group messages by date
  const messagesByDate = useMemo(() => {
    const groups = {};
    filteredMessages.forEach((msg) => {
      const dateKey = msg.date || "Unknown Date";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [filteredMessages]);

  const handleOpenLightbox = (media) => {
    const idx = photosAndVideos.findIndex((m) => m.url === media.url || m.fileName === media.fileName);
    setLightboxIndex(idx !== -1 ? idx : 0);
    setLightboxZoom(1);
    setLightboxRotation(0);
  };

  const currentLightboxMedia = lightboxIndex !== null ? photosAndVideos[lightboxIndex] : null;

  const handlePrevMedia = useCallback(() => {
    if (lightboxIndex === null || photosAndVideos.length === 0) return;
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photosAndVideos.length - 1));
    setLightboxZoom(1);
    setLightboxRotation(0);
  }, [lightboxIndex, photosAndVideos.length]);

  const handleNextMedia = useCallback(() => {
    if (lightboxIndex === null || photosAndVideos.length === 0) return;
    setLightboxIndex((prev) => (prev < photosAndVideos.length - 1 ? prev + 1 : 0));
    setLightboxZoom(1);
    setLightboxRotation(0);
  }, [lightboxIndex, photosAndVideos.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrevMedia();
      if (e.key === "ArrowRight") handleNextMedia();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrevMedia, handleNextMedia]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(rawMessages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chatData?.fileName?.replace(/\.txt$/i, "") || "whatsapp_chat"}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!rawMessages || rawMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl border border-gray-200">
        <div className="w-16 h-16 rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#075E54] text-2xl mb-4">
          💬
        </div>
        <h3 className="text-lg font-bold text-[#111B21]">No WhatsApp Messages to Display</h3>
        <p className="text-sm text-[#667781] max-w-sm mt-1">
          Upload a WhatsApp `.txt` export or try our demo chat to explore your conversation in full WhatsApp Web style.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto rounded-xl shadow-xl overflow-hidden border border-[#E9EDEF] bg-white flex flex-col md:flex-row h-[780px] relative">
      {/* Left Sidebar - Contacts & Filters */}
      <aside className="w-full md:w-80 bg-white border-r border-[#E9EDEF] flex flex-col flex-shrink-0">
        {/* Sidebar Header */}
        <div className="h-16 px-4 bg-[#F0F2F5] flex items-center justify-between border-b border-[#E9EDEF]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#075E54] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {chatTitle.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111B21] leading-tight truncate max-w-[150px]">
                {chatTitle}
              </h2>
              <span className="text-[11px] text-[#667781]">
                {rawMessages.length} total messages
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-[#667781]">
            <button
              onClick={() => setIsGalleryOpen(!isGalleryOpen)}
              title="Media, Links & Docs Gallery"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isGalleryOpen ? "bg-[#25D366] text-[#054740]" : "hover:bg-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleExportJSON}
              title="Export as JSON"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {onClear && (
              <button
                onClick={onClear}
                title="Close and upload new chat"
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-red-500 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search input in sidebar */}
        <div className="p-2.5 bg-white border-b border-[#E9EDEF]">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[#667781]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search text or media filenames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F0F2F5] text-xs text-[#111B21] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00A884] placeholder-[#8696A0]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-xs text-[#8696A0] hover:text-[#111B21] cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Participants filter list */}
        <div className="p-3 bg-[#F8FAFC] border-b border-[#E9EDEF]">
          <div className="text-[11px] font-semibold text-[#667781] uppercase tracking-wider mb-2">
            Filter by Sender
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveParticipant("all")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeParticipant === "all"
                  ? "bg-[#075E54] text-white"
                  : "bg-white text-[#111B21] border border-gray-200 hover:bg-gray-100"
              }`}
            >
              All ({rawMessages.length})
            </button>
            {participants.map((p) => {
              const count = rawMessages.filter((m) => m.sender === p).length;
              return (
                <button
                  key={p}
                  onClick={() => setActiveParticipant(p)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    activeParticipant === p
                      ? "bg-[#00A884] text-white"
                      : "bg-white text-[#111B21] border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {p} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Media Overview Pill Button */}
        <div className="p-3 border-b border-[#E9EDEF]">
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="w-full py-2 px-3 bg-[#E7FFDB] hover:bg-[#d4fabf] text-[#075E54] border border-[#25D366]/40 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center space-x-2">
              <span>🖼️</span>
              <span>Media, Links & Docs</span>
            </span>
            <span className="bg-[#075E54] text-white px-2 py-0.5 rounded-full text-[10px]">
              {allMediaList.length} files
            </span>
          </button>
        </div>

        {/* Chat metadata info */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-[#667781]">
          <div className="p-3 bg-[#F0F2F5] rounded-lg space-y-1.5 border border-[#E9EDEF]">
            <div className="font-semibold text-[#111B21] flex items-center space-x-1.5">
              <span>📄</span>
              <span className="truncate">{chatData?.fileName || "Exported Chat"}</span>
            </div>
            <div>Showing: <strong>{filteredMessages.length}</strong> matching messages</div>
            <div>Senders detected: <strong>{participants.join(", ")}</strong></div>
            <div className="pt-1 flex items-center space-x-2 text-[11px]">
              <span className="bg-white px-2 py-0.5 rounded border border-gray-200">📷 {photosAndVideos.length} Media</span>
              <span className="bg-white px-2 py-0.5 rounded border border-gray-200">📑 {documentsList.length} Docs</span>
              <span className="bg-white px-2 py-0.5 rounded border border-gray-200">🎙️ {audioList.length} Audio</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 space-y-1">
            <div className="font-bold flex items-center space-x-1">
              <span>🔒</span>
              <span>End-to-End Privacy</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Photos, audio voice notes, videos, and documents are rendered in authentic WhatsApp Web style with full zoom and lightbox controls.
            </p>
          </div>
        </div>
      </aside>

      {/* Right Main Chat Pane */}
      <main className="flex-1 flex flex-col bg-[#EFEAE2] wa-chat-bg relative overflow-hidden">
        {/* Chat Window Top Bar */}
        <header className="h-16 px-4 bg-[#F0F2F5] flex items-center justify-between border-b border-[#E9EDEF] z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#128C7E] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {chatTitle.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-base font-bold text-[#111B21] leading-tight">
                {chatTitle}
              </h1>
              <p className="text-xs text-[#667781] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] inline-block" />
                <span>active session • {filteredMessages.length} messages • {allMediaList.length} media</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsGalleryOpen(!isGalleryOpen)}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#075E54] border border-[#E9EDEF] rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>🖼️</span>
              <span className="hidden sm:inline">Media Gallery ({allMediaList.length})</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#075E54] border border-[#E9EDEF] rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>📥</span>
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Chat Messages Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Security Notice Pill */}
          <div className="flex justify-center my-2">
            <div className="bg-[#FFF5C4] text-[#54656F] text-[11px] px-3 py-1.5 rounded-lg shadow-sm max-w-md text-center border border-[#FFE885] flex items-center space-x-1.5">
              <span>🔒</span>
              <span>
                Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
              </span>
            </div>
          </div>

          {Object.entries(messagesByDate).map(([date, msgs]) => (
            <div key={date} className="space-y-2">
              {/* Date Divider Chip */}
              <div className="flex justify-center my-3">
                <span className="bg-white/90 backdrop-blur-sm text-[#54656F] text-[11px] font-semibold px-3 py-1 rounded-md shadow-sm border border-[#E9EDEF] uppercase tracking-wide">
                  {date}
                </span>
              </div>

              {/* Message Bubbles */}
              {msgs.map((msg, idx) => {
                const isMe = msg.isMe || msg.sender === "You" || msg.sender?.toLowerCase() === "you";
                const isMedia = Boolean(msg.media);

                return (
                  <div
                    key={`${msg.date}-${msg.time}-${idx}`}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} px-1`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[72%] rounded-lg px-3 py-2 shadow-wa-bubble relative text-sm ${
                        isMe
                          ? "bg-[#D9FDD3] text-[#111B21] rounded-tr-none bubble-tail-out"
                          : "bg-white text-[#111B21] rounded-tl-none bubble-tail-in"
                      }`}
                    >
                      {/* Sender name for group/incoming */}
                      {!isMe && (
                        <div className="text-[11px] font-bold text-[#128C7E] mb-1">
                          {msg.sender}
                        </div>
                      )}

                      {/* Attached Media Renderers */}
                      {isMedia && (
                        <div className="mb-2 mt-0.5 space-y-1">
                          {/* Image Attachment */}
                          {msg.media.kind === "image" && (
                            <div className="rounded-lg overflow-hidden border border-black/10 bg-black/5 relative group max-w-sm">
                              {msg.media.url ? (
                                <div className="relative cursor-pointer" onClick={() => handleOpenLightbox(msg.media)}>
                                  <img
                                    src={msg.media.url}
                                    alt={msg.media.fileName || "WhatsApp Image"}
                                    className="w-full max-h-72 object-cover transition-transform group-hover:scale-[1.02] duration-200"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity flex items-center space-x-1">
                                      <span>🔍</span>
                                      <span>View Fullscreen</span>
                                    </span>
                                  </div>
                                  <a
                                    href={msg.media.url}
                                    download={msg.media.fileName || "image.jpg"}
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs shadow transition-colors"
                                    title="Download image"
                                  >
                                    ⬇
                                  </a>
                                </div>
                              ) : (
                                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
                                  <span>🖼️</span>
                                  <span>{msg.media.label || msg.media.fileName || "Image attachment"}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Video Attachment */}
                          {msg.media.kind === "video" && (
                            <VideoBubble media={msg.media} onOpenLightbox={handleOpenLightbox} />
                          )}

                          {/* Voice Note / Audio Attachment */}
                          {msg.media.kind === "audio" && (
                            <VoiceNotePlayer media={msg.media} sender={msg.sender} isMe={isMe} />
                          )}

                          {/* Document Attachment */}
                          {msg.media.kind === "document" && (
                            <DocumentBubble media={msg.media} />
                          )}

                          {/* Generic or Omitted Media */}
                          {msg.media.kind === "unknown" && (
                            <div className="bg-black/5 p-2.5 rounded-lg text-xs text-[#667781] flex items-center space-x-2 border border-black/5">
                              <span className="text-base">📎</span>
                              <div>
                                <div className="font-semibold">{msg.media.label || "Media attachment"}</div>
                                <div className="text-[10px]">Exported without attached binary file</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Text (if not redundant with filename) */}
                      {msg.message &&
                        !msg.message.endsWith("(file attached)") &&
                        !msg.message.startsWith("<attached:") &&
                        !msg.message.includes("omitted") && (
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.message}
                          </p>
                        )}

                      {/* Message Footer: Timestamp and Read Double Ticks */}
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-[#667781] select-none">
                        <span>{msg.time}</span>
                        {isMe && (
                          <span className="text-[#53BDEB] font-bold text-xs" title="Read">
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Chat Footer Bar */}
        <footer className="h-14 px-4 bg-[#F0F2F5] flex items-center justify-between border-t border-[#E9EDEF] text-xs text-[#667781] flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span>✨</span>
            <span>Rendered with authentic WhatsApp Web layout & full media playback</span>
          </div>
          <div>
            Showing <strong>{filteredMessages.length}</strong> of {rawMessages.length} messages
          </div>
        </footer>
      </main>

      {/* Right Slide-Over: WhatsApp Media, Links & Docs Gallery */}
      {isGalleryOpen && (
        <aside className="absolute inset-y-0 right-0 z-30 w-full sm:w-96 bg-white border-l border-[#E9EDEF] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Gallery Header */}
          <div className="h-16 px-4 bg-[#075E54] text-white flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🖼️</span>
              <div>
                <h3 className="font-bold text-sm leading-tight">Media, Links & Docs</h3>
                <p className="text-[11px] text-white/80">{allMediaList.length} total items in chat</p>
              </div>
            </div>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Close gallery"
            >
              ✕
            </button>
          </div>

          {/* Gallery Tabs */}
          <div className="flex border-b border-[#E9EDEF] bg-[#F0F2F5] text-xs font-semibold">
            <button
              onClick={() => setGalleryTab("media")}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                galleryTab === "media"
                  ? "border-b-2 border-[#00A884] text-[#00A884] bg-white font-bold"
                  : "text-[#667781] hover:text-[#111B21]"
              }`}
            >
              Photos & Videos ({photosAndVideos.length})
            </button>
            <button
              onClick={() => setGalleryTab("docs")}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                galleryTab === "docs"
                  ? "border-b-2 border-[#00A884] text-[#00A884] bg-white font-bold"
                  : "text-[#667781] hover:text-[#111B21]"
              }`}
            >
              Docs ({documentsList.length})
            </button>
            <button
              onClick={() => setGalleryTab("audio")}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                galleryTab === "audio"
                  ? "border-b-2 border-[#00A884] text-[#00A884] bg-white font-bold"
                  : "text-[#667781] hover:text-[#111B21]"
              }`}
            >
              Voice ({audioList.length})
            </button>
          </div>

          {/* Gallery Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {galleryTab === "media" && (
              <div>
                {photosAndVideos.length === 0 ? (
                  <div className="text-center py-16 text-[#667781] space-y-2">
                    <span className="text-4xl block">📷</span>
                    <p className="text-xs">No photos or videos attached in this chat.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {photosAndVideos.map((m, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setLightboxIndex(i);
                          setLightboxZoom(1);
                          setLightboxRotation(0);
                        }}
                        className="relative aspect-square rounded-lg overflow-hidden bg-black/5 border border-black/10 cursor-pointer group hover:opacity-90"
                      >
                        {m.kind === "video" ? (
                          <div className="w-full h-full bg-black flex items-center justify-center relative">
                            <video src={m.url} className="w-full h-full object-cover opacity-70" />
                            <span className="absolute text-white text-lg">▶</span>
                          </div>
                        ) : (
                          <img
                            src={m.url}
                            alt={m.fileName || "Thumbnail"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                          {m.kind === "video" ? "🎥" : "📷"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {galleryTab === "docs" && (
              <div className="space-y-2">
                {documentsList.length === 0 ? (
                  <div className="text-center py-16 text-[#667781] space-y-2">
                    <span className="text-4xl block">📑</span>
                    <p className="text-xs">No documents attached in this chat.</p>
                  </div>
                ) : (
                  documentsList.map((doc, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#F0F2F5] hover:bg-[#E9EDEF] rounded-xl border border-[#E9EDEF] flex items-center space-x-3 transition-colors"
                    >
                      <span className="text-2xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#111B21] truncate">
                          {doc.fileName || "Document"}
                        </div>
                        <div className="text-[10px] text-[#667781]">{doc.date} • {doc.sender}</div>
                      </div>
                      {doc.url && (
                        <a
                          href={doc.url}
                          download={doc.fileName || "document"}
                          className="px-2.5 py-1 bg-white hover:bg-[#075E54] hover:text-white text-[#075E54] border border-[#E9EDEF] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          ⬇
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {galleryTab === "audio" && (
              <div className="space-y-3">
                {audioList.length === 0 ? (
                  <div className="text-center py-16 text-[#667781] space-y-2">
                    <span className="text-4xl block">🎙️</span>
                    <p className="text-xs">No voice notes attached in this chat.</p>
                  </div>
                ) : (
                  audioList.map((audioItem, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[11px] font-semibold text-[#667781] flex justify-between">
                        <span>{audioItem.sender}</span>
                        <span>{audioItem.date} {audioItem.time}</span>
                      </div>
                      <VoiceNotePlayer media={audioItem} sender={audioItem.sender} isMe={false} />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Full-Featured WhatsApp Lightbox Modal for Images & Videos */}
      {currentLightboxMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar Navigation */}
          <div
            className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 text-white z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center font-bold text-sm">
                {currentLightboxMedia.sender ? currentLightboxMedia.sender.slice(0, 1).toUpperCase() : "U"}
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">
                  {currentLightboxMedia.fileName || "WhatsApp Media"}
                </div>
                <div className="text-xs text-white/70">
                  {currentLightboxMedia.sender} • {currentLightboxMedia.date} at {currentLightboxMedia.time}
                </div>
              </div>
            </div>

            {/* Actions: Zoom, Rotate, Download, Close */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-white/60 font-semibold mr-2">
                {lightboxIndex + 1} / {photosAndVideos.length}
              </span>

              {currentLightboxMedia.kind === "image" && (
                <>
                  <button
                    onClick={() => setLightboxZoom((z) => Math.min(3, z + 0.25))}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setLightboxZoom((z) => Math.max(0.5, z - 0.25))}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    title="Zoom out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setLightboxRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                    title="Rotate 90°"
                  >
                    ↻
                  </button>
                </>
              )}

              {currentLightboxMedia.url && (
                <a
                  href={currentLightboxMedia.url}
                  download={currentLightboxMedia.fileName || "download"}
                  className="px-3 py-1.5 rounded-lg bg-[#00A884] hover:bg-[#054740] text-white text-xs font-bold shadow transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Download file"
                >
                  <span>⬇</span>
                  <span>Download</span>
                </a>
              )}

              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-base transition-colors cursor-pointer"
                title="Close viewer (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Previous Media Arrow Button */}
          {photosAndVideos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevMedia();
              }}
              className="absolute left-4 z-50 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white text-xl backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
              title="Previous media (Arrow Left)"
            >
              ‹
            </button>
          )}

          {/* Lightbox Media Display */}
          <div
            className="relative max-w-5xl max-h-[80vh] flex items-center justify-center p-4 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {currentLightboxMedia.kind === "video" ? (
              <video
                src={currentLightboxMedia.url}
                className="max-h-[75vh] max-w-full rounded-lg shadow-2xl bg-black"
                controls
                autoPlay
              />
            ) : (
              <img
                src={currentLightboxMedia.url}
                alt={currentLightboxMedia.fileName || "Media preview"}
                style={{
                  transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
                  transition: "transform 0.2s ease-out",
                }}
                className="max-h-[75vh] max-w-full rounded-lg shadow-2xl object-contain select-none"
              />
            )}
          </div>

          {/* Next Media Arrow Button */}
          {photosAndVideos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextMedia();
              }}
              className="absolute right-4 z-50 p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white text-xl backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
              title="Next media (Arrow Right)"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
