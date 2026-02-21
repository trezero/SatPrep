import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface PSATAnalysis {
  overallScore: number;
  mathScore: number;
  readingWritingScore: number;
  weakAreas: WeakArea[];
  strongAreas: string[];
  summary: string;
}

export interface WeakArea {
  category: string;
  subcategory: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
  subcategory: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function analyzePSATPdf(pdfBase64: string): Promise<PSATAnalysis> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: `Analyze this PSAT score report. Extract the student's scores and identify their weak and strong areas.

Return your analysis as JSON with this exact structure:
{
  "overallScore": <number>,
  "mathScore": <number>,
  "readingWritingScore": <number>,
  "weakAreas": [
    {
      "category": "Math" | "Reading & Writing",
      "subcategory": "<specific topic like 'Algebra', 'Geometry', 'Grammar', 'Vocabulary in Context', etc.>",
      "severity": "high" | "medium" | "low",
      "description": "<brief description of what the student struggles with>"
    }
  ],
  "strongAreas": ["<area 1>", "<area 2>"],
  "summary": "<2-3 sentence summary of the student's performance and recommended focus areas>"
}

If the document is not a valid PSAT score report, still return a reasonable analysis based on whatever score information you can find. Focus on identifying specific SAT-testable skill areas.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b: any) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse analysis JSON from response");
  }

  return JSON.parse(jsonMatch[0]) as PSATAnalysis;
}

export async function generateQuestions(
  weakAreas: WeakArea[],
  count: number = 10,
  previousQuestions: string[] = []
): Promise<GeneratedQuestion[]> {
  const areasDescription = weakAreas
    .map((a) => `- ${a.category} > ${a.subcategory} (severity: ${a.severity}): ${a.description}`)
    .join("\n");

  const previousContext =
    previousQuestions.length > 0
      ? `\n\nAvoid repeating these previously asked questions:\n${previousQuestions.slice(-20).map((q) => `- ${q}`).join("\n")}`
      : "";

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    messages: [
      {
        role: "user",
        content: `You are an expert SAT prep tutor. Generate ${count} practice questions targeting the student's weak areas. Weight more questions toward higher-severity weaknesses.

Student's weak areas:
${areasDescription}
${previousContext}

Generate questions that match real SAT style and difficulty. Return a JSON array of question objects:
[
  {
    "question": "<full question text, include any passage or context needed>",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A" | "B" | "C" | "D",
    "explanation": "<clear explanation of why the answer is correct and why others are wrong>",
    "category": "Math" | "Reading & Writing",
    "subcategory": "<specific topic>",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Make questions progressively harder. Include a mix of difficulties: 30% easy, 40% medium, 30% hard. Ensure questions feel like real SAT questions — not textbook exercises.`,
      },
    ],
  });

  const textBlock = response.content.find((b: any) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse questions JSON from response");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedQuestion[];
}

export async function generateFollowUpExplanation(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `A student answered this SAT question incorrectly. Help them understand the concept.

Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}

Give a brief, encouraging explanation (2-3 sentences) of:
1. Why the correct answer is right
2. A tip to remember for similar questions

Keep it conversational and supportive — this is for a high school student.`,
      },
    ],
  });

  const textBlock = response.content.find((b: any) => b.type === "text");
  return textBlock && textBlock.type === "text"
    ? textBlock.text
    : "Keep practicing! Review this topic and try again.";
}
