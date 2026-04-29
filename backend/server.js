require('dotenv').config();
const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
// ADD THIS instead:
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

const PROTO_PATH = path.join(__dirname, 'proto', 'riva_nmt.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const rivaProto = grpc.loadPackageDefinition(packageDef).nvidia.riva.nmt;

const client = new rivaProto.RivaTranslation(
  process.env.RIVA_SERVER || 'grpc.nvcf.nvidia.com:443',
  grpc.credentials.createSsl(),
  {
    'grpc.keepalive_time_ms': 10000,
    'grpc.keepalive_timeout_ms': 5000,
  }
);

const RIVA_MODEL = (process.env.RIVA_MODEL || '').trim();

function buildMetadata() {
  const metadata = new grpc.Metadata();
  metadata.add('function-id', process.env.RIVA_FUNCTION_ID);
  metadata.add('authorization', `Bearer ${process.env.NVIDIA_API_KEY}`);
  return metadata;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) return [value];
  return [];
}

function extractSupportedModels(response) {
  const rawLanguages = response && response.languages ? response.languages : {};

  if (Array.isArray(rawLanguages)) {
    return rawLanguages.map((entry) => ({
      model: entry.key,
      sourceLanguages: toArray(entry.value && entry.value.src_lang),
      targetLanguages: toArray(entry.value && entry.value.tgt_lang),
    }));
  }

  return Object.entries(rawLanguages).map(([model, value]) => ({
    model,
    sourceLanguages: toArray(value && value.src_lang),
    targetLanguages: toArray(value && value.tgt_lang),
  }));
}

function resolveModelForPair(sourceLang, targetLang, cb) {
  if (RIVA_MODEL) {
    return cb(null, RIVA_MODEL);
  }

  client.ListSupportedLanguagePairs({ model: '' }, buildMetadata(), (err, response) => {
    if (err) {
      return cb(err);
    }

    const models = extractSupportedModels(response);
    const match = models.find(
      (entry) =>
        entry.sourceLanguages.includes(sourceLang) &&
        entry.targetLanguages.includes(targetLang)
    );

    if (!match) {
      const availablePairs = models
        .map((entry) => `${entry.model}: ${entry.sourceLanguages.join(',')} -> ${entry.targetLanguages.join(',')}`)
        .join(' | ');

      return cb(
        new Error(
          availablePairs
            ? `No deployed model supports ${sourceLang} -> ${targetLang}. Available: ${availablePairs}`
            : 'No deployed translation models were returned by the server.'
        )
      );
    }

    cb(null, match.model);
  });
}

const STATIC_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'nb', name: 'Norwegian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'hr', name: 'Croatian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'et', name: 'Estonian' },
  { code: 'fa', name: 'Persian' },
  { code: 'he', name: 'Hebrew' },
  { code: 'id', name: 'Indonesian' },
  { code: 'vi', name: 'Vietnamese' },
];

app.get('/api/health', (req, res) => {
  const keySet =
    !!process.env.NVIDIA_API_KEY &&
    process.env.NVIDIA_API_KEY !== 'nvapi-your-key-here';

  res.json({
    status: 'ok',
    apiKeyConfigured: keySet,
    server: process.env.RIVA_SERVER,
    functionId: process.env.RIVA_FUNCTION_ID,
    modelOverride: RIVA_MODEL || 'auto-resolve from server',
  });
});

app.post('/api/translate', (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({
      error: 'text, sourceLang, and targetLang are required.',
    });
  }

  if (
    !process.env.NVIDIA_API_KEY ||
    process.env.NVIDIA_API_KEY === 'nvapi-your-key-here'
  ) {
    return res.status(401).json({
      error: 'NVIDIA_API_KEY is not set. Please update backend/.env',
    });
  }

  resolveModelForPair(sourceLang, targetLang, (modelErr, modelName) => {
    if (modelErr) {
      console.error('Model resolution error:', modelErr.message);
      return res.status(400).json({ error: modelErr.message });
    }

    const request = {
      texts: [text],
      model: modelName,
      source_language: sourceLang,
      target_language: targetLang,
    };

    console.log(
      `Translating [${sourceLang} -> ${targetLang}] model=${modelName}: "${text.slice(0, 60)}"`
    );

    client.TranslateText(request, buildMetadata(), (err, response) => {
      if (err) {
        console.error('gRPC error:', err.message);
        return res.status(500).json({
          error: err.message,
          code: err.code,
          details: err.details,
        });
      }

      const translation =
        response && response.translations && response.translations[0]
          ? response.translations[0].text
          : '';

      res.json({ translation, sourceLang, targetLang, model: modelName });
    });
  });
});

app.get('/api/languages', (req, res) => {
  if (
    !process.env.NVIDIA_API_KEY ||
    process.env.NVIDIA_API_KEY === 'nvapi-your-key-here'
  ) {
    return res.json({ pairs: STATIC_LANGUAGES });
  }

  client.ListSupportedLanguagePairs({ model: '' }, buildMetadata(), (err, response) => {
    if (err) {
      console.error('ListLanguages error:', err.message);
      return res.json({ pairs: STATIC_LANGUAGES });
    }

    const models = extractSupportedModels(response);
    res.json({ pairs: models.length > 0 ? models : STATIC_LANGUAGES });
  });
});

app.get('/api/language-list', (req, res) => {
  res.json({ languages: STATIC_LANGUAGES });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\nRiva Translator backend running on http://localhost:${PORT}`);
  console.log(
    `API Key: ${
      process.env.NVIDIA_API_KEY &&
      process.env.NVIDIA_API_KEY !== 'nvapi-your-key-here'
        ? 'set'
        : 'not set'
    }`
  );
  console.log(`gRPC server: ${process.env.RIVA_SERVER}`);
  console.log(`Function ID: ${process.env.RIVA_FUNCTION_ID}`);
  console.log(`Model override: ${RIVA_MODEL || 'auto'}\n`);
});
