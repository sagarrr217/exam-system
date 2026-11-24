import { config } from '../config/index.js';

export interface GeneratedOption {
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface GeneratedQuestion {
  text: string;
  type: string; // 'MCQ' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_BLANK' | 'NUMERICAL'
  marks: number;
  explanation: string;
  options: GeneratedOption[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  questions?: GeneratedQuestion[];
}

export interface FileAttachment {
  filename: string;
  mimeType: string;
  base64Data: string; // base64 encoded string without data:mime;base64, prefix
}

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Execute call to Gemini API with fallback over candidate models
 */
async function callGeminiApi(payload: any): Promise<any> {
  const apiKey = config.gemini.apiKey;
  if (!apiKey) {
    throw new Error('Google Gemini API key is not configured in backend .env (GEMINI_API_KEY).');
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        return data;
      }

      const errText = await response.text();
      lastError = new Error(`Gemini (${model}) returned status ${response.status}: ${errText}`);
      console.warn(`Gemini model ${model} failed, trying next candidate...`, lastError.message);
    } catch (err: any) {
      lastError = err;
      console.warn(`Network error with model ${model}, trying next...`, err.message);
    }
  }

  throw lastError || new Error('All Gemini model candidates failed to respond.');
}

/**
 * Clean and extract JSON questions from Gemini's raw output
 */
function extractQuestionsFromJson(rawText: string): GeneratedQuestion[] {
  let cleanedText = rawText.trim();
  
  // Find outermost JSON array [...]
  const jsonArrayMatch = cleanedText.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    cleanedText = jsonArrayMatch[0];
  } else {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  let parsed: any[] = [];
  try {
    parsed = JSON.parse(cleanedText);
  } catch {
    try {
      // Remove control characters if any
      const sanitized = cleanedText.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      parsed = JSON.parse(sanitized);
    } catch (e: any) {
      console.warn('Unable to parse JSON array from raw text:', rawText.slice(0, 300));
      return [];
    }
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((q, idx) => {
    const rawType = String(q.type || 'MCQ').toUpperCase();
    const type = ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANK', 'NUMERICAL'].includes(rawType)
      ? rawType
      : 'MCQ';

    let options: GeneratedOption[] = [];

    if (type === 'TRUE_FALSE') {
      const correctIsFalse = q.options?.some((o: any) => o.text?.toLowerCase().includes('false') && o.isCorrect);
      options = [
        { text: 'True', isCorrect: !correctIsFalse, orderIndex: 0 },
        { text: 'False', isCorrect: Boolean(correctIsFalse), orderIndex: 1 }
      ];
    } else if (['MCQ', 'MULTIPLE_SELECT'].includes(type)) {
      if (Array.isArray(q.options) && q.options.length > 0) {
        options = q.options.map((opt: any, optIdx: number) => ({
          text: String(opt.text || `Option ${optIdx + 1}`),
          isCorrect: Boolean(opt.isCorrect),
          orderIndex: optIdx
        }));
      } else {
        options = [
          { text: 'Option A', isCorrect: true, orderIndex: 0 },
          { text: 'Option B', isCorrect: false, orderIndex: 1 },
          { text: 'Option C', isCorrect: false, orderIndex: 2 },
          { text: 'Option D', isCorrect: false, orderIndex: 3 }
        ];
      }
      if (!options.some(o => o.isCorrect)) {
        options[0].isCorrect = true;
      }
    }

    return {
      text: String(q.text || `Question ${idx + 1}`),
      type,
      marks: Number(q.marks) || 10,
      explanation: String(q.explanation || ''),
      options
    };
  });
}

/**
 * 1. Quick Generation by Topic (Legacy / Fast Button)
 */
export const generateQuestionsWithGemini = async (
  topic: string,
  count: number = 3,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<GeneratedQuestion[]> => {
  const prompt = `You are an academic exam question generator.
Generate exactly ${count} distinct questions on the topic: "${topic}".
Difficulty level: ${difficulty}.

Requirements:
1. Each question must be academically sound, concise, and rigorous.
2. For multiple choice (MCQ), provide 4 distinct options with exactly one correct option marked isCorrect: true.
3. Include an academic explanation for the correct answer.
4. Set realistic marks (e.g., 5 or 10 marks).
5. Output ONLY a valid JSON array of question objects.

Expected JSON schema:
[
  {
    "text": "Question statement here?",
    "type": "MCQ",
    "marks": 10,
    "explanation": "Brief explanation why the answer is correct.",
    "options": [
      { "text": "Option A text", "isCorrect": true, "orderIndex": 0 },
      { "text": "Option B text", "isCorrect": false, "orderIndex": 1 },
      { "text": "Option C text", "isCorrect": false, "orderIndex": 2 },
      { "text": "Option D text", "isCorrect": false, "orderIndex": 3 }
    ]
  }
]`;

  const data = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      topP: 0.85
    }
  });

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Gemini API returned an empty response.');
  }

  const questions = extractQuestionsFromJson(rawText);
  if (questions.length === 0) {
    throw new Error('Failed to parse generated questions from Gemini output.');
  }

  return questions;
};

