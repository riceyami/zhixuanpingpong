import api from '@/services/api';

export interface EvaluationResponse {
  id: number;
  trainDate: string;
  content: string;
  createdAt: string | null;
}

export interface EvaluationPageResponse {
  content: EvaluationResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const saveEvaluation = async (trainDate: string, content: string): Promise<EvaluationResponse> => {
  const res = await api.post<{ code: number; data: EvaluationResponse }>('/api/training/evaluation', { trainDate, content });
  return res.data.data;
};

export const fetchEvaluation = async (date: string): Promise<EvaluationResponse | null> => {
  const res = await api.get<{ code: number; data: EvaluationResponse | null }>('/api/training/evaluation', {
    params: { date },
  });
  return res.data.data;
};

export const fetchEvaluationList = async (
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 20,
): Promise<EvaluationPageResponse> => {
  const res = await api.get<{ code: number; data: EvaluationPageResponse }>('/api/training/evaluation/list', {
    params: { startDate, endDate, page, size },
  });
  return res.data.data;
};
