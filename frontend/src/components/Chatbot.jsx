import { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { ChatIcon } from './Shell.jsx';

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/chatbot/history').then(({ data }) => {
      if (data.messages.length === 0) {
        setMessages([{ role: 'assistant', content: "Hi! I'm the Dayflow Assistant. Ask me about your attendance, leave balance, or how to use the app." }]);
      } else {
        setMessages(data.messages);
      }
    }).catch(() => {
      setMessages([{ role: 'assistant', content: "Hi! I'm the Dayflow Assistant. Ask me about your attendance, leave balance, or how to use the app." }]);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setError('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setSending(true);
    try {
      const { data } = await api.post('/chatbot/message', { message: text });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.error || 'The assistant is unavailable right now.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-[22rem] max-w-[90vw] h-[30rem] card flex flex-col z-40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-ink text-mist">
        <div className="flex items-center gap-2">
          <ChatIcon className="h-4.5 w-4.5 text-amber" />
          <span className="font-display font-semibold text-sm">Dayflow Assistant</span>
        </div>
        <button onClick={onClose} aria-label="Close assistant" className="text-mist/60 hover:text-mist">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`text-sm px-3.5 py-2.5 rounded-xl max-w-[85%] ${
            m.role === 'user' ? 'bg-teal/10 text-ink ml-auto rounded-tr-sm' : 'bg-mist text-ink rounded-tl-sm'
          }`}>
            {m.content}
          </div>
        ))}
        {sending && <div className="text-sm px-3.5 py-2.5 rounded-xl bg-mist text-slate-muted max-w-[60%] rounded-tl-sm">Thinking…</div>}
        {error && <div className="text-xs text-coral px-1">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-slate-faint/20">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about leave, attendance…"
          className="input-field !py-2.5 text-sm"
        />
        <button type="submit" disabled={sending} className="btn-primary !py-2.5 !px-4 text-sm shrink-0">Send</button>
      </form>
    </div>
  );
}
