import api from '@/services/api';

export interface CheckinResponse {
  checkin: boolean;
  trainDate: string;
}

export interface CalendarDay {
  date: string;
  checkin: boolean;
}

export interface GoalResponse {
  id: number;
  userId: number;
  weeklyCheckinTarget: number;
  monthlyCheckinTarget: number;
}

export interface GoalProgressResponse {
  target: number;
  current: number;
  percentage: number;
  startDate: string;
  endDate: string;
  type: string;
}

export const fetchTodayCheckin = async (): Promise<CheckinResponse> => {
  const res = await api.get<{ code: number; data: CheckinResponse }>('/api/training/checkin/today');
  return res.data.data;
};

export const doCheckin = async (trainDate: string): Promise<CheckinResponse> => {
  const res = await api.post<{ code: number; data: CheckinResponse }>('/api/training/checkin', { trainDate });
  return res.data.data;
};

export const fetchCalendar = async (year: number, month: number): Promise<CalendarDay[]> => {
  const res = await api.get<{ code: number; data: CalendarDay[] }>('/api/training/checkin/calendar', {
    params: { year, month },
  });
  return res.data.data;
};

export const fetchGoal = async (): Promise<GoalResponse> => {
  const res = await api.get<{ code: number; data: GoalResponse }>('/api/training/goal');
  return res.data.data;
};

export const saveGoal = async (data: {
  weeklyCheckinTarget?: number;
  monthlyCheckinTarget?: number;
}): Promise<GoalResponse> => {
  const res = await api.post<{ code: number; data: GoalResponse }>('/api/training/goal', data);
  return res.data.data;
};

export const fetchGoalProgress = async (type: string): Promise<GoalProgressResponse> => {
  const res = await api.get<{ code: number; data: GoalProgressResponse }>('/api/training/goal/progress', {
    params: { type },
  });
  return res.data.data;
};
