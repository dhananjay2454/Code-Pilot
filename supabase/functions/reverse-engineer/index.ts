import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert computer science tutor specializing in reverse engineering code understanding. Your role is to evaluate a student's analysis of a given code snippet/algorithm.

You will receive:
1. A code snippet
2. The student's analysis containing:
   - Problem statement
   - Input and output
   - Algorithm purpose
   - Time complexity
   - Space complexity
   - Edge cases

Return ONLY JSON in this exact structure:

{
  "codeUnderstanding": {
    "score": <0-100>,
    "problemStatement": { "correct": <boolean>, "feedback": "<string>" },
    "inputOutput": { "correct": <boolean>, "feedback": "<string>" },
    "algorithmPurpose": { "correct": <boolean>, "feedback": "<string>" }
  },
  "complexityAnalysis": {
    "score": <0-100>,
    "timeComplexity": { "correct": <boolean>, "expected": "<string>", "feedback": "<string>" },
    "spaceComplexity": { "correct": <boolean>, "expected": "<string>", "feedback": "<string>" },
    "hint": "<string if wrong, null if correct>"
  },
  "edgeCaseDetection": {
    "score": <0-100>,
    "identified": ["<list>"],
    "missed": ["<list>"],
    "feedback": "<string>"
  },
  "socraticQuestions": ["<question1>", "<question2>"],
  "optimizationChallenge": {
    "challenge": "<string>",
    "hint": "<string>"
  },
  "overallScore": <0-100>,
  "confidenceBreakdown": {
    "understanding": <0-100>,
    "complexityAccuracy": <0-100>,
    "edgeCaseAwareness": <0-100>,
    "overall": <0-100>
  },
  "feedback": "<2-3 sentences>"
}

Rules:
- Be supportive but rigorous
- Never reveal full solutions
- Give hints only
- Always ask 2 Socratic questions
- Score fairly
- Only return valid JSON`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, analysis } = await req.json();

    if (!code || !analysis) {
      return new Response(
        JSON.stringify({ error: "Both code and analysis are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const userMessage = `## Code to Analyze
${code}

## Student Analysis
Problem Statement: ${analysis.problemStatement || "Not provided"}
Input/Output: ${analysis.inputOutput || "Not provided"}
Algorithm Purpose: ${analysis.algorithmPurpose || "Not provided"}
Time Complexity: ${analysis.timeComplexity || "Not provided"}
Space Complexity: ${analysis.spaceComplexity || "Not provided"}
Edge Cases: ${analysis.edgeCases || "Not provided"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Groq API error:", response.status, t);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let parsedErr = t;
      try {
        parsedErr = JSON.parse(t)?.error?.message || t;
      } catch {}

      return new Response(
        JSON.stringify({ error: `AI evaluation failed: ${parsedErr}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from Groq");
    }

    let evaluation;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);

      return new Response(
        JSON.stringify({ error: "Failed to parse AI evaluation. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reverse-engineer error:", e);

    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});