# 🏛️ LexMind Frontend (LexMind Ops & Legal Chat)

**LexMind** is an advanced professional legal AI infrastructure designed to provide precision, speed, and professional-grade insights regarding Vietnamese Laws (specifically Decree 168/2024/NĐ-CP and Road Traffic Safety Laws). 

This repository contains the Next.js frontend application, built with modern web technologies and a sleek, cutting-edge Dark-mode aesthetic.

---

## 🌟 Key Features

* **AI Legal Chat Interface**
  * Real-time streaming AI responses via SSE (Server-Sent Events).
  * Highly detailed breakdown of AI processing steps (`Thinking`, `Process Queue`, `Answer`).
  * Advanced citation metrics including RRF (Reciprocal Rank Fusion) relevancy scores.
  * In-chat interactive Law Details panel for direct statutory reading.

* **Comprehensive Authentication Flow**
  * Secure JWT-based Authentication with transparent auto-refreshing via an interceptor pattern.
  * Seamless Google OAuth2 Integration.
  * Fully featured Forgot Password flow with 6-digit OTP email verification.

* **LexMind Ops (Admin Dashboard)**
  * **System Overview:** Monitors API, Database, AI Services, and Redis health.
  * **User Management:** Monitor signups, activity, and administrative roles.
  * **Conversations Hub:** Track AI interactions, request latencies, and flag anomalous generations.
  * **AI Performance & Cache Analytics:** Real-time generation metrics (p50, p95, TTFT, token usage) and Semantic Caching hit-rates to measure RAG viability.
  * **Feedback Analytics:** Granular tracking of user feedback to continuously optimize LLM responses.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14/15+](https://nextjs.org/) (App Router, Client Components)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom Neo-Cyberpunk & Dark Theme Configuration)
* **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with LocalStorage persistence for Auth)
* **Markdown Rendering:** `react-markdown` (for complex AI response rendering with nested sub-components)

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm or yarn

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
3. Set up environment variables (create a `.env` file):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## 📂 Architecture Overview

```text
src/
├── app/                  # Next.js App Router (Routing & Layouts)
│   ├── admin/            # LexMind Ops Dashboard (Guarded by ADMIN role)
│   ├── chat/             # AI Interaction Application
│   └── login/            # Entry & Authentication
├── assets/               # Static assets & backgrounds
├── components/           # Reusable UI components (Modals, Bubbles, Layouts)
├── lib/                  # Dedicated API Controllers (Auth, Chat, Admin, Law)
└── store/                # Zustand global stores (user, auth, conversation tracking)
```

## 🔒 Security & RBAC
The application strictly delegates routes based on Role-Based Access Control (RBAC). Regular users interface with the RAG engine via the `/chat` route, while `ADMIN`s are instantly and natively directed to the **LexMind Ops** suite upon authentication.

## 📜 License
*© 2024 Lexi Intelligence Systems | All Rights Reserved.*
