import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const COUNTER_FILE = path.join(DATA_DIR, 'submission-counter.json');

type CounterState = { year: number; seq: number };

function readState(): CounterState {
  const year = new Date().getFullYear();
  if (!fs.existsSync(COUNTER_FILE)) {
    return { year, seq: 0 };
  }
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf8');
    const parsed = JSON.parse(raw) as CounterState;
    if (typeof parsed.year !== 'number' || typeof parsed.seq !== 'number') {
      return { year, seq: 0 };
    }
    if (parsed.year !== year) {
      return { year, seq: 0 };
    }
    return parsed;
  } catch {
    return { year, seq: 0 };
  }
}

/** Numéro du type EST-2026-0001 (séquentiel par année, persistant sur disque). */
export function nextSubmissionNumber(): string {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const state = readState();
  const year = new Date().getFullYear();
  const next: CounterState =
    state.year === year ? { year, seq: state.seq + 1 } : { year, seq: 1 };
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(next, null, 2), 'utf8');
  return `EST-${year}-${String(next.seq).padStart(4, '0')}`;
}
