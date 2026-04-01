import { apiClient } from "./apiClient";

export interface RunBatchPayload {
  dataset?: string;
  source_doc?: string;
  concurrency?: number;
  limit?: number;
  offset?: number;
  random_sample?: boolean;
  question_ids?: string[];
}

export interface RunBatchResponse {
  status: string;
  session_id?: string;
  experiment_id?: string;
  project_name?: string;
  total?: number;
  dataset: string;
  langsmith_url: string;
  message: string;
}

export interface EvalSession {
  id: string;
  dataset: string;
  source_doc?: string;
  created_at: string;
  status: string;
  total: number;
  completed: number;
  project_name?: string;
  experiment_id?: string;
  langsmith_url?: string;
  progress_pct: number;
}

export interface EvalSessionsResponse {
  sessions: EvalSession[];
}

export interface EvalRun {
  id: string;
  question_id: string;
  question: string;
  ground_truth: string;
  reference_nodes: string[];
  retrieved_nodes: string[];
  ai_answer: string;
  context_text: string;
  difficulty: string;
  question_type: string;
  expected_behavior: string;
  tags: string[];
  score_correctness: boolean | null;
  score_groundedness: boolean | null;
  score_behavior: boolean | null;
  score_citation: boolean | null;
  retrieval_hit_rate: number;
  retrieval_hit_rate_pct: number;
  scored_at: string | null;
  retrieval_missing: string[];
  retrieval_extra: string[];
}

export interface EvalResultsResponse {
  session: EvalSession;
  runs: EvalRun[];
  total: number;
}

export interface EvalStatsResponse {
  session_id: string;
  total: number;
  scored: number;
  pct_correctness: number;
  pct_groundedness: number;
  pct_behavior: number;
  pct_citation: number;
  avg_retrieval_hit_rate: number;
}

export interface DatasetItem {
  name: string;
  source_docs: string[];
}

export interface EvalDatasetsResponse {
  datasets: DatasetItem[];
  dataset_names: string[];
}

export const evalService = {
  runBatch: async (payload: RunBatchPayload = {}): Promise<RunBatchResponse> => {
    return apiClient.post<RunBatchResponse>("/eval/run-batch", payload, true);
  },

  getSessions: async (limit: number = 20): Promise<EvalSessionsResponse> => {
    return apiClient.get<EvalSessionsResponse>(`/eval/sessions?limit=${limit}`, true);
  },

  getResults: async (sessionId: string): Promise<EvalResultsResponse> => {
    return apiClient.get<EvalResultsResponse>(`/eval/results/${sessionId}`, true);
  },

  getStats: async (sessionId: string): Promise<EvalStatsResponse> => {
    return apiClient.get<EvalStatsResponse>(`/eval/stats/${sessionId}`, true);
  },

  getDatasets: async (): Promise<EvalDatasetsResponse | string[]> => {
    return apiClient.get<EvalDatasetsResponse | string[]>('/eval/datasets', true);
  }
};
