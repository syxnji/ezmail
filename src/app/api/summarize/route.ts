import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'メール内容が必要です' },
        { status: 400 }
      );
    }

    const prompt = `
以下のメール内容を日本語で要約してください。マークダウン記法は使わず、プレーンテキストで出力してください。要約は以下の形式で出力してください：

要約:
[メールの主要な内容を2-3文で簡潔に]

差出人: [差出人情報]
件名: [件名]
重要度: [高/中/低]
返信必要: [要/不要]
期限: [期限がある場合のみ]

推奨アクション:
• [具体的なアクション1]
• [具体的なアクション2]
• [具体的なアクション3]

メール内容:
${email}
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const summary = response.text;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing email:', error);
    return NextResponse.json(
      { error: 'メールの要約に失敗しました' },
      { status: 500 }
    );
  }
}