# Lumen Research Assistant

`Lumen` ek `Next.js` based multi-agent research app hai jo kisi bhi topic par structured research document generate karta hai. App ke andar 5 AI agents ka pipeline hai: source discovery, summarization, insights, contradiction detection, aur fact-checking.

## Kya Karta Hai

- Topic se structured research document banata hai
- Live agent pipeline dikhata hai
- Executive summary, sources, insights, contradictions aur fact-checks generate karta hai
- Follow-up chat support deta hai
- Research history browser `localStorage` me save karta hai
- Markdown export support deta hai

## Tech Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS v4`
- `AI SDK 6`
- `Google Gemini`
- `shadcn/ui`

## Local Setup

### 1. Node.js install karo

Recommended: `Node.js 20+`

Check karne ke liye:

```bash
node -v
```

### 2. pnpm install karo

```bash
npm install -g pnpm
```

Check:

```bash
pnpm -v
```

### 3. Dependencies install karo

Project root me:

```bash
pnpm install
```

### 4. Environment variable set karo

Project root me `.env.local` file honi chahiye. Is project ko Google Gemini API key chahiye:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

API key yahan se mil jayegi:

`https://aistudio.google.com/apikey`

### 5. Dev server run karo

```bash
pnpm dev
```

Browser me open karo:

`http://localhost:3000`

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Project Structure

```text
app/
  api/
    chat/route.ts
    research/route.ts
  globals.css
  layout.tsx
  page.tsx

components/
hooks/
lib/
public/
```

## App Flow

1. User topic, depth aur template select karta hai.
2. `/api/research` 5-step research pipeline run karta hai.
3. Result UI me stream hota hai.
4. Final document history me save hota hai.
5. `/api/chat` se generated document ke against follow-up questions pooche ja sakte hain.

## Important Note

Current research pipeline real web search nahi karta. Yeh Gemini se "realistic" sources generate karwata hai, jaisa ki [`app/api/research/route.ts`](/Users/MukeshSingh/Desktop/b_rH6cbXFhkc0/app/api/research/route.ts:1) me implemented hai. Agar aapko actual live web-backed research chahiye ho to pipeline ko external search API ke saath integrate karna padega.

## Troubleshooting

### `pnpm: command not found`

```bash
npm install -g pnpm
```

### `GOOGLE_GENERATIVE_AI_API_KEY is not set`

- Ensure karo ki `.env.local` project root me ho
- API key valid ho
- Dev server restart karo

### Port `3000` already in use

```bash
pnpm dev -- --port 3001
```

## Quick Run Summary

```bash
pnpm install
pnpm dev
```

Phir `http://localhost:3000` open karo.
