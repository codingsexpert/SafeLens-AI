import { NextResponse } from "next/server";
import { analyzeThreatPrompt } from "@/lib/security/analyze";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
  };

  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required to run analysis." },
      { status: 400 },
    );
  }

  const analysis = await analyzeThreatPrompt(prompt);

  return NextResponse.json(analysis);
}