/**
 * 2. Conversational Chat Question Creator with Multimodal (PDF / Image) Support
 */
export const chatWithGeminiForQuestions = async (params: {
  prompt: string;
  history?: { role: 'user' | 'model'; text: string }[];
  file?: FileAttachment;
  examContext?: { title?: string; subject?: string; existingQuestionCount?: number };
}): Promise<{ reply: string; questions: GeneratedQuestion[] }> => {
  const { prompt, history = [], file, examContext } = params;

  const systemInstructions = `You are an expert academic curriculum designer and test authoring AI assistant for a university-level examination system.
The exam is: "${examContext?.subject || examContext?.title || 'General Examination'}".
Current question count in exam: ${examContext?.existingQuestionCount || 0}.

Your task is to converse with the teacher/instructor and generate questions based on their instructions, syllabus, or uploaded document/image (PDF or image).

Guidelines:
1. When asked to generate questions or when an image/document is provided:
   - Provide a helpful, concise conversational introduction/summary of what you created.
   - Then provide the generated questions formatted as a clean JSON block inside \`\`\`json [ ... ] \`\`\`.
   - Each question object must follow this structure:
     {
       "text": "Clear question text?",
       "type": "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER",
       "marks": 5 or 10,
       "explanation": "Why this answer is correct",
       "options": [
         { "text": "Option 1", "isCorrect": true, "orderIndex": 0 },
         { "text": "Option 2", "isCorrect": false, "orderIndex": 1 }
       ]
     }
2. Support extracting questions directly from:
   - Past exam papers or textbook pages in the uploaded PDF or image
   - Diagrams, charts, or mathematical equations in the image
   - Specific topics, difficulty levels, or learning objectives given in the user prompt.
3. If the user is asking questions or refining existing questions, respond helpfully and output the updated JSON question array.`;

  // Build Gemini contents array from chat history
  const contents: any[] = [];

  // Add previous history turns if any
  for (const turn of history.slice(-6)) {
    contents.push({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: [{ text: turn.text }]
    });
  }

  // Build the current user turn parts
  const currentParts: any[] = [];

  // 1. System context injected into user prompt
  currentParts.push({
    text: `${systemInstructions}\n\nTeacher Instruction:\n${prompt}`
  });

  // 2. Multimodal attachment (PDF or Image)
  if (file && file.base64Data && file.mimeType) {
    let cleanBase64 = file.base64Data;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }

    currentParts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: cleanBase64
      }
    });
  }

  contents.push({
    role: 'user',
    parts: currentParts
  });

  const data = await callGeminiApi({
    contents,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9
    }
  });

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!rawText) {
    throw new Error('Gemini AI returned an empty response.');
  }

  // Extract structured questions from response if present
  const questions = extractQuestionsFromJson(rawText);

  // Clean the conversational reply by removing the raw JSON code block for a clean chat experience
  let conversationalReply = rawText
    .replace(/```json[\s\S]*?```/gi, '')
    .trim();

  if (!conversationalReply && questions.length > 0) {
    conversationalReply = `I have generated ${questions.length} question(s) matching your criteria. You can preview and add them to your exam below:`;
  }

  return {
    reply: conversationalReply,
    questions
  };
};
