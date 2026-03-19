"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  X,
  ChevronDown,
  Sparkles,
  Clock,
  Moon,
  Brain,
  Send,
  Bot
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MAX_INPUT_LENGTH = 2000;

/**
 * Minimal but safe Markdown renderer — supports bold, italic, lists, and line breaks.
 * Uses no external dependency. Output is rendered as HTML safely (only known patterns).
 */
function renderMarkdown(text: string): string {
  return (
    text
      // Escape HTML to prevent XSS from AI output
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers ## -> bold block
      .replace(/^## (.+)$/gm, '<strong class="block mt-2 mb-1 text-sm">$1</strong>')
      .replace(/^### (.+)$/gm, '<strong class="block mt-1 text-xs opacity-80">$1</strong>')
      // Bold **text**
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic *text*
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Unordered list items (- item)
      .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc">$1</li>')
      // Wrap consecutive <li> items in <ul>
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-1 space-y-0.5">${match}</ul>`)
      // Line breaks
      .replace(/\n/g, "<br/>")
  );
}

export default function FloatAIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Only show for verified, logged-in users
  if (!user || !user.emailVerified) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    const newUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };
    const assistantMsgId = `assistant-${Date.now()}`;

    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    // Add empty assistant message shell to show typing dots
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "assistant", content: "" },
    ]);

    try {
      // Get Firebase ID token for server-side auth verification
      const idToken = await user.getIdToken();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, newUserMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      // Read plain text stream from toTextStreamResponse()
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: fullContent } : m
          )
        );
      }

      // If response was ok but content is empty, show a fallback
      if (!fullContent.trim()) {
        fullContent = "Réponse vide reçue. Réessaie ta question.";
      }

      // Ensure final content is set
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: fullContent } : m
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
              ...m,
              content: `Une erreur est survenue : ${msg}\n\nVérifie ta connexion et réessaie.`,
            }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillSuggest = (text: string) => {
    setInput(text);
  };

  const charsLeft = MAX_INPUT_LENGTH - input.length;
  const isNearLimit = charsLeft < 200;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 active:scale-95 bottom-24 right-4 md:bottom-8 md:right-8
          ${isOpen
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          }`}
        aria-label={isOpen ? "Fermer le chat IA" : "Ouvrir le coach IA"}
        title={isOpen ? "Fermer" : "Coach IA StudyTrack"}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        // Overlay for click-outside-to-close on mobile
        <div
          className="fixed inset-0 z-[60] md:inset-auto md:bottom-28 md:right-8 md:w-96"
          onClick={(e) => {
            // Close if clicking the overlay itself (not the chat panel)
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="absolute bottom-0 right-0 left-0 md:static bg-white dark:bg-gray-800 rounded-t-[2rem] md:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[520px] max-h-[75vh] md:max-h-[65vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white flex items-center gap-3 shrink-0">
              <Bot className="text-white" size={24} />
              <div className="flex-1">
                <h3 className="font-bold leading-tight">Coach StudyTrack</h3>
                <p className="text-xs text-indigo-100">Assistant IA • En ligne</p>
              </div>
              {/* Clear conversation */}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-white/70 hover:text-white transition text-xs px-2 py-1 rounded-lg hover:bg-white/10"
                  title="Effacer la conversation"
                >
                  Effacer
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition ml-1"
                aria-label="Fermer"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-6 space-y-3">
                  <div className="text-5xl mb-3 flex justify-center"><Sparkles className="text-yellow-400" size={48} /></div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Bonjour {user.displayName?.split(" ")[0] || "là"} !
                  </p>
                  <p className="text-sm">Je suis ton coach d&apos;étude IA. Pose-moi une question !</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => fillSuggest("Comment utiliser la technique Pomodoro ?")}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl text-sm text-left hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                    >
                      <Clock size={16} className="inline mr-2" /> Comment utiliser Pomodoro ?
                    </button>
                    <button
                      onClick={() => fillSuggest("Je n'arrive pas à me motiver pour réviser. Aide-moi.")}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl text-sm text-left hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                    >
                      <Moon size={16} className="inline mr-2" /> Je manque de motivation...
                    </button>
                    <button
                      onClick={() => fillSuggest("Comment mieux mémoriser mon cours ?")}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl text-sm text-left hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                    >
                      <Brain size={16} className="inline mr-2" /> Comment mieux mémoriser ?
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs mr-2 mt-1 shrink-0">
                        <Bot size={12} />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user"
                        ? "bg-indigo-500 text-white rounded-br-sm"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                        }`}
                    >
                      {m.content === "" && m.role === "assistant" ? (
                        <div className="flex items-center gap-1 py-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      ) : m.role === "assistant" ? (
                        // Render markdown for assistant messages
                        <div
                          className="prose prose-sm max-w-none dark:prose-invert [&_ul]:my-1 [&_li]:my-0.5"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                        />
                      ) : (
                        // Plain text for user messages
                        m.content
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 pb-safe bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                  placeholder="Pose ta question..."
                  disabled={isLoading}
                  maxLength={MAX_INPUT_LENGTH}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-full disabled:opacity-40 transition shrink-0"
                  aria-label="Envoyer"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="flex justify-between items-center mt-1 px-1">
                <p className="text-[10px] text-gray-400">
                  L&apos;IA peut faire des erreurs. Vérifie les infos importantes.
                </p>
                {isNearLimit && (
                  <span className={`text-[10px] font-mono ${charsLeft < 50 ? "text-red-500" : "text-amber-500"}`}>
                    {charsLeft}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
