# SafeLens AI

SafeLens AI is an AI security copilot that helps non-technical users understand suspicious digital content before they click, reply, or share anything sensitive.

It is built as a hackathon-ready security product for the **AI Agent for the Real World** problem statement and is designed to make security decisions simple, clear, and actionable.

## Tagline

**See risk clearly. Act safely.**

## Problem

Most people are not security experts.

When they receive a suspicious email, link, QR code, screenshot, or PDF, they usually have three problems:

- they do not know whether it is safe
- they do not understand technical security tools
- they do not know what to do next

SafeLens AI solves that gap by giving users one premium workspace where they can check suspicious content and get a plain-language answer.

## What SafeLens AI Does

SafeLens AI lets a user:

- paste suspicious email text
- paste a suspicious URL or message
- upload a screenshot and extract text with OCR
- upload a PDF and extract readable text
- upload a QR code image and decode it
- review a verdict in simple language
- see why the content looks risky
- get recommended next actions
- copy a shareable summary for a manager or team

## Why It Is Different

Most free tools give raw signals.

SafeLens AI gives:

- clarity for non-technical users
- a simple verdict instead of security jargon
- multi-input suspicious content support
- guided next steps after the analysis
- a governed AI architecture story using ArmorIQ and ArmorClaw

In short:

**Existing tools help detect. SafeLens AI helps people decide.**

## Core Features

### User Experience

- premium glassmorphism-based UI
- light mode and dark mode
- simple input-first workflow
- clear result panel with verdict, risk score, evidence, and next steps
- bilingual explanation toggle for English and Hindi

### Real Working Input Features

- **QR code scan**
  - upload a QR image
  - decode the QR content
  - analyze the decoded text or link

- **PDF text extraction**
  - upload a PDF
  - extract readable text
  - analyze the document content

- **Screenshot OCR**
  - upload an image or screenshot
  - extract text using OCR
  - analyze the extracted text

### Result Experience

- neutral initial state before analysis
- dynamic verdicts based on the pasted content
- evidence-based explanation
- action recommendations
- shareable summary card

## Verdict Types

Depending on the input, the app can produce:

- `Looks mostly safe`
- `Suspicious - review carefully`
- `Likely phishing`

## Required Stack Mapping

This project maps to the required hackathon stack in the following way:

### ArmorIQ

Used as the **governed AI layer** for:

- policy-aware execution flow
- plan capture
- intent token request
- safe action architecture

Code paths:

- [lib/security/armoriq.ts](./lib/security/armoriq.ts)
- [lib/security/analyze.ts](./lib/security/analyze.ts)
- [lib/security/config.ts](./lib/security/config.ts)

### ArmorClaw

Used as the **security scan / enforcement integration surface** for:

- suspicious content scanning
- scan summaries
- live endpoint integration when available

Code path:

- [lib/security/armorclaw.ts](./lib/security/armorclaw.ts)

### Input-Aware Risk Engine

The current MVP uses a practical heuristic layer so that the output changes based on actual suspicious content patterns.

Code path:

- [lib/security/heuristics.ts](./lib/security/heuristics.ts)

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** custom CSS with premium glassmorphism and animated background layers
- **Security SDK:** ArmorIQ TypeScript SDK
- **OCR:** `tesseract.js`
- **QR decoding:** `jsqr`
- **PDF parsing:** `pdfjs-dist`

## Project Structure

```text
app/
  api/
    analyze/route.ts
  globals.css
  layout.tsx
  page.tsx

components/
  theme-toggle.tsx
  triage-workbench.tsx

lib/
  mock-analysis.ts
  types.ts
  security/
    analyze.ts
    armorclaw.ts
    armoriq.ts
    config.ts
    heuristics.ts

types/
  pdfjs-worker.d.ts
```

## Local Setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
PORT=3001 npm run dev
```

Then open:

```text
http://localhost:3001
```

Production build:

```bash
npm run build
PORT=3001 npm start
```

## Environment Variables

Create `.env.local` from `.env.example`.

### Minimal setup

```bash
ARMORIQ_API_KEY=your_armoriq_key
ARMORIQ_USER_ID=demo-user
ARMORIQ_AGENT_ID=kill-switch-agent
```

### Full current template

```bash
ARMORIQ_API_KEY=
ARMORIQ_USER_ID=demo-user
ARMORIQ_AGENT_ID=kill-switch-agent
IAP_ENDPOINT=
PROXY_ENDPOINT=
BACKEND_ENDPOINT=
ARMORIQ_TIMEOUT_MS=30000
ARMORIQ_MAX_RETRIES=3
ARMORIQ_TRIAGE_MCP=security-mcp
ARMORIQ_SCAN_ACTION=scan_artifact
ARMORCLAW_API_URL=
ARMORCLAW_API_KEY=
```

## Live vs Demo Mode

- if `ARMORIQ_API_KEY` is present, the app attempts live ArmorIQ plan capture / intent flow
- if live ArmorClaw endpoint is not configured, the scan layer safely falls back to demo scan behavior
- the UI clearly shows whether the result is in `Demo Mode` or `ArmorIQ Live`

## How The Analysis Works

1. The user pastes or uploads suspicious content
2. The system converts it into analyzable text when needed
   - QR image -> decoded text
   - screenshot -> OCR text
   - PDF -> extracted text
3. The backend runs:
   - input-aware heuristic risk analysis
   - ArmorIQ policy layer attempt
   - ArmorClaw scan layer attempt
4. The frontend displays:
   - verdict
   - risk score
   - explanation
   - evidence
   - next steps

## Example Inputs

### Safer Sample

```text
Hi Mukesh,
Thanks for subscribing to our AI learning newsletter. You will receive tutorials and updates every week. You can unsubscribe anytime.
```

### Risky Sample

```text
Urgent: Your payroll account needs verification today. Click the secure link below and confirm your bank details immediately.
https://secure-payroll-update-login.com
```

## Demo Flow For Judges

1. Open the app
2. Show the premium multi-input command center
3. Paste a suspicious payroll or phishing-style message
4. Run analysis
5. Show the dynamic verdict and risk score
6. Show the evidence and next-step actions
7. Show QR / PDF / OCR support as advanced real-world inputs
8. Mention ArmorIQ and ArmorClaw integration architecture

## One-Line Pitch

**SafeLens AI is an AI security copilot for non-technical users that analyzes suspicious content, explains the risk clearly, and suggests safe next actions.**

## Strong Demo Positioning

You can present it as:

> A premium AI assistant that turns suspicious emails, links, screenshots, PDFs, and QR codes into simple, explainable security decisions for normal users.

## Current Status

### Working Now

- dynamic suspicious content analysis
- QR image decoding
- PDF text extraction
- screenshot OCR
- English / Hindi result mode
- shareable summary
- premium animated UI
- build passing

### Partial / Integration Ready

- live ArmorIQ policy / intent workflow
- live ArmorClaw endpoint support

### Not Fully Productionized Yet

- persistent database-backed case history
- browser extension implementation
- enterprise auth / access control
- full production threat intelligence pipeline

## Known Limitations

- the current risk model is optimized for hackathon reliability and clarity
- live ArmorClaw behavior depends on a configured endpoint
- OCR and PDF extraction quality depends on input quality

## Suggested Future Improvements

- browser extension for current tab scan
- Slack / email / Jira escalation
- persistent incident history
- richer live policy workflows
- direct screenshot-to-URL extraction improvements
- team collaboration mode

## Team Message

SafeLens AI was built to make security accessible.

The goal is not just to detect threats, but to help real people understand risk and respond safely.
