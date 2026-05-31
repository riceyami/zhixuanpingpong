import { create } from 'zustand';
import type { CalendarDay, GoalResponse, GoalProgressResponse } from '@/api/dashboard';

interface DashboardState {
  todayCheckedIn: boolean;
  calendarData: CalendarDay[];
  goal: GoalResponse | null;
  weeklyProgress: GoalProgressResponse | null;
  monthlyProgress: GoalProgressResponse | null;
  refreshKey: number;
  setTodayCheckedIn: (checkedIn: boolean) => void;
  setCalendarData: (data: CalendarDay[]) => void;
  setGoal: (goal: GoalResponse | null) => void;
  setWeeklyProgress: (progress: GoalProgressResponse | null) => void;
  setMonthlyProgress: (progress: GoalProgressResponse | null) => void;
  triggerRefresh: () => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  todayCheckedIn: false,
  calendarData: [],
  goal: null,
  weeklyProgress: null,
  monthlyProgress: null,
  refreshKey: 0,
  setTodayCheckedIn: (checkedIn) => set({ todayCheckedIn: checkedIn }),
  setCalendarData: (data) => set({ calendarData: data }),
  setGoal: (goal) => set({ goal }),
  setWeeklyProgress: (progress) => set({ weeklyProgress: progress }),
  setMonthlyProgress: (progress) => set({ monthlyProgress: progress }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
