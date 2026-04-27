import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Status ──────────────────────────────────
export const getStatus = () => client.get('/status');

// ─── Dashboard Stats ─────────────────────────
export const getDashboardStats = () => client.get('/stats');

// ─── History ─────────────────────────────────
export const getHistory = (params = {}) => client.get('/history', { params });

export const saveExperiment = (data) => client.post('/history/save', data);

export const saveExperimentsBulk = (experiments) =>
    client.post('/history/save-bulk', { experiments });

export const deleteExperiment = (id) => client.delete(`/history/${id}`);

export const deleteAllExperiments = () => client.delete('/history');

// ─── Export ──────────────────────────────────
export const exportCSV = () =>
    client.get('/export/csv', { responseType: 'blob' });

export const exportPDF = (data) =>
    client.post('/export/pdf', data, { responseType: 'blob' });

// ─── Analysis ────────────────────────────────
export const getRegression = () => client.get('/analysis/regression');

export const getAnova = (inputSize) =>
    client.get('/analysis/anova', { params: { input_size: inputSize } });

// ─── SSE Experiment Runner ───────────────────
export const runExperimentSSE = (config, onMessage, onComplete, onError) => {
    // We use fetch for SSE since axios doesn't support streaming well
    const abortController = new AbortController();

    fetch(`${API_BASE}/experiment/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        signal: abortController.signal,
    })
        .then(async (response) => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'complete') {
                                onComplete(data.results);
                            } else {
                                onMessage(data);
                            }
                        } catch (e) {
                            // skip non-JSON lines
                        }
                    }
                }
            }
        })
        .catch((err) => {
            if (err.name !== 'AbortError') {
                onError(err);
            }
        });

    return () => abortController.abort();
};

export default client;
