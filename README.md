# Superchat Voice Assistant — Setup Guide

A voice-enabled AI chat assistant built with Node.js, TypeScript, and Groq AI.

---

## What You Need Before Starting

- **Node.js** (v18 or higher) — [Download here](https://nodejs.org)
- **A Groq API key** — [Get one free at console.groq.com](https://console.groq.com)
- **Google Chrome or Microsoft Edge** — for microphone support
- **A microphone** connected to your computer

---

## Step 1 — Get Your Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Click **API Keys** in the left sidebar
4. Click **Create API Key**
5. Copy the key — it looks like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> **Important:** Keep this key secret. Never share it or commit it to GitHub.

---

## Step 2 — Download the Project

```bash
git clone <your-repo-url>
cd Superchat-voice-Project
```

Or just download the ZIP from GitHub and extract it.

---

## Step 3 — Set Up the Backend

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Install all dependencies:

```bash
npm install
```

---

## Step 4 — Create Your `.env` File

The `.env` file stores your secret API key. The project comes with a `.env.example` — copy it:

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Now open `.env` in Notepad (or any text editor):

```bash
notepad .env
```

Replace the placeholder with your actual Groq key:

```
GROQ_API_KEY=gsk_your_actual_key_here
PORT=4000
```

Save and close the file.

---

## Step 5 — Start the Backend

```bash
npm run dev
```

You should see:
```
[INFO] Superchat backend running on http://localhost:4000
```

> If you see an error about a port being in use, open `.env` and change `PORT=4000` to `PORT=4001` (or any other number), then restart.

---

## Step 6 — Open the App

Open **Google Chrome** or **Microsoft Edge** and go to:

```
http://localhost:4000
```

Allow microphone access when the browser asks.

---

## How to Use

- **Type a message** in the chat box and press Enter, OR
- **Click the microphone button** and speak — your speech is converted to text automatically
- The AI will respond in text and voice

---

## Stopping the Server

In the terminal where the server is running, press:

```
Ctrl + C
```

---

## Starting Again Next Time

Every time you want to use the app, just:

1. Open a terminal
2. Navigate to the backend folder: `cd Superchat-voice-Project\backend`
3. Run: `npm run dev`
4. Open Chrome and go to `http://localhost:4000`

---

## Troubleshooting

### "GROQ_API_KEY not set" error
- Make sure your `.env` file exists in the `backend` folder
- Make sure the key starts with `gsk_` and is the full key (not just the beginning)
- Make sure `import 'dotenv/config';` is the first line of `src/server.ts`

### Microphone not working
- Use Google Chrome or Microsoft Edge (not Firefox)
- Click the lock icon in the address bar → allow microphone
- Refresh the page

### "Port already in use" error
- Another program is using port 4000
- Change `PORT=4000` to `PORT=4001` in your `.env` file

### No AI response / blank reply
- Check the terminal for error messages
- Make sure your Groq API key is valid at [console.groq.com](https://console.groq.com)
- Make sure you have internet connection (Groq is a cloud service)

### Server shows health/analytics logs but no chat logs
- This is normal — those are just the frontend checking if the server is alive
- Try sending a message; you should then see `Groq request` and `Groq reply` in the logs

---

## Project Structure (for the curious)

```
backend/
├── src/
│   ├── server.ts          ← Main entry point, starts the server
│   ├── routes/            ← API endpoints (chat, voice, analytics...)
│   └── services/          ← Business logic (AI, TTS, STT, sessions...)
├── .env                   ← Your secret keys (never share this!)
├── .env.example           ← Template showing what keys are needed
└── package.json           ← Project info and dependencies
```

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Backend | Node.js + TypeScript + Express |
| AI | Groq API (llama-3.3-70b) |
| Speech to Text | Browser Web Speech API |
| Text to Speech | Google Cloud TTS / ElevenLabs |
| Frontend | HTML + CSS + Vanilla JavaScript |
