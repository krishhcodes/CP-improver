import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (geminiKey) {
    return NextResponse.json({
      configured: true,
      provider: "gemini",
      model: "gemini-2.0-flash / gemini-1.5-flash",
      maskedKey: maskKey(geminiKey),
    });
  }

  if (openaiKey) {
    return NextResponse.json({
      configured: true,
      provider: "openai",
      model: "gpt-4o-mini",
      maskedKey: maskKey(openaiKey),
    });
  }

  if (groqKey) {
    return NextResponse.json({
      configured: true,
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      maskedKey: maskKey(groqKey),
    });
  }

  if (openrouterKey) {
    return NextResponse.json({
      configured: true,
      provider: "openrouter",
      model: "google/gemini-2.0-flash-001",
      maskedKey: maskKey(openrouterKey),
    });
  }

  return NextResponse.json({
    configured: false,
    provider: "none",
    model: "Socratic Heuristic Engine (Offline)",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = (body.apiKey || "").trim();
    let provider = (body.provider || "").toLowerCase().trim();

    if (!key) {
      return NextResponse.json(
        { success: false, error: "API key cannot be empty." },
        { status: 400 }
      );
    }

    // Auto-detect provider if not explicitly given
    if (!provider) {
      if (key.startsWith("AIzaSy")) {
        provider = "gemini";
      } else if (key.startsWith("sk-or-")) {
        provider = "openrouter";
      } else if (key.startsWith("gsk_")) {
        provider = "groq";
      } else if (key.startsWith("sk-")) {
        provider = "openai";
      } else {
        provider = "gemini"; // Default to Gemini
      }
    }

    // Determine environment variable name
    let envVarName = "GEMINI_API_KEY";
    if (provider === "openai") envVarName = "OPENAI_API_KEY";
    else if (provider === "groq") envVarName = "GROQ_API_KEY";
    else if (provider === "openrouter") envVarName = "OPENROUTER_API_KEY";

    // Update in-memory process.env immediately
    process.env[envVarName] = key;
    if (provider === "gemini") {
      process.env.NEXT_PUBLIC_GEMINI_API_KEY = key;
    }

    // Persist to .env file in project root
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
      }

      const regex = new RegExp(`^${envVarName}=.*$`, "m");
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${envVarName}="${key}"`);
      } else {
        envContent += `\n# AI Intelligence API Key\n${envVarName}="${key}"\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (fsErr) {
      console.warn("[API Key Route] Could not write to .env file:", fsErr);
    }

    return NextResponse.json({
      success: true,
      provider,
      maskedKey: maskKey(key),
      message: `Successfully connected to real AI via ${provider.toUpperCase()}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function maskKey(k: string): string {
  if (k.length <= 8) return "••••••••";
  return `${k.substring(0, 6)}...${k.substring(k.length - 4)}`;
}
