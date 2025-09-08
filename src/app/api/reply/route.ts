import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { email, tone = "丁寧", length = "中" } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'メール内容が必要です' },
        { status: 400 }
      );
    }

    const prompt = `
あなたは日本語のビジネスメールに精通したアシスタントです。以下のメールに対する自然で適切な返信文を作成してください。マークダウンは使わず、プレーンテキストで出力してください。

出力条件:
- 口調: ${tone}（敬語）
- 長さ: ${length}（短=2-3文, 中=4-6文, 長=7-10文）
- 件名案を先頭に一行で示す（「件名: ...」形式）
- 本文は冒頭の挨拶→要点への返信→必要な依頼/確認→結びの順
- 本文および署名において、氏名・会社名・部署名・メール・電話番号などの個人情報は推測・生成しない（空欄のまま）。
- 署名は「—」の罫線の下に項目名のみを表示し、コロン以降は空欄にする。

テンプレート:
件名: [件名案]
[本文]

—
署名テンプレート:
会社名:
部署名 / 氏名:
メール:
電話:

参考メール:
${email}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const reply = response.text;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error generating reply:', error);
    return NextResponse.json(
      { error: '返信文の生成に失敗しました' },
      { status: 500 }
    );
  }
}


