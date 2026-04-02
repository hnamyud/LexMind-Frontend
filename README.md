# 🏛️ LexMind Frontend (LexMind Ops & Legal Chat)

**LexMind** is an advanced professional legal AI infrastructure designed to provide precision, speed, and professional-grade insights regarding Vietnamese Laws (specifically Decree 168/2024/NĐ-CP, Road Traffic Safety Laws, and beyond). 

This repository contains the Next.js frontend application, built with modern web technologies, a sleek Dark-mode aesthetic, and powerful interactive data visualization.

---

## 🌟 Key Features

### 1. 🤖 AI Legal Chat Interface
* **Real-time SSE Streaming:** Extremely fast and dynamic word-by-word generation via Server-Sent Events.
* **Granular Transparency:** Highly detailed breakdown of AI processing steps (`Thinking`, `Process Queue`, `Answer`).
* **Citation & Relevancy Metrics:** Advanced citation metrics including RRF (Reciprocal Rank Fusion) relevancy scores for total transparency.
* **Knowledge Graph Visualization:** Visually explores the semantic relationships between legal nodes using `react-force-graph-2d`.
* **In-chat Law Details:** An interactive side panel for direct statutory reading alongside the AI conversation.

### 2. 🧪 Automated RAG Evaluation Pipeline (LexMind Ops)
* **LangSmith Integration:** Trigger and view full dataset batch runs powered by LangGraph directly from the dashboard.
* **Advanced AI Metrics Tracking:** Automatically displays AI-driven evaluation metrics across dimensions like Groundedness, Correctness, Behavior Compliance, and Citation Accuracy.
* **Manual Feedback Interface:** Complete manual evaluation overlay with 0-2 scale scoring and issue tagging to constantly map, trace, and refine model outputs.
* **Dataset Management:** Select test datasets and control run limits directly from the frontend.

### 3. 🛡️ Comprehensive Authentication Flow
* **Secure JWT Management:** Authentication with transparent auto-refreshing via an interceptor pattern.
* **Google OAuth2 Integration:** 1-click seamless SSO authorization.
* **Forgot Password Flow:** Fully featured recovery with 6-digit OTP email verification integration.

### 4. 📊 Admin Dashboard & Observability
* **System Overview:** Monitors API, Postgres Database, AI Services, and Redis health.
* **User Management:** Monitor signups, activity, and adjust administrative roles.
* **Generative Analytics:** Real-time generation metrics (p50, p95, TTFT, token usage) and Semantic Caching hit-rates to measure real-world performance.
* **Presentations Module:** Programmatic dynamic video/animation generation powered by `Remotion` for legal explainers directly inside the web app.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js App Router](https://nextjs.org/) (React 19, TypeScript)
* **Styling:** Tailwind CSS V4 (Custom Neo-Cyberpunk & Dark Theme System)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with LocalStorage persistence features)
* **Data Visualization:** `d3` and `react-force-graph-2d` for legal knowledge graph charting
* **Motion & Media:** `Remotion` for internal programmatic slide/video rendering
* **Content Rendering:** `react-markdown` 

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm, yarn, or pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd LexMind-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` (or create a `.env` file) and configure your endpoints:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   # Add other required client keys here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

---

## 📂 Architecture Overview

```text
src/
├── app/                  # Next.js App Router (Routing & Layouts)
│   ├── admin/            # LexMind Ops Dashboard (Guards & Eval pipelines)
│   ├── chat/             # AI Interaction Application
│   ├── login/            # Entry & Authentication Flows
│   └── presentation/     # Remotion-powered presentation & video rendering
├── assets/               # Static assets & backgrounds
├── components/           # Reusable UI components (Modals, Bubbles, Layouts)
├── hooks/                # Global custom React hooks
├── lib/                  # Dedicated API Controllers (Auth, Chat, Eval, Admin, Law)
├── providers/            # Top-level React context providers
└── store/                # Zustand global stores (Zustand)
```

## 🔒 Security & RBAC
The application strictly delegates routes based on Role-Based Access Control (RBAC). Regular users interface with the RAG engine via the `/chat` route. Users identified as `ADMIN` are instantly and natively directed to the advanced **LexMind Ops** suite upon authentication to configure models, track evaluations, and view metrics.

## 📜 License
*© 2024-2026 Lexi Intelligence Systems | All Rights Reserved.*
