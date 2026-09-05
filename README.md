# 🔬 AI-Powered Research Assistant

A full-stack web application for students, researchers, and academicians to analyze, summarize, and synthesize research papers using Artificial Intelligence. Powered by **Google Gemini 1.5 Pro** with RAG (Retrieval-Augmented Generation) architecture.

![Research Assistant](https://img.shields.io/badge/AI-Research%20Assistant-1A73E8?style=for-the-badge&logo=google&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Pro-34A853?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 📄 **PDF Upload & Parsing** | Upload research papers with automatic text, table, and figure extraction |
| 💬 **RAG Chat** | Ask questions about your papers with context-aware AI responses |
| 📝 **Smart Summaries** | Generate brief, detailed, or structured summaries |
| 📚 **Literature Survey** | Synthesize themes and gaps across multiple papers |
| 🏷️ **Domain Identification** | Automatically identify research domains and keywords |
| 📎 **Citation Builder** | Generate APA, MLA, Chicago, or BibTeX citations |
| 🔍 **Real-Time Research** | Search Semantic Scholar for related papers |
| 📊 **Visualizations** | Generate charts from paper data |
| ✅ **Consistency Checker** | Identify inconsistencies across papers |

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- TanStack Query + Zustand
- React Router v6 + Recharts

### Backend
- Python 3.11+ with FastAPI
- Google Gemini API (gemini-1.5-pro)
- LangChain + ChromaDB (RAG)
- Google Generative AI Embeddings
- SQLite + Celery + Redis

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Redis (optional, for background tasks)

### 1. Clone & Setup Backend

```bash
cd research-assistant/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY (optional — stub mode works without it)

# Run the server
uvicorn app.main:app --reload
```

### 2. Setup Frontend

```bash
cd research-assistant/frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

### 3. Open the App
Navigate to **http://localhost:5173**

---

## 🐳 Docker

```bash
cd research-assistant

# Build and run all services
docker compose up --build

# With a real Gemini API key
GEMINI_API_KEY=your_key GEMINI_STUB_MODE=false docker compose up --build
```

---

## 🔑 API Configuration

### Stub Mode (Default)
The app runs in **stub mode** by default — all AI features return labeled placeholder responses. This lets you explore the full UI and workflow without an API key.

### Live Mode
1. Get a free Gemini API key at [ai.google.dev](https://ai.google.dev/)
2. Set in `backend/.env`:
   ```
   GEMINI_API_KEY=your_actual_key
   GEMINI_STUB_MODE=false
   ```
3. Restart the backend

---

## 📁 Project Structure

```
research-assistant/
├── frontend/          # React + TypeScript app
│   ├── src/
│   │   ├── components/   # UI components (layout, upload, chat, modules, shared)
│   │   ├── pages/        # Dashboard, Workspace, Library, Settings
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client
│   │   ├── store/        # Zustand state management
│   │   └── types/        # TypeScript interfaces
│   └── ...
├── backend/           # Python FastAPI server
│   ├── app/
│   │   ├── routers/      # API endpoints (9 modules)
│   │   ├── services/     # LLM, embeddings, RAG, PDF extraction
│   │   ├── models/       # SQLAlchemy models
│   │   ├── tasks/        # Celery background tasks
│   │   └── utils/        # Text cleaning, chart building
│   └── ...
└── docker-compose.yml
```

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.
