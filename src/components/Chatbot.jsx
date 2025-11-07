import { useState, useRef } from "react";
import "./Chatbot.css";

const API_BASE = "http://localhost:8000";
const TYPE_SPEED = 25;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(null);

  const usernameRef = useRef(null);
  const inputRef = useRef(null);
  const chatboxRef = useRef(null);

  // ---------- helpers ----------
  const scrollToBottom = () => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  };

  const escapeHTML = (s) =>
    s.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );

  const addUserLine = (text) => {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<div class="user">User: ${escapeHTML(text)}</div>`;
    div.style.color = "#00ffa1";
    chatboxRef.current.appendChild(div);
    scrollToBottom();
  };

  const addBotLoadingBubble = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "msg";
    const bot = document.createElement("div");
    bot.className = "bot";
    bot.innerHTML = `<b>Bot:</b> <span class="loading"><span>.</span><span>.</span><span>.</span></span>`;
    wrapper.appendChild(bot);
    chatboxRef.current.appendChild(wrapper);
    scrollToBottom();
    return { wrapper, bot };
  };

  const convertToTyping = (botEl) => {
    botEl.innerHTML = `<b>Bot:</b> <span class="typing"></span><span class="cursor">|</span>`;
    return {
      typingSpan: botEl.querySelector(".typing"),
      cursor: botEl.querySelector(".cursor"),
    };
  };

  const stopCursor = (cursorEl) => {
    if (cursorEl && cursorEl.parentNode) cursorEl.remove();
  };

  const appendSources = (wrapper, sources) => {
    if (!sources || !sources.length) return;
    const src = document.createElement("div");
    src.className = "source";
    src.textContent = `Sources: ${sources
      .map((s, i) => `[${i + 1}] ${s.title}`)
      .join(", ")}`;
    wrapper.appendChild(src);
  };

  // ---------- token ----------
  const getToken = async () => {
    const user = usernameRef.current.value.trim();
    if (!user) return;
    const res = await fetch(
      `${API_BASE}/token?user=${encodeURIComponent(user)}&role=user`,
      { method: "POST" }
    );
    const data = await res.json();
    setToken(data.access_token);
  };

  // ---------- send + stream ----------
  const handleSend = async () => {
    const msg = inputRef.current.value.trim();
    if (!msg || !token) return;

    // ✅ Date today
    // ✅ Today's date
    if (
      msg.toLowerCase() === "date today" ||
      msg.toLowerCase() === "today's date" ||
      msg.toLowerCase() === "what is the date"
    ) {
      addUserLine(msg);
      addLine(`📅 Today's date is: ${new Date().toLocaleDateString()}`, "bot");
      inputRef.current.value = "";
      return;
    }

    // ✅ Current time
    if (
      msg.toLowerCase() === "time now" ||
      msg.toLowerCase() === "current time" ||
      msg.toLowerCase() === "what time is it"
    ) {
      addUserLine(msg);
      addLine(`⏰ Current time is: ${new Date().toLocaleTimeString()}`, "bot");
      inputRef.current.value = "";
      return;
    }

    // ✅ Day of the week
    if (
      msg.toLowerCase() === "day today" ||
      msg.toLowerCase() === "today" ||
      msg.toLowerCase() === "which day is today"
    ) {
      addUserLine(msg);
      addLine(
        `📖 Today is: ${new Date().toLocaleDateString(undefined, {
          weekday: "long",
        })}`,
        "bot"
      );
      inputRef.current.value = "";
      return;
    }

    // ✅ Help
    if (msg.toLowerCase() === "help" || msg.toLowerCase() === "commands") {
      addUserLine(msg);
      addLine(
        "📌 Available commands:\n- date today\n- time now\n- day today\n- hi/hello\n- help",
        "bot"
      );
      inputRef.current.value = "";
      return;
    }

    // ✅ Random joke
    if (msg.toLowerCase() === "joke") {
      const jokes = [
        "😂 Why don’t skeletons fight each other? Because they don’t have the guts!",
        "🤣 Why did the scarecrow win an award? Because he was outstanding in his field!",
        "😅 Parallel lines have so much in common. It’s a shame they’ll never meet.",
      ];
      addUserLine(msg);
      addLine(jokes[Math.floor(Math.random() * jokes.length)], "bot");
      inputRef.current.value = "";
      return;
    }

    // Normal flow → API call
    addUserLine(msg);
    inputRef.current.value = "";

    const { wrapper, bot } = addBotLoadingBubble();

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream, text/plain, application/json",
        },
        body: JSON.stringify({
          message: msg,
          top_k: 4,
          use_faq_first: true,
          stream: true,
        }),
      });

      let { typingSpan, cursor } = convertToTyping(bot);

      if (
        res.ok &&
        res.body &&
        res.headers.get("content-type")?.includes("text/event-stream")
      ) {
        await streamSSE(res, typingSpan, cursor, wrapper);
      } else if (
        res.ok &&
        res.body &&
        !res.headers.get("content-type")?.includes("application/json")
      ) {
        await streamPlain(res, typingSpan, cursor);
      } else {
        const data = await res.json();
        await typeOut(typingSpan, String(data.reply ?? ""), TYPE_SPEED);
        stopCursor(cursor);
        appendSources(wrapper, data.sources || []);
      }
    } catch (err) {
      wrapper.remove();
    }
  };

  const addLine = (text, who = "bot") => {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<div class="${who}">${escapeHTML(text)}</div>`;
    chatboxRef.current.appendChild(div);
    scrollToBottom();
  };

  // ---------- streaming ----------
  async function streamPlain(res, typingSpan, cursor) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done, value;
    while (true) {
      ({ done, value } = await reader.read());
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      typingSpan.textContent += chunk;
      scrollToBottom();
    }
    stopCursor(cursor);
  }

  async function streamSSE(res, typingSpan, cursor, wrapper) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let done, value;

    while (true) {
      ({ done, value } = await reader.read());
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);

        const dataLines = rawEvent
          .split("\n")
          .filter((l) => l.startsWith("data:"));
        for (const line of dataLines) {
          const payload = line.replace(/^data:\s?/, "");
          if (payload === "[DONE]") {
            stopCursor(cursor);
            return;
          }
          let obj;
          try {
            obj = JSON.parse(payload);
          } catch {}
          const delta = obj?.delta ?? obj?.text ?? obj?.content ?? payload;
          if (obj?.sources && !wrapper.querySelector(".source")) {
            appendSources(wrapper, obj.sources);
          }
          typingSpan.textContent += delta;
          scrollToBottom();
        }
      }
    }
    stopCursor(cursor);
  }

  function typeOut(targetSpan, fullText, speedMs) {
    return new Promise((resolve) => {
      let i = 0;
      (function tick() {
        if (i < fullText.length) {
          targetSpan.textContent += fullText.charAt(i++);
          scrollToBottom();
          setTimeout(tick, speedMs);
        } else {
          resolve();
        }
      })();
    });
  }

  return (
    <>
      {/* Floating Button */}
      <button className="chatToggle" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>

      {isOpen && (
        <div className={`chatWindow ${isOpen ? "open" : ""}`}>
          <div className="chatHeader">
            💬 Organization Assistant
            <button className="closeBtn" onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>

          <div className="controls">
            {!token && (
              <>
                <input ref={usernameRef} placeholder="Your name" />
                <button onClick={getToken}>Get Token</button>
              </>
            )}
          </div>

          <div id="chatbox" ref={chatboxRef}></div>

          <div className="input">
            <input
              ref={inputRef}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
