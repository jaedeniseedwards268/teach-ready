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

    const _KEY = process.env._API_KEY;
    if (!_KEY) {
      return res.status(500).json({ error: "Missing _API_KEY" });
    }

    const modeInstructions = {
      lesson:
        "Return exactly these labeled sections when a full lesson is requested: Objective:, Student Task:, Assessment:, UDL:, Differentiation:, Materials:, Vocabulary:, Procedures:, Reflection:. For partial requests, return only what the user asked for in a clean teacher-friendly format.",
      multiday:
        "Return exactly these labeled sections: Overview:, Day 1:, Day 2:, Day 3:, Assessment:, UDL:.",
      materials:
        "Return exactly these labeled sections: Materials List:, Preparation Steps:, Teacher Notes:.",
      rubric:
        "Return exactly these labeled sections: Criteria:, Proficient:, Developing:, Beginning:.",
      worksheet:
        "Return exactly these labeled sections: Title:, Directions:, Questions:, Extension:."
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
            {
              type: "input_text",
              text: finalPrompt
            }
          ]
        }
      ],
      max_output_tokens: 1400
    };

    const response = await fetch("https://api..com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(" error:", response.status, errText);
      return res.status(502).json({
        error: "AI provider error",
        details: errText
      });
    }

    const data = await response.json();

    const text =
      data.output
        ?.flatMap((item) => item.content || [])
        ?.filter((part) => part.type === "output_text")
        ?.map((part) => part.text)
        ?.join("\n")
        ?.trim() || "";

    return res.status(200).json({ reply: text || "[No response]" });
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
