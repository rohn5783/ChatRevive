"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import WhatsAppChatViewer from "@/components/WhatsAppChatViewer";
import { SAMPLE_CHAT_TEXT, SAMPLE_MEDIA } from "@/lib/sampleChat";
import { parseWhatsAppChat } from "@/lib/whatsAppParser";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get("demo") === "true";
  const { user, isLoading: authLoading } = useAuth();

  const [chatData, setChatData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/chat");
      return;
    }

    // Check localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chatrevive_active_chat");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.messages) && parsed.messages.length > 0) {
            setChatData(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // ignore error
        }
      }

      // If demo param or no active session, load demo chat
      if (isDemoParam || !stored) {
        const parsed = parseWhatsAppChat(SAMPLE_CHAT_TEXT, "Rahul");
        const merged = parsed.map((msg) => {
          if (msg.media && msg.media.fileName) {
            const found = SAMPLE_MEDIA.find((m) => m.fileName === msg.media.fileName);
            if (found) {
              return { ...msg, media: { ...msg.media, url: found.url } };
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
        setChatData(demoSession);
        localStorage.setItem("chatrevive_active_chat", JSON.stringify(demoSession));
      }
    }
    setLoading(false);
  }, [user, authLoading, isDemoParam, router]);

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatrevive_active_chat");
    }
    router.push("/upload");
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#075E54]">Loading WhatsApp Chat Viewer...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F0F2F5]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-[#E9EDEF] p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#075E54]/10 text-[#075E54] flex items-center justify-center font-bold text-2xl mx-auto">
            🔒
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#111B21]">Login Required to View Chats</h2>
            <p className="text-xs text-[#667781]">
              Please sign in to view your WhatsApp chat exports with authentic bubbles and media previews.
            </p>
          </div>
          <div className="space-y-2">
            <Link
              href="/login?redirect=/chat"
              className="block w-full py-3 bg-[#075E54] hover:bg-[#054740] text-white font-bold text-sm rounded-xl transition-all"
            >
              Log In
            </Link>
            <Link
              href="/register?redirect=/chat"
              className="block w-full py-3 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] font-bold text-sm rounded-xl transition-all"
            >
              Sign Up (5 Free Uploads)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#EFEAE2] wa-chat-bg py-6 px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between px-2 text-xs text-[#54656F]">
          <div className="flex items-center space-x-2">
            <Link href="/upload" className="hover:text-[#075E54] font-semibold flex items-center space-x-1">
              <span>←</span>
              <span>Back to Upload</span>
            </Link>
            <span>•</span>
            <span>Viewing: <strong className="text-[#111B21]">{chatData?.fileName || "Active Chat"}</strong></span>
            {chatData?.isDemo && (
              <span className="bg-[#25D366]/20 text-[#075E54] font-bold px-2 py-0.5 rounded-full text-[10px]">
                DEMO PREVIEW
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/upload"
              className="px-3 py-1 bg-white hover:bg-gray-100 text-[#075E54] border border-[#E9EDEF] rounded-lg font-semibold shadow-sm transition-colors"
            >
              + Upload Another Chat
            </Link>
          </div>
        </div>

        {/* WhatsApp Web Viewer */}
        <WhatsAppChatViewer chatData={chatData} onClear={handleClear} />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
