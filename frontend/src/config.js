// API base URL — reads the Render env var in production, falls back to
// the CRA dev proxy (empty string = same origin) in local development.
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export default API_BASE_URL;