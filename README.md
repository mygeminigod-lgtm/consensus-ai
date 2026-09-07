# Consensus AI

### One question. Multiple AIs. One carefully verified answer.

[![CI](https://github.com/mygeminigod-lgtm/consensus-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/mygeminigod-lgtm/consensus-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-52%20Passed-22c55e?logo=vitest)](https://vitest.dev/)

---

## Overview

**Consensus AI** is a genuine multi-model AI orchestration, claim extraction, disagreement detection, and deterministic verification platform. 

Most multi-model tools merely take a majority vote or concatenate LLM summaries. Consensus AI operates on a foundational product principle:

> **AI agreement is NOT proof of truth.**  
> Multiple models often share overlapping training data and repeat identical hallucinations.

Consensus AI queries multiple independent frontier models in parallel, extracts discrete factual claims (numbers, dates, definitions, assertions), runs deterministic mathematical calculations and safe code checks, cross-examines sources against peer-reviewed literature, detects active contradictions, and synthesizes a transparent, evidence-bounded answer with honest confidence scoring.

---

## Key Features

### 1. Independent Multi-Model Orchestration
- Queries leading AI providers in complete isolation without cross-contamination:
  - **Google Gemini** (`gemini-2.0-flash`)
  - **OpenAI** (`gpt-4o`)
  - **Anthropic Claude** (`claude-3-5-sonnet`)
  - **DeepSeek** (`deepseek-chat`)
  - **Mistral AI** (`mistral-large-latest`)
  - **Perplexity** (`sonar`)
  - **xAI** (`grok-2`)
- Real-time provider telemetry: latency tracking, token usage, and live connection status.
- **Zero-fabrication rule**: Unavailable providers are honestly marked offline; responses and metrics are never faked.

### 2. Intelligent Domain Routing & Modes
- **Quick**: High-speed inquiry across top frontier models.
- **Balanced**: Standard multi-model verification with claim extraction.
- **Deep Verify**: Extended model consultation with exhaustive disagreement auditing.
- **Academic**: Prioritizes peer-reviewed literature, journals, and primary citations.
- **Math**: Triggers deterministic symbolic and numerical calculation engine.
- **Coding**: Evaluates syntax, algorithmic complexity, and safe sandbox execution.

### 3. Factual Claim Extraction & Disagreement Engine
- Identifies specific figures, dates, statistical claims, scientific assertions, and conclusions.
- Detects contradictions, numerical variance (e.g., administrative city population vs. metropolitan urban agglomeration), and conflicting assumptions.
- Rejects majority vote as a proxy for truth. Explains diverging baseline conditions.

### 4. Deterministic Mathematical & Code Verification
- Built-in deterministic calculator (`mathjs`) cross-checks algebraic equations and calculus results against model answers.
- Code inspector audits syntax and enforces execution honesty: explicitly states **"Code reviewed but not executed"** unless run in an isolated sandbox.

### 5. Interactive Evidence Matrix
- Visual Claim $\times$ Model corroboration grid with status badges (Supported, Contradicted, Uncertain, Disputed).
- Click any claim to inspect underlying empirical evidence, supporting sources, and verification reasoning.

### 6. Authoritative Source Auditing & Cards
- Tiered reliability scoring for peer-reviewed papers (`arXiv`, `Nature`), official documentation (`python.org`, `rust-lang.org`), and government datasets (`UN`, `Census`).
- Never fabricates metadata. If metadata is absent, explicitly states *"Metadata unavailable"*.

### 7. Real-Time Pipeline Progress Tracker
- Live visual progress bar mapping actual backend stages via Server-Sent Events (SSE):
  `understanding_question` ➔ `selecting_models` ➔ `querying_models` ➔ `comparing_responses` ➔ `extracting_claims` ➔ `detecting_disagreements` ➔ `performing_calculations` ➔ `verifying_evidence` ➔ `synthesizing_answer` ➔ `final_verification`.

### 8. Full Session History, Bookmarks, and Export
- Searchable query history and saved answers stored locally in browser storage.
- Multi-format export: Markdown, Plain Text, and Print/PDF with formatted citations.
- Settings modal for configuring custom provider API keys, response styles, and privacy controls.

### 9. Instant Demo Mode
- Full out-of-the-box experience without needing any API keys.
- Pre-configured benchmark scenarios for quantum physics, calculus equations, demographic discrepancies, and systems programming.
- Prominently labeled with honesty banners: *"Demo response — not generated live"*.

---

## Architecture & Data Flow

```
                     ┌───────────────────────────┐
                     │       User Question       │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │     Question Analyzer     │
                     │  (Intent, Domain, Risk)   │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │       Model Router        │
                     │ (Selects Optimal Models)  │
                     └─────────────┬─────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             ▼                     ▼                     ▼
      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
      │ Gemini 2.0   │      │ Claude 3.5   │      │ GPT-4o       │
      │ (Isolated)   │      │ (Isolated)   │      │ (Isolated)   │
      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │   Claim Extraction &      │
                     │   Disagreement Engine     │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │   Deterministic Checks    │
                     │  (Symbolic Math Engine)   │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │    Verification Engine    │
                     │  (Audits Primary Sources) │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │     Synthesis Engine      │
                     │  (Anti-Hallucination)     │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │   Final Consistency Pass  │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │ Answer + Evidence Matrix  │
                     └───────────────────────────┘
```

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.0 (Strict mode)
- **Styling**: Tailwind CSS v3, Glassmorphism design tokens
- **Icons**: Lucide React
- **Math Engine**: `mathjs` (Deterministic parsing & evaluation)
- **Validation**: Zod (Schema validation)
- **Testing**: Vitest + React Testing Library (52 tests across 13 suites)
- **CI/CD**: GitHub Actions

---

## Getting Started

### Prerequisites
- Node.js 20.x or later
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mygeminigod-lgtm/consensus-ai.git
   cd consensus-ai
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up environment variables (optional for live API calls):
   ```bash
   cp .env.example .env.local
   ```
   Add any keys you wish to use:
   ```env
   GOOGLE_AI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   DEEPSEEK_API_KEY=your_deepseek_key
   MISTRAL_API_KEY=your_mistral_key
   PERPLEXITY_API_KEY=your_perplexity_key
   XAI_API_KEY=your_xai_key
   ```
   *(Note: Consensus AI runs immediately in **Demo Mode** without any keys required!)*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing

Run the automated test suite:
```bash
npm run test
```

The test suite covers:
- **Model Router**: Intelligent provider routing per inquiry domain and user filters.
- **Claim Extraction**: Semantic extraction of numbers, dates, theorems, and definitions.
- **Disagreement Engine**: Variance detection in competing model responses without majority vote.
- **Deterministic Math Engine**: Symbolic linear algebra and calculus verification.
- **Verification Engine**: Heuristic confidence scoring and empirical evidence mapping.
- **Security & Prompt Injection**: Control character sanitization, document isolation, and rate limiting.
- **End-to-End Pipeline**: Full integration test from question submission to final verified answer.

To compile a production build:
```bash
npm run build
```

---

## Deployment (Vercel)

Consensus AI is ready for zero-configuration deployment to [Vercel](https://vercel.com):

1. Push your repository to GitHub.
2. Import the repository in Vercel.
3. (Optional) Set your provider environment variables in the Vercel Project Settings.
4. Deploy!

---

## Security & Privacy

- **Server-Side API Keys**: Provider secrets are never leaked to client bundles.
- **Untrusted Document Isolation**: Uploaded files (PDF, TXT, DOCX, Code) are wrapped in `<UNTRUSTED_USER_DOCUMENT>` delimiter tags to neutralize prompt injection attacks.
- **In-Memory Rate Limiting**: Protects backend endpoints against brute-force abuse.
- **Local Data Control**: All query history and settings remain in client browser storage. A one-click *"Erase All Data"* button completely purges local storage.

---

## Honest Limitations

While Consensus AI dramatically reduces hallucination and surfaces contradictory claims:
1. **Verification is Heuristic**: External verification reduces false assertions, but does not guarantee 100% philosophical certainty.
2. **Current Information Constraints**: Questions regarding real-time breaking events require search-augmented providers (e.g. Perplexity).
3. **Sandbox Boundaries**: Code is statically audited unless explicitly enabled for sandboxed evaluation.

---

## License

Released under the [MIT License](LICENSE).
