# RpaperAI

An AI-powered research paper generator using Groq's Llama 3 model and an interactive React frontend.

## Features
- Idea translation into professional IEEE style titles.
- Modular section generation (Abstract, Literature Survey, System Architecture, etc.).
- Rich text editing powered by React-Quill.
- Image uploads for architecture diagrams.

## Prerequisites
- Node.js (v18+)
- Python (3.9+)
- [Groq API Key](https://console.groq.com/) for Llama 3 generation.

## Installation

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

## How to Run

### 1. Start the Backend
You must export your Groq API key before running the server. From the root directory:
```bash
export GROQ_API_KEY="your-groq-api-key-here"
cd backend
python main.py
```
The FastAPI server will run on `http://localhost:8000`. 
API docs available at `http://localhost:8000/docs`.

### 2. Start the Frontend
In a new terminal, from the root directory:
```bash
cd frontend
npm run dev
```
The React app will typically be available at `http://localhost:5173`. Open this URL in your browser to use the application.
