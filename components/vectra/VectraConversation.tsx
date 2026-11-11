"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, ChevronDown, Ellipsis } from "lucide-react";
import Link from "next/link";
import type { ModelPreference } from "@/lib/vectra/models";
import { chatCapsEnabled, conversationTurnLimit, messageLimit, type AnswerStyle, type Turn } from "@/lib/vectra/types";
import { VectraEnquiry } from "./VectraEnquiry";
import { VeraCube } from "./VeraCube";
import { VeraStarters } from "./VeraIntroduction";

type Pending = { id: string; message: string; preference: ModelPreference; answerStyle: AnswerStyle; suggestQuestions: boolean };

class ChatError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); }
}

async function chat(method: "GET" | "POST" | "DELETE", pending?: Pending) {
  const response = await fetch("/api/vectra", {
    method, cache: "no-store", signal: AbortSignal.timeout(48_000),
    ...(pending && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(pending) }),
  });
  const data = await response.json() as { turns?: Turn[]; message?: string; code?: string };
  if (!response.ok || !Array.isArray(data.turns)) throw new ChatError(data.message || "Unable to connect to Vera. Please try again.", response.status, data.code);
  return data.turns;
}

export default function VectraConversation({ open, dismiss, preference, answerStyle, suggestQuestions, onThreadChange }: {
  open: boolean;
  dismiss: () => void;
  preference: ModelPreference;
  answerStyle: AnswerStyle;
  suggestQuestions: boolean;
  onThreadChange: (exists: boolean) => void;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<Pending>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"conversation" | "enquiry" | "about">("conversation");
  const [enquiryDraft, setEnquiryDraft] = useState<{ requirement: string }>();
  const [latest, setLatest] = useState(false);
  const [reset, setReset] = useState<"confirm" | "expired" | "limit">();
  const [dailyLimit, setDailyLimit] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const subviewTitle = useRef<HTMLHeadingElement>(null);
  const follow = useRef(true);
  const lastReply = useRef<string | undefined>(undefined);
  const resetAction = useRef<HTMLButtonElement>(null);
  const request = useRef(false);
  const enquiryTrigger = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    if (request.current) return;
    request.current = true;
    setBusy(true);
    setError("");
    try { setTurns(await chat("GET")); setReady(true); }
    catch { setError("Vera couldn't open a chat. Try again or contact the team."); }
    finally { request.current = false; setBusy(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { onThreadChange(!!turns.length || !!pending || !!message); }, [turns.length, pending, message, onThreadChange]);

  useLayoutEffect(() => {
    const transcript = scroll.current;
    const newest = turns.at(-1)?.id;
    if (open && view === "conversation" && transcript && follow.current) transcript.scrollTop = transcript.querySelector(".vera-introduction") ? 0 : transcript.scrollHeight;
    if (newest !== lastReply.current) {
      if (newest && !follow.current) setLatest(true);
      lastReply.current = newest;
    }
  }, [turns, pending, busy, open, view, error, suggestQuestions]);

  useEffect(() => {
    const transcript = scroll.current;
    if (!open || view !== "conversation" || !transcript) return;
    const observer = new ResizeObserver(() => {
      if (follow.current) transcript.scrollTop = transcript.querySelector(".vera-introduction") ? 0 : transcript.scrollHeight;
    });
    observer.observe(transcript);
    return () => observer.disconnect();
  }, [open, view]);

  useLayoutEffect(() => {
    const field = composer.current;
    if (!field || !open || view !== "conversation") return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 116)}px`;
  }, [message, open, view]);

  useEffect(() => {
    if (view !== "conversation") subviewTitle.current?.focus({ preventScroll: true });
  }, [view]);

  useEffect(() => {
    if (reset && open) resetAction.current?.focus({ preventScroll: true });
  }, [reset, open]);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  function showEnquiry(requirement = "") {
    closeMenu();
    setEnquiryDraft(draft => requirement ? { requirement: requirement.slice(0, 800) } : draft ?? { requirement: "" });
    setView("enquiry");
  }

  function returnToChat() {
    setView("conversation");
    requestAnimationFrame(() => (enquiryTrigger.current ?? menu.current?.querySelector("summary"))?.focus({ preventScroll: true }));
  }

  function goToLatest() {
    follow.current = true;
    setLatest(false);
    if (scroll.current) {
      scroll.current.scrollTop = scroll.current.scrollHeight;
      scroll.current.focus({ preventScroll: true });
    }
  }

  async function send(value: string, retry?: Pending) {
    const clean = value.trim();
    if (request.current || !ready || !clean || clean.length > messageLimit) return;
    const next = retry || { id: crypto.randomUUID(), message: clean, preference, answerStyle, suggestQuestions };
    follow.current = true;
    setLatest(false);
    request.current = true;
    setPending(next);
    setMessage("");
    setBusy(true);
    setError("");
    setDailyLimit(false);
    try { setTurns(await chat("POST", next)); setPending(undefined); }
    catch (reason) {
      if (reason instanceof ChatError && reason.status === 401) {
        setReset("expired");
        setError("Your guest chat expired. Start a new chat to resend your message.");
      } else if (reason instanceof ChatError) {
        setError(reason.message);
        if (reason.code === "conversation_limit") setReset("limit");
        if (reason.code === "daily_limit") setDailyLimit(true);
      }
      else if (reason instanceof Error && reason.name === "TimeoutError") setError("The reply took too long. Try again.");
      else setError("The connection was interrupted. Your message is still here.");
    }
    finally { request.current = false; setBusy(false); }
  }

  async function fresh() {
    if (request.current) return;
    request.current = true;
    setBusy(true);
    setError("");
    try {
      setTurns(await chat("DELETE"));
      setMessage(reset === "expired" || reset === "limit" ? pending?.message ?? message : "");
      setPending(undefined);
      setEnquiryDraft(undefined);
      setLatest(false);
      follow.current = true;
      setReset(undefined);
      setDailyLimit(false);
      setReady(true);
      if (window.matchMedia("(pointer: fine)").matches) requestAnimationFrame(() => composer.current?.focus({ preventScroll: true }));
    } catch { setError("Couldn't clear this conversation. Please try again."); }
    finally { request.current = false; setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!pending) void send(message);
  }

  return <>
    <div className="vectra-chat" data-composing={!!message || undefined} hidden={view !== "conversation"}>
    <div className="vectra-transcript" ref={scroll} tabIndex={-1} onScroll={event => {
      const transcript = event.currentTarget;
      if (!transcript.clientHeight) return;
      follow.current = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight < 48;
      if (follow.current) setLatest(false);
    }}>
      <div role="log" aria-label="Conversation">
        {!turns.length && !pending && <VeraStarters disabled={!ready || busy} onChoose={value => {
          if (window.matchMedia("(pointer: fine)").matches) composer.current?.focus({ preventScroll: true });
          void send(value);
        }} />}
        {turns.map(turn => <div className="vectra-turn" key={turn.id}>
          <p className="vectra-question">{turn.question}</p>
          <p className="vectra-answer">{turn.reply.text}</p>{turn.reply.fallback && <p className="vera-fallback">Answered with {turn.reply.model?.includes("luna") ? "GPT-6 Luna" : "GPT-5.4 mini"} while the selected model was busy.</p>}
          {turn.reply.sources.length > 0 && <details className="vectra-source-details">
            <summary>Sources <span>{turn.reply.sources.length}</span><ChevronDown size={13} aria-hidden="true" /></summary>
            <ul className="vectra-sources">{turn.reply.sources.map(source =>
              <li key={source.id}>{source.href.startsWith("https://")
                ? <a href={source.href} target="_blank" rel="noopener noreferrer">{source.title} <ArrowUpRight size={13} aria-hidden="true" /></a>
                : <Link href={source.href === "/" ? "/?enter=1" : source.href.startsWith("/#") ? source.href.replace("/#", "/?enter=1#") : source.href} onClick={dismiss}>{source.title} <ArrowUpRight size={13} aria-hidden="true" /></Link>}
              </li>)}</ul>
          </details>}
          {suggestQuestions && !pending && !busy && !reset && turn.id === turns.at(-1)?.id && !!turn.reply.suggestions?.length && (
            <nav className="vera-followups" aria-label="Suggested questions">
              {turn.reply.suggestions.slice(0, 2).map(question => (
                <button key={question} type="button" disabled={!!message.trim()} onClick={() => {
                  setMessage(question);
                  composer.current?.focus({ preventScroll: true });
                }}>
                  <span>{question}</span><ArrowUpRight size={13} aria-hidden="true" />
                </button>
              ))}
            </nav>
          )}
        </div>)}
        {pending && <p className="vectra-question">{pending.message}</p>}
      </div>
      {busy && <p className="vectra-status" role="status">
        {pending && <VeraCube active />}
        {pending ? "Connecting the ideas…" : ready ? "Please wait…" : "Opening Vera…"}
      </p>}
      {error && <p className="vectra-error" role="alert">{error}</p>}
      {!ready && !busy && <div className="vectra-actions"><button type="button" onClick={() => void load()}>Retry</button></div>}
      {pending && !busy && reset !== "expired" && reset !== "limit" && <div className="vectra-actions">
        {dailyLimit ? <Link href="/partner#inquiry" onClick={dismiss}>Contact Voltron <ArrowUpRight size={13} aria-hidden="true" /></Link>
          : <button type="button" onClick={() => void send(pending.message, pending)}>Retry message</button>}
        <button type="button" onClick={() => { setMessage(pending.message); setPending(undefined); setError(""); requestAnimationFrame(() => composer.current?.focus()); }}>Edit message</button>
      </div>}
      {turns.at(-1)?.reply.enquiry && !pending && <div>
        <button ref={enquiryTrigger} className="vectra-outline" type="button"
          onClick={() => showEnquiry(turns.at(-1)?.reply.enquirySummary)}>Prepare an enquiry</button>
      </div>}
    </div>
    <div className="vectra-bottom">
      {latest && <button className="vectra-latest" type="button" onClick={goToLatest}>Latest reply <ArrowDown size={14} /></button>}
      {reset === "expired" || reset === "limit" ? <div className="vectra-actions"><button ref={resetAction} type="button" disabled={busy} onClick={() => void fresh()}>Start new chat</button></div> :
        reset === "confirm" ? <div className="vectra-actions"><span>Clear this conversation?</span><button ref={resetAction} type="button" disabled={busy} onClick={() => void fresh()}>Clear</button><button type="button" onClick={() => setReset(undefined)}>Cancel</button></div> :
        null}
      <form className="vectra-composer" onSubmit={submit}>
        <details ref={menu} className="vectra-menu" onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
        }} onKeyDown={event => {
          if (event.key === "Escape" && event.currentTarget.open) {
            event.preventDefault();
            closeMenu();
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}>
          <summary className="vectra-icon" aria-label="Chat options" title="Chat options"><Ellipsis size={20} /></summary>
          <div className="vectra-menu-items">
            <button type="button" disabled={busy || (!turns.length && !pending)} onClick={() => { closeMenu(); setReset("confirm"); }}>New conversation</button>
            <button type="button" onClick={() => showEnquiry(turns.at(-1)?.reply.enquirySummary)}>Send an enquiry</button>
            <button type="button" onClick={() => { closeMenu(); setView("about"); }}>About this chat</button>
          </div>
        </details>
        <textarea ref={composer} aria-label="Message Vera" placeholder="Ask Vera…" rows={1} maxLength={messageLimit}
          value={message} onChange={event => setMessage(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing &&
                window.matchMedia("(pointer: fine)").matches && ready && !pending && !busy) {
              event.preventDefault();
              void send(message);
            }
          }} />
        <button className="vectra-send" type="submit" aria-label="Send message" disabled={!ready || busy || !!pending || !message.trim()}>
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
    </div>
    {view !== "conversation" && <div className="vectra-subview-header">
      <button type="button" className="vectra-back" onClick={returnToChat}><ArrowLeft size={16} /> Back to conversation</button>
      <h3 ref={subviewTitle} tabIndex={-1}>{view === "enquiry" ? "Send an enquiry" : "About this chat"}</h3>
    </div>}
    {enquiryDraft && <div className="vectra-subview" hidden={view !== "enquiry"}>
      <VectraEnquiry requirement={enquiryDraft.requirement} dismiss={() => {
        setView("conversation");
        dismiss();
      }} close={() => {
        setEnquiryDraft(undefined);
        returnToChat();
      }} />
    </div>}
    {view === "about" && <div className="vectra-subview vectra-about">
      <p>Vera can explain Voltron’s public material and help you find the right page or enquiry form. Replies are in English.</p>
      <p>A guest chat lasts up to 24 hours {chatCapsEnabled ? `and supports ${conversationTurnLimit} replies` : "with no reply-count cap currently"}. Use the enquiry form to share your contact details.</p>
      <Link href="/partner#inquiry" onClick={dismiss}>Partner with us <ArrowUpRight size={14} /></Link>
    </div>}
  </>;
}
