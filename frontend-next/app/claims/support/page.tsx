"use client";

import { useCallback, useEffect, useState } from "react";
import { apiUrl, authHeaders } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/format-date";

type ConvSummary = {
  id: string;
  subject: string;
  updatedAt: string;
  lastMessage: {
    preview: string;
    createdAt: string;
    fromRole: string;
  } | null;
};

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

export default function UserSupportPage() {
  const [list, setList] = useState<ConvSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const loadList = useCallback(async () => {
    if (!getApiBaseUrl()) {
      setListError("NEXT_PUBLIC_API_URL is not configured.");
      setList([]);
      return;
    }
    setListError(null);
    try {
      const res = await fetch(apiUrl("support/conversations"), {
        cache: "no-store",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not load conversations.");
      }
      setList(data.conversations ?? []);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Load failed.");
      setList([]);
    }
  }, []);

  const loadThread = useCallback(async (id: string) => {
    setThreadError(null);
    setMessages(null);
    try {
      const res = await fetch(
        apiUrl(`support/conversations/${id}/messages`),
        { cache: "no-store", headers: authHeaders() },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not load thread.");
      }
      setSubject(data.conversation.subject);
      setMessages(data.messages ?? []);
    } catch (e) {
      setThreadError(e instanceof Error ? e.message : "Load failed.");
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) void loadThread(selectedId);
  }, [selectedId, loadThread]);

  const onSend = async () => {
    const text = reply.trim();
    if (!selectedId || !text || sending) return;
    setSending(true);
    setThreadError(null);
    try {
      const res = await fetch(
        apiUrl(`support/conversations/${selectedId}/messages`),
        {
          method: "POST",
          headers: {
            ...authHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: text }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Send failed.");
      }
      const m = data.message as Msg;
      setMessages((prev) => (prev ? [...prev, m] : [m]));
      setReply("");
      void loadList();
    } catch (e) {
      setThreadError(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setSending(false);
    }
  };

  const onCreate = async () => {
    const sub = newSubject.trim();
    const msg = newMessage.trim();
    if (!sub || !msg || creating) return;
    setCreating(true);
    setListError(null);
    try {
      const res = await fetch(apiUrl("support/conversations"), {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject: sub, message: msg }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Could not start conversation.");
      }
      const conv = data.conversation as ConvSummary;
      setNewSubject("");
      setNewMessage("");
      setShowNew(false);
      await loadList();
      setSelectedId(conv.id);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Could not start.");
    } finally {
      setCreating(false);
    }
  };

  const loadingList = list === null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Contact admin
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Describe your issue and keep the conversation in one thread. An
          administrator will reply here.
        </p>
      </div>

      {showNew && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            New conversation
          </h2>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="new-subject" className="text-xs font-medium text-slate-700">
                Subject
              </label>
              <input
                id="new-subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="e.g. Question about my claim"
              />
            </div>
            <div>
              <label htmlFor="new-body" className="text-xs font-medium text-slate-700">
                Your message
              </label>
              <textarea
                id="new-body"
                rows={4}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Describe your issue…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onCreate()}
                disabled={creating || !newSubject.trim() || !newMessage.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {creating ? "Starting…" : "Start conversation"}
              </button>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-[420px] flex-col gap-4 rounded-xl border border-slate-200 bg-white shadow-sm lg:flex-row lg:gap-0">
        <div className="flex shrink-0 flex-col border-slate-200 lg:w-72 lg:border-r">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-800">Your threads</span>
            <button
              type="button"
              onClick={() => {
                setShowNew(true);
                setSelectedId(null);
              }}
              className="text-xs font-medium text-slate-900 underline"
            >
              New
            </button>
          </div>
          {listError && !showNew && (
            <p className="px-4 py-2 text-xs text-rose-700">{listError}</p>
          )}
          {loadingList && (
            <div className="h-32 animate-pulse bg-slate-100" aria-busy />
          )}
          {!loadingList && list && list.length === 0 && !listError && (
            <p className="p-4 text-sm text-slate-600">
              No conversations yet. Start one with the New button.
            </p>
          )}
          <ul className="max-h-[50vh] overflow-y-auto lg:max-h-[min(60vh,520px)]">
            {list?.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNew(false);
                    setSelectedId(c.id);
                  }}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                    selectedId === c.id ? "bg-slate-50" : ""
                  }`}
                >
                  <span className="block font-medium text-slate-900">
                    {c.subject}
                  </span>
                  {c.lastMessage && (
                    <span className="mt-1 block line-clamp-2 text-xs text-slate-600">
                      {c.lastMessage.preview}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-[320px] min-w-0 flex-1 flex-col">
          {!selectedId && !showNew && (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Select a thread or start a new conversation.
            </div>
          )}
          {selectedId && subject && (
            <>
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-semibold text-slate-900">{subject}</h2>
              </div>
              {threadError && (
                <p className="px-4 py-2 text-sm text-rose-700">{threadError}</p>
              )}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 lg:max-h-[min(50vh,480px)]">
                {messages?.map((m) => {
                  const mine = m.sender.role !== "admin";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[min(100%,420px)] rounded-2xl px-4 py-2 text-sm ${
                          mine
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            mine ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          {m.sender.role === "admin" ? "Admin · " : ""}
                          {formatDateTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-slate-200 p-4">
                <label className="sr-only" htmlFor="user-reply">
                  Message
                </label>
                <textarea
                  id="user-reply"
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a message…"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    disabled={sending || !reply.trim()}
                    onClick={() => void onSend()}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
