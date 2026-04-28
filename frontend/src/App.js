import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Language list ────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'nb', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'Catalan', flag: '🏴' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080b10;
    --bg2: #0d1117;
    --bg3: #111820;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.13);
    --green: #76EE94;
    --green-dim: rgba(118,238,148,0.12);
    --green-glow: rgba(118,238,148,0.25);
    --text: #e8edf5;
    --text2: #7a8899;
    --text3: #3d4d5c;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    --display: 'Syne', sans-serif;
  }

  html, body, #root {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    position: relative;
    overflow-x: hidden;
  }

  /* Subtle grid background */
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(118,238,148,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(118,238,148,0.015) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  .noise {
    position: fixed;
    inset: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }

  /* Header */
  .header {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2.5rem;
    border-bottom: 1px solid var(--border);
    background: rgba(8,11,16,0.8);
    backdrop-filter: blur(12px);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    border: 1.5px solid var(--green);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--green);
    letter-spacing: -1px;
    box-shadow: 0 0 12px var(--green-glow);
  }

  .logo-text {
    font-family: var(--display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text);
  }

  .logo-sub {
    font-family: var(--mono);
    font-size: 10px;
    color: var(--text2);
    letter-spacing: 0.1em;
    margin-top: 1px;
  }

  .badge {
    font-family: var(--mono);
    font-size: 11px;
    padding: 4px 10px;
    border: 1px solid rgba(118,238,148,0.3);
    border-radius: 20px;
    color: var(--green);
    background: var(--green-dim);
    letter-spacing: 0.05em;
  }

  /* Status bar */
  .status-bar {
    position: relative;
    z-index: 10;
    padding: 0.6rem 2.5rem;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 11px;
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--text3);
    transition: all 0.3s;
  }
  .status-dot.ok { background: var(--green); box-shadow: 0 0 6px var(--green-glow); }
  .status-dot.warn { background: #f0a500; }
  .status-dot.err { background: #ff5555; }

  .status-text { color: var(--text2); }

  /* Main */
  .main {
    flex: 1;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    padding: 3rem 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .headline {
    font-family: var(--display);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1.05;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .headline em {
    font-style: normal;
    color: var(--green);
    text-shadow: 0 0 40px var(--green-glow);
  }

  .sub-headline {
    font-size: 14px;
    color: var(--text2);
    margin-bottom: 3rem;
    font-family: var(--mono);
    letter-spacing: 0.02em;
  }

  /* Translator card */
  .translator {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  /* Lang bar */
  .lang-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    border-bottom: 1px solid var(--border);
    background: var(--bg3);
  }

  .lang-select-wrap {
    padding: 1rem 1.5rem;
  }

  .lang-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--text3);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .lang-select {
    background: transparent;
    border: none;
    color: var(--text);
    font-family: var(--display);
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    outline: none;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
  }

  .lang-select option {
    background: #1a2030;
    color: var(--text);
    font-family: var(--sans);
    font-size: 14px;
  }

  .swap-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border2);
    background: var(--bg);
    color: var(--text2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .swap-btn:hover {
    border-color: var(--green);
    color: var(--green);
    box-shadow: 0 0 12px var(--green-glow);
    transform: rotate(180deg);
  }

  /* Text panels */
  .panels {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    min-height: 300px;
  }

  .divider {
    background: var(--border);
  }

  .panel {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .panel-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--sans);
    font-size: 17px;
    line-height: 1.7;
    padding: 1.5rem;
    resize: none;
    min-height: 260px;
    width: 100%;
  }

  .panel-textarea::placeholder {
    color: var(--text3);
  }

  .panel-output {
    flex: 1;
    padding: 1.5rem;
    font-size: 17px;
    line-height: 1.7;
    min-height: 260px;
    color: var(--text);
    position: relative;
  }

  .panel-output.empty { color: var(--text3); font-style: italic; }
  .panel-output.loading { color: var(--text2); }

  /* Shimmer loader */
  .shimmer {
    display: inline-block;
    width: 60%;
    height: 1em;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--bg3) 25%, var(--border) 50%, var(--bg3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .shimmer:nth-child(2) { width: 45%; animation-delay: 0.2s; }
  .shimmer:nth-child(3) { width: 70%; animation-delay: 0.4s; }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Panel footer */
  .panel-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    border-top: 1px solid var(--border);
  }

  .char-count {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text3);
  }

  .clear-btn, .copy-btn-sm {
    font-family: var(--mono);
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text2);
    cursor: pointer;
    transition: all 0.15s;
    letter-spacing: 0.05em;
  }

  .clear-btn:hover, .copy-btn-sm:hover {
    border-color: var(--green);
    color: var(--green);
    background: var(--green-dim);
  }

  /* Translate button */
  .action-bar {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .translate-btn {
    flex: 1;
    padding: 0.9rem 2rem;
    background: var(--green);
    color: #080b10;
    border: none;
    border-radius: 10px;
    font-family: var(--display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 0 24px rgba(118,238,148,0.3);
    position: relative;
    overflow: hidden;
  }

  .translate-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.2s;
  }

  .translate-btn:hover::before { background: rgba(255,255,255,0.1); }
  .translate-btn:active { transform: scale(0.98); }
  .translate-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }

  .translate-btn.loading {
    pointer-events: none;
  }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(8,11,16,0.3);
    border-top-color: #080b10;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error */
  .error-box {
    margin: 0 1.5rem 1rem;
    padding: 0.75rem 1rem;
    background: rgba(255,85,85,0.08);
    border: 1px solid rgba(255,85,85,0.25);
    border-radius: 8px;
    color: #ff8888;
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1.5;
  }

  /* History */
  .history-section {
    margin-top: 3rem;
  }

  .section-title {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);
    margin-bottom: 1rem;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .history-item {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.875rem 1.25rem;
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    align-items: start;
    gap: 1rem;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .history-item:hover { border-color: var(--border2); }

  .hist-lang {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text3);
    padding-top: 2px;
    white-space: nowrap;
    letter-spacing: 0.05em;
  }

  .hist-text {
    font-size: 13px;
    color: var(--text2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .hist-arrow {
    color: var(--text3);
    font-size: 12px;
    padding-top: 2px;
  }

  /* Footer */
  .footer {
    position: relative;
    z-index: 10;
    padding: 1.25rem 2.5rem;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text3);
  }

  .footer a { color: var(--text3); text-decoration: none; }
  .footer a:hover { color: var(--green); }

  /* Key input modal */
  .key-banner {
    margin-bottom: 1.5rem;
    padding: 1rem 1.5rem;
    background: rgba(240,165,0,0.06);
    border: 1px solid rgba(240,165,0,0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .key-banner p {
    flex: 1;
    font-size: 13px;
    color: #f0b040;
    font-family: var(--mono);
    line-height: 1.5;
  }

  /* Copy success */
  .copy-success {
    color: var(--green) !important;
    border-color: var(--green) !important;
  }

  @media (max-width: 700px) {
    .header { padding: 1rem; }
    .main { padding: 1.5rem 1rem; }
    .panels { grid-template-columns: 1fr; grid-template-rows: 1fr 4px 1fr; }
    .divider { width: 100%; height: 1px; }
    .lang-bar { grid-template-columns: 1fr auto 1fr; }
    .history-item { grid-template-columns: 1fr; gap: 4px; }
    .hist-arrow { display: none; }
    .footer { flex-direction: column; gap: 4px; }
  }
`;

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking'); // 'ok' | 'warn' | 'err' | 'checking'
  const [statusMsg, setStatusMsg] = useState('checking connection...');
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        if (data.apiKeyConfigured) {
          setApiStatus('ok');
          setStatusMsg('connected · riva-translate-1.6b · grpc.nvcf.nvidia.com');
        } else {
          setApiStatus('warn');
          setStatusMsg('api key not set — update backend/.env');
        }
      })
      .catch(() => {
        setApiStatus('err');
        setStatusMsg('backend offline — run: cd backend && npm start');
      });
  }, []);

  const getLangName = (code) => LANGUAGES.find(l => l.code === code)?.name || code;
  const getLangFlag = (code) => LANGUAGES.find(l => l.code === code)?.flag || '';

  const translate = useCallback(async (text, src, tgt) => {
    if (!text.trim()) { setOutputText(''); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang: src, targetLang: tgt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed');
      setOutputText(data.translation);
      setHistory(prev => [
        { id: Date.now(), src, tgt, input: text, output: data.translation },
        ...prev.slice(0, 9),
      ]);
    } catch (e) {
      setError(e.message);
      setOutputText('');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => translate(val, sourceLang, targetLang), 800);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText('');
    if (outputText) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => translate(outputText, targetLang, sourceLang), 100);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistoryClick = (item) => {
    setSourceLang(item.src);
    setTargetLang(item.tgt);
    setInputText(item.input);
    setOutputText(item.output);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="noise" />

        {/* Header */}
        <header className="header">
          <div className="logo">
            <div className="logo-mark">Rv</div>
            <div>
              <div className="logo-text">Riva Translate</div>
              <div className="logo-sub">NVIDIA NIM</div>
            </div>
          </div>
          <div className="badge">36 LANGUAGES</div>
        </header>

        {/* Status */}
        <div className="status-bar">
          <div className={`status-dot ${apiStatus}`} />
          <span className="status-text">{statusMsg}</span>
        </div>

        {/* Main */}
        <main className="main">
          <h1 className="headline">
            Translate<br />
            <em>anything.</em>
          </h1>
          <p className="sub-headline">powered by riva-translate-1.6b · neural machine translation</p>

          {apiStatus === 'warn' && (
            <div className="key-banner">
              <p>
                ⚠ Set your API key in <code>backend/.env</code> → <code>NVIDIA_API_KEY=nvapi-...</code>
                &nbsp;then restart the backend server.
              </p>
            </div>
          )}

          {apiStatus === 'err' && (
            <div className="key-banner" style={{ borderColor: 'rgba(255,85,85,0.3)', background: 'rgba(255,85,85,0.05)' }}>
              <p style={{ color: '#ff8888' }}>
                ✗ Backend is not running.&nbsp;
                Open a terminal: <code>cd backend &amp;&amp; npm install &amp;&amp; npm start</code>
              </p>
            </div>
          )}

          {/* Translator */}
          <div className="translator">
            {/* Language bar */}
            <div className="lang-bar">
              <div className="lang-select-wrap">
                <div className="lang-label">From</div>
                <select
                  className="lang-select"
                  value={sourceLang}
                  onChange={e => { setSourceLang(e.target.value); setOutputText(''); }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>

              <button className="swap-btn" onClick={handleSwap} title="Swap languages">⇄</button>

              <div className="lang-select-wrap">
                <div className="lang-label">To</div>
                <select
                  className="lang-select"
                  value={targetLang}
                  onChange={e => { setTargetLang(e.target.value); setOutputText(''); }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Text panels */}
            <div className="panels">
              <div className="panel">
                <textarea
                  className="panel-textarea"
                  placeholder={`Type in ${getLangName(sourceLang)}...`}
                  value={inputText}
                  onChange={handleInput}
                  maxLength={2000}
                />
                <div className="panel-footer">
                  <span className="char-count">{inputText.length} / 2000</span>
                  {inputText && (
                    <button className="clear-btn" onClick={() => { setInputText(''); setOutputText(''); }}>
                      clear
                    </button>
                  )}
                </div>
              </div>

              <div className="divider" />

              <div className="panel">
                <div className={`panel-output ${!outputText && !loading ? 'empty' : ''} ${loading ? 'loading' : ''}`}>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="shimmer" />
                      <div className="shimmer" />
                      <div className="shimmer" />
                    </div>
                  ) : outputText ? (
                    outputText
                  ) : (
                    `Translation appears here...`
                  )}
                </div>
                <div className="panel-footer">
                  <span className="char-count">{outputText.length} chars</span>
                  {outputText && (
                    <button
                      className={`copy-btn-sm ${copied ? 'copy-success' : ''}`}
                      onClick={handleCopy}
                    >
                      {copied ? '✓ copied' : 'copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && <div className="error-box">✗ {error}</div>}

            {/* Action bar */}
            <div className="action-bar">
              <button
                className={`translate-btn ${loading ? 'loading' : ''}`}
                onClick={() => translate(inputText, sourceLang, targetLang)}
                disabled={loading || !inputText.trim()}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Translating...' : `Translate to ${getLangName(targetLang)}`}
              </button>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="history-section">
              <div className="section-title">Recent translations</div>
              <div className="history-list">
                {history.map(item => (
                  <div
                    key={item.id}
                    className="history-item"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <span className="hist-lang">{getLangFlag(item.src)} {item.src.toUpperCase()}</span>
                    <span className="hist-text">{item.input}</span>
                    <span className="hist-arrow">→</span>
                    <span className="hist-text" style={{ color: 'var(--text)' }}>{item.output}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <span>riva-translate-1.6b · megatron nmt · 36 languages any-to-any</span>
          <span>
            <a href="https://build.nvidia.com/nvidia/riva-translate-1_6b" target="_blank" rel="noreferrer">
              nvidia nim docs ↗
            </a>
          </span>
        </footer>
      </div>
    </>
  );
}
