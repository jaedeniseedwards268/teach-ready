import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function handleAI(req, res) {
  try {
    let body = '';

    for await (const chunk of req) {
      body += chunk;
    }

    const parsed = body ? JSON.parse(body) : {};
    const { prompt, message, mode } = parsed;
    const finalPrompt = prompt || message;

    if (!finalPrompt) {
      return sendJson(res, 400, { error: 'Missing prompt' });
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) {
      return sendJson(res, 500, { error: 'Missing OPENAI_API_KEY' });
    }

    const modeInstructions = {
      lesson:
        'Return exactly these labeled sections when a full lesson is requested: Objective:, Student Task:, Assessment:, UDL:, Differentiation:, Materials:, Vocabulary:, Procedures:, Reflection:. For partial requests, return only what the user asked for in a clean teacher-friendly format.',
      multiday:
        'Return exactly these labeled sections: Overview:, Day 1:, Day 2:, Day 3:, Assessment:, UDL:.',
      materials:
        'Return exactly these labeled sections: Materials List:, Preparation Steps:, Teacher Notes:.',
      rubric:
        'Return exactly these labeled sections: Criteria:, Proficient:, Developing:, Beginning:.',
      worksheet:
        'Return exactly these labeled sections: Title:, Directions:, Questions:, Extension:.'
    };

    const systemInstruction = `
You are an expert K-12 computer science curriculum designer.
Write practical, classroom-ready content aligned to the user's request.
${modeInstructions[mode] || modeInstructions.lesson}
Prioritize strong UDL, accessibility, and inclusive design.
Keep the language teacher-friendly, specific, and easy to scan.
Do not add extra labels beyond the requested structure unless the user explicitly asks.
If the request asks for multiple variations, clearly divide them with headings and separator lines.
`.trim();

    const payload = {
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemInstruction }]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: finalPrompt }]
        }
      ],
      max_output_tokens: 1400
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', response.status, errText);
      return sendJson(res, 502, {
        error: 'AI provider error',
        details: errText
      });
    }

    const data = await response.json();

    const text =
      data.output
        ?.flatMap((item) => item.content || [])
        ?.filter((part) => part.type === 'output_text')
        ?.map((part) => part.text)
        ?.join('\n')
        ?.trim() || '';

    return sendJson(res, 200, { reply: text || '[No response]' });
  } catch (error) {
    console.error('Handler error:', error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.txt': 'text/plain'
  };

  return types[ext] || 'application/octet-stream';
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/ai' && req.method === 'POST') {
    return handleAI(req, res);
  }

  let reqPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, reqPath);

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});