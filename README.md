# Riva Translator — NVIDIA NIM

A full-stack translation app powered by **NVIDIA Riva Translate 1.6b** (36 languages, any-to-any neural machine translation).

---

## Project Structure

```
riva-translator/
├── backend/
│   ├── proto/
│   │   └── riva_nmt.proto      ← gRPC service definition
│   ├── server.js               ← Express + gRPC proxy
│   ├── package.json
│   └── .env                    ← ← ← PUT YOUR API KEY HERE
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## Setup Guide

### Step 1 — Prerequisites

Make sure you have installed:
- **Node.js** v18 or higher → https://nodejs.org
- **npm** v9 or higher (comes with Node.js)

Verify: `node -v` and `npm -v`

---

### Step 2 — Get Your NVIDIA API Key

1. Go to https://build.nvidia.com/nvidia/riva-translate-1_6b
2. Click **"Get API Key"**
3. Click **"Generate Key"**
4. Copy the key (starts with `nvapi-`)

---

### Step 3 — Set Your API Key

Open `backend/.env` and replace the placeholder:

```
NVIDIA_API_KEY=nvapi-your-actual-key-here
```

**Do not share or commit this file.**

---

### Step 4 — Install & Run the Backend

```bash
cd backend
npm install
npm start
```

You should see:
```
✅ Riva Translator backend running on http://localhost:3001
   API Key: ✓ Set
   gRPC server: grpc.nvcf.nvidia.com:443
```

---

### Step 5 — Install & Run the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## Usage

1. Select **source language** (left dropdown)
2. Select **target language** (right dropdown)
3. Type your text — translation is automatic after a short pause
4. Or click **Translate** button manually
5. Click ⇄ to swap languages
6. Click **copy** to copy the translated text
7. Click any item in **Recent translations** to reload it

---

## Supported Languages (36)

English, Hindi, German, French, Spanish, Italian, Portuguese, Russian,
Chinese (Simplified), Japanese, Korean, Arabic, Dutch, Polish, Swedish,
Turkish, Ukrainian, Czech, Danish, Finnish, Greek, Hungarian, Norwegian,
Romanian, Slovak, Bulgarian, Catalan, Croatian, Lithuanian, Latvian,
Slovenian, Estonian, Persian, Hebrew, Indonesian, Vietnamese

---

## Architecture

```
React Frontend (port 3000)
        |
        | HTTP POST /api/translate
        ↓
Express Backend (port 3001)
        |
        | gRPC + TLS + metadata
        | (Authorization: Bearer nvapi-...)
        | (function-id: 0778f2eb-...)
        ↓
grpc.nvcf.nvidia.com:443
   NVIDIA Riva Translate 1.6b
```

> ⚠ Riva uses gRPC, not REST. The backend is required — the browser
> cannot speak gRPC directly to NVIDIA's servers.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Backend offline" in status bar | Run `cd backend && npm start` |
| "API key not set" warning | Edit `backend/.env` with your `nvapi-` key |
| gRPC auth error | Check key is correct and not expired |
| Port 3001 already in use | Change `PORT=3002` in `backend/.env` |
| `npm install` fails | Ensure Node.js v18+ is installed |

---

## Environment Variables (backend/.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `NVIDIA_API_KEY` | Your NVIDIA API key (required) | — |
| `RIVA_SERVER` | gRPC endpoint | `grpc.nvcf.nvidia.com:443` |
| `RIVA_FUNCTION_ID` | NIM function ID | `0778f2eb-...` |
| `PORT` | Backend HTTP port | `3001` |
