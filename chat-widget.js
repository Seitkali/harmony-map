// chat-widget.js — чат с ИИ-агентом в реальном времени (потоковый вывод)

let HM_chatHistory = [];
let HM_chatOpened = false;

function HM_scrollChatToBottom() {
  const body = document.getElementById("chatBody");
  body.scrollTop = body.scrollHeight;
}

function HM_addMessage(role, text) {
  const body = document.getElementById("chatBody");
  const div = document.createElement("div");
  div.className = "chat-msg " + role;
  div.textContent = text;
  body.appendChild(div);
  HM_scrollChatToBottom();
  return div;
}

window.HM_openChat = function () {
  document.getElementById("chatPanel").classList.add("is-open");
  if (!HM_chatOpened) {
    HM_chatOpened = true;
    const L = I18N[state.lang];
    HM_addMessage("assistant", L.chat.greeting);
  }
  document.getElementById("chatInput").focus();
};

document.getElementById("chatToggle").addEventListener("click", () => {
  const panel = document.getElementById("chatPanel");
  if (panel.classList.contains("is-open")) {
    panel.classList.remove("is-open");
  } else {
    window.HM_openChat();
  }
});
document.getElementById("chatCloseBtn").addEventListener("click", () => {
  document.getElementById("chatPanel").classList.remove("is-open");
});

async function HM_sendChat() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  HM_addMessage("user", text);
  HM_chatHistory.push({ role: "user", content: text });

  const sendBtn = document.getElementById("chatSendBtn");
  sendBtn.disabled = true;
  input.disabled = true;

  const assistantDiv = HM_addMessage("assistant", "…");
  let fullText = "";

  try {
    const resp = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lang: state.lang,
        name: state.name,
        resultsContext: (window.HM_chatContext && window.HM_chatContext.resultsContext) || "",
        hasPhysiognomy: (window.HM_chatContext && window.HM_chatContext.hasPhysiognomy) || false,
        history: HM_chatHistory,
      }),
    });

    if (!resp.ok || !resp.body) {
      const errJson = await resp.json().catch(() => ({}));
      throw new Error(errJson.error || "network error");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    assistantDiv.textContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      assistantDiv.textContent = fullText;
      HM_scrollChatToBottom();
    }

    HM_chatHistory.push({ role: "assistant", content: fullText });
  } catch (err) {
    assistantDiv.textContent = (I18N[state.lang].errors && I18N[state.lang].errors.generic) || "Error";
  } finally {
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

document.getElementById("chatSendBtn").addEventListener("click", HM_sendChat);
document.getElementById("chatInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    HM_sendChat();
  }
});
