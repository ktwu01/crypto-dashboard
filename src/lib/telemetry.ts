export interface AiInsightsTelemetryEntry {
  capturedAt: number;
  narrative: string;
  datasetHash: string;
}

const STORAGE_KEY = 'telemetry:ai-insights-history';
const MAX_ENTRIES = 48; // roughly two days at one-hour cadence

const hashFacts = (input: unknown) => {
  try {
    const json = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < json.length; i += 1) {
      const chr = json.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  } catch (error) {
    console.warn('Failed to hash AI insights telemetry payload', error);
    return 'na';
  }
};

export const recordAiInsightsTelemetry = (
  narrative: string,
  facts: unknown
) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const history: AiInsightsTelemetryEntry[] = raw ? JSON.parse(raw) : [];
    const nextEntry: AiInsightsTelemetryEntry = {
      capturedAt: Date.now(),
      narrative,
      datasetHash: hashFacts(facts),
    };

    const updated = [nextEntry, ...history].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[Telemetry] Recorded AI insights dataset', nextEntry);
    }
  } catch (error) {
    console.warn('Failed to persist AI insights telemetry', error);
  }
};

export const getAiInsightsTelemetry = (): AiInsightsTelemetryEntry[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AiInsightsTelemetryEntry[]) : [];
  } catch (error) {
    console.warn('Failed to read AI insights telemetry', error);
    return [];
  }
};
