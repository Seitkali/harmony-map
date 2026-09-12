// server.js
// Локальный сервер приложения "Harmony Map".
// Раздаёт фронтенд (папка /public) и проксирует запросы к Claude API,
// чтобы ваш ANTHROPIC_API_KEY никогда не попадал в браузер.

require("dotenv").config();
const express = require("express");
const path = require("path");
const {
  buildAnalysisPrompt,
  buildPhysiognomyPrompt,
  buildChatSystemPrompt,
} = require("./prompts");

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL_MAIN = process.env.MODEL_MAIN || "claude-sonnet-5";
const MODEL_VISION = process.env.MODEL_VISION || "claude-sonnet-5";
const API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

app.use(express.json({ limit: "15mb" })); // фото в base64 может весить несколько мегабайт
app.use(express.static(path.join(__dirname, "public")));

function requireApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({
      error:
        "ANTHROPIC_API_KEY не задан. Скопируйте .env.example в .env и вставьте свой ключ с https://console.anthropic.com/settings/keys",
    });
    return false;
  }
  return true;
}

// ---------- 1) Анализ личности и профориентации ----------
app.post("/api/analyze", async (req, res) => {
  if (!requireApiKey(res)) return;
  try {
    const { lang, name, traitScores, careerScores, openAnswers } = req.body;
    const prompt = buildAnalysisPrompt({
      lang,
      name,
      traitScores,
      careerScores,
      openAnswers,
    });

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_MAIN,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res
        .status(502)
        .json({ error: "Ошибка запроса к Claude API", details: errText });
    }

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || "").join("\n");
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка сервера", details: String(err) });
  }
});

// ---------- 2) Физиогномика по фотографии (по желанию пользователя) ----------
app.post("/api/physiognomy", async (req, res) => {
  if (!requireApiKey(res)) return;
  try {
    const { lang, name, imageBase64, mediaType } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Фото не передано" });
    }
    const prompt = buildPhysiognomyPrompt({ lang, name });

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_VISION,
        max_tokens: 1600,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res
        .status(502)
        .json({ error: "Ошибка запроса к Claude API", details: errText });
    }

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || "").join("\n");
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Внутренняя ошибка сервера", details: String(err) });
  }
});

// ---------- 3) Чат с ИИ-агентом в реальном времени (потоковый ответ) ----------
app.post("/api/chat", async (req, res) => {
  if (!requireApiKey(res)) return;
  try {
    const { lang, name, resultsContext, hasPhysiognomy, history } = req.body;
    const systemPrompt = buildChatSystemPrompt({
      lang,
      name,
      resultsContext,
      hasPhysiognomy,
    });

    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_MAIN,
        max_tokens: 1024,
        system: systemPrompt,
        messages: history,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text();
      console.error("Anthropic API error:", errText);
      res.status(502);
      return res.end("Ошибка запроса к Claude API");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.slice(5).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const evt = JSON.parse(jsonStr);
          if (evt.type === "content_block_delta" && evt.delta && evt.delta.text) {
            res.write(evt.delta.text);
          }
        } catch (e) {
          // служебные строки, которые не парсятся как JSON — пропускаем
        }
      }
    }
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Внутренняя ошибка сервера", details: String(err) });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`✓ Harmony Map запущен: http://localhost:${PORT}`);
  if (!API_KEY) {
    console.warn("⚠️  ANTHROPIC_API_KEY не найден в .env — функции ИИ работать не будут.");
  }
});
