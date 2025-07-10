import { InferenceClient } from "@huggingface/inference";
import type { NextApiRequest, NextApiResponse } from "next";

const client = new InferenceClient(process.env.HF_TOKEN || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method Not Allowed" });
  }

  const userPrompt = req.body.prompt;

  if (!userPrompt || typeof userPrompt !== "string") {
    return res.status(400).json({ reply: "Prompt tidak valid." });
  }

  // 🎯 Predefined system prompt untuk asisten Katolik
  const systemPrompt = `
Kamu adalah seorang asisten virtual Katolik yang sangat paham tentang Alkitab (Perjanjian Lama dan Baru) serta Katekismus Gereja Katolik (KGK).

Tugasmu:
- Menjawab pertanyaan dengan sopan, jelas, dan sesuai ajaran iman Katolik.
- Sertakan kutipan ayat Alkitab atau referensi Katekismus jika relevan.
- Gunakan bahasa Indonesia yang mudah dimengerti, ramah, dan membangun iman.
- Jangan berdebat atau menanggapi hal yang bertentangan dengan iman Katolik.

Jika kamu tidak tahu jawabannya, katakan dengan rendah hati bahwa kamu tidak dapat menjawabnya.
`;

  try {
    const response = await client.chatCompletion({
      provider: "nebius",
      model: "deepseek-ai/DeepSeek-R1-0528",
      messages: [
        {
          role: "system",
          content: systemPrompt.trim(),
        },
        {
          role: "user",
          content: userPrompt.trim(),
        },
      ],
    });

    const message = response.choices?.[0]?.message?.content || "Tidak ada balasan dari model.";
    res.status(200).json({ reply: message });
  } catch (error) {
    console.error("❌ Hugging Face API Error:", error);
    res.status(500).json({ reply: "Gagal mengakses model. Silakan coba lagi nanti." });
  }
}
