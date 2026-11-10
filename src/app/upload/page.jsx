"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PaymentModal from "@/components/PaymentModal";
import { SAMPLE_CHAT_TEXT, SAMPLE_MEDIA } from "@/lib/sampleChat";
import { parseWhatsAppChat } from "@/lib/whatsAppParser";

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isPro, trialUsed, trialLimit, refreshUser, updateUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const fileInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const isLimitReached = !isPro && trialUsed >= trialLimit;

  // Categorize selected media files
  const mediaStats = {
    images: mediaFiles.filter((f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(f.name)).length,
    videos: mediaFiles.filter((f) => f.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(f.name)).length,
    audio: mediaFiles.filter((f) => f.type.startsWith("audio/") || /\.(mp3|aac|wav|ogg|m4a|opus)$/i.test(f.name)).length,
    documents: mediaFiles.filter((f) => f.type === "application/pdf" || /\.(pdf|docx?|xlsx?|pptx?|txt|zip)$/i.test(f.name)).length,
  };

  const handleFileChange = (e) => {
    setErrorMsg("");
    if (!user) {
      router.push("/login?redirect=/upload");
      return;
    }

    const files = Array.from(e.target.files || []);
    const txt = files.find((f) => f.name.toLowerCase().endsWith(".txt"));
    const others = files.filter((f) => f !== txt);

    if (txt) {
      setSelectedFile(txt);
      setMediaFiles((prev) => [...prev, ...others]);
    } else if (others.length > 0) {
      // User selected only media files
      setMediaFiles((prev) => [...prev, ...others]);
    } else if (files.length > 0) {
      setErrorMsg("Please select a valid WhatsApp exported .txt file.");
    }
  };

  const handleAddMedia = (e) => {
    const additional = Array.from(e.target.files || []);
    if (additional.length > 0) {
      setMediaFiles((prev) => [...prev, ...additional]);
    }
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user) {
      router.push("/login?redirect=/upload");
      return;
    }

    if (!selectedFile) {
      setErrorMsg("Please select a .txt file first.");
      return;
    }

    if (isLimitReached) {
      setIsPaymentOpen(true);
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload file to server endpoint
      const token = typeof window !== "undefined" ? localStorage.getItem("chatrevive_token") : null;
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/chats/upload", {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.paymentRequired) {
          setIsPaymentOpen(true);
          throw new Error(data.message || "Free upload limit reached (5/5). Upgrade to continue.");
        }
        throw new Error(data.message || "Upload failed");
      }

      // Format file size
      const formatFileSize = (bytes) => {
        if (!bytes) return "1 MB";
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      // Link any selected media files
      const mediaEntries = mediaFiles.map((file) => ({
        fileName: file.name,
        kind: file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(file.name)
          ? "image"
          : file.type.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(file.name)
          ? "video"
          : file.type.startsWith("audio/") || /\.(mp3|aac|wav|ogg|m4a|opus)$/i.test(file.name)
          ? "audio"
          : "document",
        url: URL.createObjectURL(file),
        mimeType: file.type || "application/octet-stream",
        size: formatFileSize(file.size),
      }));

      // Smart fuzzy & exact matching
      const messagesWithMedia = (data.messages || []).map((msg) => {
        if (!msg.media) return msg;

        if (msg.media.fileName) {
          // 1. Exact match
          const exact = mediaEntries.find(
            (m) => m.fileName.toLowerCase() === msg.media.fileName.toLowerCase()
          );
          if (exact) {
            return {
              ...msg,
              media: {
                ...msg.media,
                url: exact.url,
                size: exact.size,
                kind: exact.kind,
              },
            };
          }

          // 2. Base match without extension
          const base = msg.media.fileName.replace(/\.[^/.]+$/, "").toLowerCase();
          const partial = mediaEntries.find((m) =>
            m.fileName.toLowerCase().includes(base)
          );
          if (partial) {
            return {
              ...msg,
              media: {
                ...msg.media,
                url: partial.url,
                size: partial.size,
                kind: partial.kind,
              },
            };
          }
        }

        // 3. Fallback match omitted media by kind
        const byKind = mediaEntries.find((m) => m.kind === msg.media.kind && !m.assigned);
        if (byKind) {
          byKind.assigned = true;
          return {
            ...msg,
            media: {
              ...msg.media,
              fileName: msg.media.fileName || byKind.fileName,
              url: byKind.url,
              size: byKind.size,
              kind: byKind.kind,
            },
          };
        }

        return msg;
      });

      const chatSession = {
        fileName: data.fileName || selectedFile.name,
        uploadedAt: new Date().toISOString(),
        messages: messagesWithMedia,
        mediaCount: mediaEntries.length,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("chatrevive_active_chat", JSON.stringify(chatSession));
      }

      await refreshUser();
      router.push("/chat");
    } catch (err) {
      setErrorMsg(err.message || "Upload could not be processed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemoChat = () => {
    if (!user) {
      router.push("/login?redirect=/upload");
      return;
    }

    const parsed = parseWhatsAppChat(SAMPLE_CHAT_TEXT, "Rahul");
    const merged = parsed.map((msg) => {
      if (msg.media && msg.media.fileName) {
        const found = SAMPLE_MEDIA.find((m) => m.fileName === msg.media.fileName);
        if (found) {
          return {
            ...msg,
            media: {
              ...msg.media,
              url: found.url,
              kind: found.kind,
              size: found.size,
            },
          };
        }
      }
      return msg;
    });

    const demoSession = {
      fileName: "WhatsApp_Chat_Demo.txt",
      uploadedAt: new Date().toISOString(),
      messages: merged,
      mediaCount: SAMPLE_MEDIA.length,
      isDemo: true,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("chatrevive_active_chat", JSON.stringify(demoSession));
    }
    router.push("/chat");
  };

  return (
    <div className="flex-1 bg-[#F0F2F5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#075E54]/10 text-[#075E54]">
            <span>📁</span>
            <span>Upload Workspace & Media Explorer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#111B21]">
            Import Your WhatsApp Chat & Media
          </h1>
          <p className="text-sm text-[#667781] max-w-lg mx-auto">
            Drop in your exported WhatsApp <code className="bg-white px-1.5 py-0.5 rounded text-[#075E54] font-semibold">.txt</code> file and any photos, videos, audio voice notes, and documents.
          </p>
        </div>

        {/* Login Required Notice for Unauthenticated Users */}
        {!user && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#25D366] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/20 text-[#075E54] text-xl font-bold">
                🔒
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#111B21]">Login Required to View Chats</h3>
                <p className="text-xs text-[#667781]">Sign in or create an account to view and explore WhatsApp chats in authentic format. (5 Free Uploads included!)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Link
                href="/login?redirect=/upload"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#075E54] hover:bg-[#054740] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register?redirect=/upload"
                className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Sign Up (5 Free)
              </Link>
            </div>
          </div>
        )}

        {/* 5-Free-Uploads Meter Card for Logged In Users */}
        {user && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E9EDEF] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base text-[#111B21]">
                    {isPro ? "Pro Plan: Unlimited Uploads" : "Free Tier Usage"}
                  </span>
                  {isPro && (
                    <span className="bg-[#25D366] text-[#054740] text-[10px] font-black px-2 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#667781] mt-0.5">
                  {isPro
                    ? "Enjoy unlimited chat and media imports with lifetime archive"
                    : `${trialUsed} of ${trialLimit} free trial uploads used`}
                </p>
              </div>

              {!isPro && (
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] font-bold text-xs rounded-xl shadow-sm transition-transform hover:scale-105 cursor-pointer"
                >
                  ⚡ Upgrade to Pro (₹499)
                </button>
              )}
            </div>

            {!isPro && (
              <div className="space-y-1.5">
                <div className="w-full bg-[#E9EDEF] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLimitReached ? "bg-red-500" : "bg-[#00A884]"
                    }`}
                    style={{ width: `${Math.min(100, (trialUsed / trialLimit) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#8696A0]">
                  <span>{trialUsed} used</span>
                  <span className="font-semibold text-[#075E54]">
                    {Math.max(0, trialLimit - trialUsed)} remaining free
                  </span>
                </div>
              </div>
            )}

            {isLimitReached && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">⚠️</span>
                  <span>
                    You have reached the <strong>5 free uploads</strong> limit. Upgrade to Pro with Razorpay (₹499) to unlock unlimited uploads.
                  </span>
                </div>
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-4 py-2 bg-[#075E54] hover:bg-[#054740] text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Pay ₹499
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dropzone Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E9EDEF] space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Dropzone */}
          <div
            onClick={() => {
              if (!user) {
                router.push("/login?redirect=/upload");
                return;
              }
              fileInputRef.current?.click();
            }}
            className="border-2 border-dashed border-[#00A884]/40 hover:border-[#00A884] bg-[#F8FAFC] hover:bg-[#F0F2F5] rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-14 h-14 rounded-full bg-[#E7FFDB] text-[#075E54] flex items-center justify-center text-2xl mx-auto group-hover:scale-110 transition-transform shadow-sm">
              📄
            </div>
            <div>
              <div className="font-bold text-base text-[#111B21]">
                {selectedFile ? selectedFile.name : "Click to select WhatsApp chat export (.txt + media)"}
              </div>
              <p className="text-xs text-[#667781] mt-1">
                Select your exported <code className="text-[#075E54] font-semibold">.txt</code> file and any accompanying photos, videos, voice notes, or documents.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,text/plain,image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            ref={mediaInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xlsx"
            onChange={handleAddMedia}
            className="hidden"
          />

          {/* Attached Media Staging Shelf */}
          {(selectedFile || mediaFiles.length > 0) && (
            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E9EDEF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111B21] flex items-center space-x-1.5">
                  <span>📎</span>
                  <span>Selected Files Staging Area</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[#075E54] border border-[#E9EDEF] rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    + Attach More Media
                  </button>
                  {mediaFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setMediaFiles([])}
                      className="px-2 py-1 text-xs text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Clear Media
                    </button>
                  )}
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedFile && (
                  <span className="px-3 py-1 bg-[#075E54] text-white rounded-lg font-semibold flex items-center space-x-1">
                    <span>📄</span>
                    <span>Chat: {selectedFile.name}</span>
                  </span>
                )}
                {mediaStats.images > 0 && (
                  <span className="px-3 py-1 bg-[#E7FFDB] text-[#075E54] rounded-lg font-bold border border-[#25D366]/40 flex items-center space-x-1">
                    <span>📷</span>
                    <span>{mediaStats.images} Photos</span>
                  </span>
                )}
                {mediaStats.videos > 0 && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-bold border border-purple-200 flex items-center space-x-1">
                    <span>🎥</span>
                    <span>{mediaStats.videos} Videos</span>
                  </span>
                )}
                {mediaStats.audio > 0 && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-200 flex items-center space-x-1">
                    <span>🎙️</span>
                    <span>{mediaStats.audio} Voice Notes</span>
                  </span>
                )}
                {mediaStats.documents > 0 && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold border border-amber-200 flex items-center space-x-1">
                    <span>📑</span>
                    <span>{mediaStats.documents} Documents</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={handleLoadDemoChat}
              className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-[#075E54] hover:bg-[#F0F2F5] border border-[#E9EDEF] rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>⚡</span>
              <span>Try Demo WhatsApp Chat (With Photos, Video & Voice)</span>
            </button>

            <button
              onClick={handleUpload}
              disabled={isUploading || (!selectedFile && user)}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{isUploading ? "Parsing Chat & Media..." : !user ? "Log In to View Chat →" : "Parse & Open WhatsApp View →"}</span>
            </button>
          </div>
        </div>

        {/* Export Instructions Tip */}
        <div className="bg-white rounded-2xl p-6 border border-[#E9EDEF] space-y-3 text-xs text-[#667781]">
          <div className="font-bold text-sm text-[#111B21] flex items-center space-x-2">
            <span>💡</span>
            <span>How to export WhatsApp chat with media</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#667781]">
            <li>Open the WhatsApp chat you want to export on your phone.</li>
            <li>Tap the three dots menu (Android) or the contact name at top (iPhone).</li>
            <li>Select <strong>More → Export chat</strong>.</li>
            <li>Choose <strong>Attach Media</strong> to include photos, videos, and voice messages.</li>
            <li>Select the exported <code className="text-[#075E54] font-semibold">.txt</code> and all photos/media files here!</li>
          </ol>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={(updatedUser) => {
          if (updatedUser) updateUser(updatedUser);
        }}
      />
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <div className="w-10 h-10 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
