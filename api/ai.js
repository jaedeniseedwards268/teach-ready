// api/ai.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
  const { prompt, message, mode } = req.body || {};
const finalPrompt = prompt || message;

if (!finalPrompt) {
  return res.status(400).json({ error: "Missing prompt" });
}

const modeInstructions = {
  lesson: "Return exactly these labeled sections: Objective:, Student Task:, Assessment:, UDL:.",
  multiday: "Return exactly these labeled sections: Overview:, Day 1:, Day 2:, Day 3:, Assessment:, UDL:.",
  materials: "Return exactly these labeled sections: Materials List:, Preparation Steps:, Teacher Notes:.",
  rubric: "Return exactly these labeled sections: Criteria:, Proficient:, Developing:, Beginning:.",
  worksheet: "Return exactly these labeled sections: Title:, Directions:, Questions:, Extension:."
};

const systemInstruction = `
You are an expert K-12 computer science curriculum designer.
Write practical, classroom-ready content aligned to the user's request.
${modeInstructions[mode] || modeInstructions.lesson}
Keep the tone teacher-friendly and specific.
`;

const payload = {
  model: "gpt-4o-mini",
  input: [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: systemInstruction
        }
      ]
    },
    {
      role: "user",
      content: [
        { type: "input_text", text: finalPrompt }
      ]
    }
  ],
  max_output_tokens: 1000
};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const payload = {
  model: "gpt-4o-mini",

  input: [

    {
      role: "system",
      content: [
        {
          type: "input_text",
          text:
            "You are an expert K-12 computer science curriculum designer. Always respond using clearly labeled sections exactly as follows: Objective:, Student Task:, Assessment:, and UDL:. Keep responses practical and classroom-ready."
        }
      ]
    },

    {
      role: "user",
      content: [
        { type: "input_text", text: finalPrompt }
      ]
    }

  ],

  max_output_tokens: 800
};


    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("OpenAI error:", r.status, errText);
      return res.status(502).json({ error: "AI provider error", details: errText });
    }

    const data = await r.json();
    console.log("RAW OPENAI RESPONSE:", JSON.stringify(data, null, 2));


    // Robust extraction for all Responses API formats
     const text = data.output
      ?.flatMap(o => o.content)
      ?.filter(c => c.type === "output_text")
      ?.map(c => c.text)
      ?.join("\n")
      ?.trim() || "";

return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
