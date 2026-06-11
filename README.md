# SuperChat AI — Intelligent Voice Call System

An AI-powered voice calling assistant that enables natural conversations through speech.

**Speak → Transcribe → Generate Response → Hear Reply**

---

## Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| Backend        | Python 3.11 + Flask                |
| AI Engine      | Ollama (llama3.2)                  |
| Speech-to-Text | Browser Web Speech API             |
| Text-to-Speech | edge_tts (Microsoft Neural Voices) |
| Frontend       | HTML, CSS, Vanilla JavaScript      |

---

# Prerequisites

Before running the project, ensure the following are installed:

* Python 3.11+
* Ollama
* Google Chrome or Microsoft Edge
* Microphone access enabled

Verify installation:

```bash
python --version
ollama --version
```

---

# Step 1 — Start Ollama

Start the Ollama server:

```bash
ollama serve
```

Open a second terminal and download the model:

```bash
ollama pull llama3.2
```

Verify:

```bash
ollama run llama3.2
```

If the model responds, Ollama is working correctly.

---

# Step 2 — Clone the Repository

```bash
git clone <repo-url>
cd superchat-voice-call-system
```

---

# Step 3 — Create Virtual Environment

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### macOS/Linux

```bash
python -m venv .venv
source .venv/bin/activate
```

---

# Step 4 — Install Dependencies

```bash
pip install -r requirements.txt
```

Verify Flask installation:

```bash
pip list
```

---

# Step 5 — Run the Backend

From the project root:

```bash
python app.py
```

Expected output:

```text
* Running on http://127.0.0.1:5000
```

---

# Step 6 — Open the Application

Open your browser and navigate to:

```text
http://localhost:5000
```

Use Google Chrome or Microsoft Edge for microphone support.

---

# Configuration

Edit `config.py` to customize:

| Variable     | Default          | Description         |
| ------------ | ---------------- | ------------------- |
| OLLAMA_MODEL | llama3.2         | AI model            |
| TTS_VOICE    | en-US-AriaNeural | Voice output        |
| FLASK_PORT   | 5000             | Server port         |
| MAX_HISTORY  | 20               | Conversation memory |

---

# API Endpoints

## Start Call

```http
POST /start-call
```

Request:

```json
{
  "session_id": "abc123"
}
```

---

## Process Voice

```http
POST /process-voice
```

Request:

```json
{
  "session_id": "abc123",
  "text": "Hello"
}
```

Response:

```json
{
  "ai_text": "...",
  "audio_b64": "...",
  "transcript": "...",
  "state": "active"
}
```

---

## End Call

```http
POST /end-call
```

---

## Call Status

```http
GET /call-status?session_id=abc123
```

---

## Toggle Mute

```http
POST /toggle-mute
```

---

# Keyboard Shortcuts

| Key    | Action      |
| ------ | ----------- |
| Enter  | Start Call  |
| Escape | End Call    |
| M      | Toggle Mute |

---

# Troubleshooting

### Ollama Connection Error

```text
Cannot reach Ollama
```

Fix:

```bash
ollama serve
ollama pull llama3.2
```

---

### Microphone Not Working

* Use Chrome or Edge
* Allow microphone permissions
* Refresh the page

---

### No Audio Response

Verify:

```bash
pip show edge-tts
```

Install if missing:

```bash
pip install edge-tts
```

---

### Port Already In Use

Change:

```python
FLASK_PORT = 5000
```

inside `config.py`.

---

# Project Flow

```text
User Speech
      │
      ▼
Web Speech API
      │
      ▼
Flask Backend
      │
      ├── Speech Validation
      ├── Ollama Response Generation
      └── Edge TTS Voice Synthesis
      │
      ▼
Audio Response
      │
      ▼
Browser Playback
```
