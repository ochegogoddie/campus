"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

interface UserSummary {
  id: string;
  name: string;
  avatar: string | null;
}

interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  createdAt: string;
  read: boolean;
  sender: UserSummary;
}

interface Conversation {
  partnerId: string;
  partner: UserSummary;
  lastMessage: { content: string; createdAt: string; read: boolean };
  unread: number;
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPartnerId = searchParams.get("with") || searchParams.get("to");
  const initialPartnerName = searchParams.get("name");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(initialPartnerId);
  const [activePartner, setActivePartner] = useState<UserSummary | null>(
    initialPartnerId && initialPartnerName
      ? { id: initialPartnerId, name: initialPartnerName, avatar: null }
      : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } finally {
      setLoadingConvos(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations();
    }
  }, [status]);

  // Fetch thread when active partner changes
  useEffect(() => {
    if (!activePartnerId) return;

    const fetchThread = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/${activePartnerId}`);
        if (res.ok) {
          const data: Message[] = await res.json();
          setMessages(data);
          // Update URL without reload
          window.history.replaceState({}, "", `/messages?with=${activePartnerId}`);
          // Mark convos as read in the sidebar
          setConversations((prev) =>
            prev.map((c) => (c.partnerId === activePartnerId ? { ...c, unread: 0 } : c))
          );
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    // Find partner info from conversations
    const convo = conversations.find((c) => c.partnerId === activePartnerId);
    if (convo) setActivePartner(convo.partner);

    fetchThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePartnerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds when a conversation is open
  useEffect(() => {
    if (!activePartnerId || status !== "authenticated") return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages/${activePartnerId}`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activePartnerId, status]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartnerId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: activePartnerId, content: newMessage.trim() }),
      });

      if (res.ok) {
        const msg: Message = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
        // Refresh conversations sidebar
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6 overflow-hidden">
        {/* Sidebar — conversations */}
        <aside className="w-72 flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-slate-900 font-semibold text-lg">Messages</h2>
          </div>

          {loadingConvos ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-slate-600 text-sm">Loading...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-600 text-sm">No conversations yet.</p>
              <p className="text-slate-500 text-xs mt-1">
                Message someone from a gig or project page.
              </p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {conversations.map((convo) => (
                <li key={convo.partnerId}>
                  <button
                    onClick={() => {
                      setActivePartnerId(convo.partnerId);
                      setActivePartner(convo.partner);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors flex items-center gap-3 ${
                      activePartnerId === convo.partnerId ? "bg-amber-50" : ""
                    }`}
                  >
                    <Avatar
                      name={convo.partner.name}
                      src={convo.partner.avatar}
                      size={36}
                      className="rounded-full flex-shrink-0"
                      tone="amber"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {convo.partner.name}
                        </span>
                        {convo.unread > 0 && (
                          <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-1.5 py-0.5">
                            {convo.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">{convo.lastMessage.content}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Chat panel */}
        <main className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
          {!activePartnerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-slate-900 text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-slate-600 text-sm max-w-xs">
                Choose a conversation from the sidebar, or message someone directly from a gig or
                project.
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <Avatar
                  name={activePartner?.name || "User"}
                  src={activePartner?.avatar}
                  size={36}
                  className="rounded-full flex-shrink-0"
                  tone="amber"
                />
                <div>
                  <h3 className="text-slate-900 font-semibold">{activePartner?.name}</h3>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-slate-600 text-sm">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-slate-600 text-sm">
                      No messages yet. Say hello!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender.id === session?.user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        {!isOwn && (
                          <Avatar
                            name={msg.sender.name}
                            src={msg.sender.avatar}
                            size={28}
                            className="rounded-full flex-shrink-0 mr-2 mt-1"
                            tone="slate"
                          />
                        )}
                        <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm ${
                              isOwn
                                ? "bg-amber-600 text-white rounded-br-sm"
                                : "bg-slate-100 text-slate-900 rounded-bl-sm"
                            }`}
                          >
                            {msg.content}
                            {msg.fileUrl && (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-1 text-xs underline opacity-80"
                              >
                                📎 Attachment
                              </a>
                            )}
                          </div>
                          <span className="text-xs text-slate-600 mt-1 px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Typing Bar */}
              <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white">
                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                  <div className="flex-1 flex items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 hover:border-slate-300 focus-within:border-amber-500 focus-within:shadow-md transition-all">
                    <span className="text-slate-400 text-lg">💬</span>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-slate-900 placeholder-slate-500 text-sm focus:outline-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={sending || !newMessage.trim()}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-2xl font-medium"
                  >
                    {sending ? "…" : "Send"}
                  </Button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
          <span className="text-slate-600">Loading...</span>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
