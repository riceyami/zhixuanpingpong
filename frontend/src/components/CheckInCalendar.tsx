'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { fetchCalendar } from '@/api/dashboard';
import { useDashboardStore } from '@/stores/dashboardStore';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

const CheckInCalendar = () => {
  const { calendarData, setCalendarData } = useDashboardStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    fetchCalendar(year, month)
      .then((data) => setCalendarData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month, setCalendarData]);

  const checkinMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const d of calendarData) {
      map.set(d.date, d.checkin);
    }
    return map;
  }, [calendarData]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const goPrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <Button type="text" icon={<LeftOutlined />} onClick={goPrevMonth} />
        <Typography.Text strong style={{ fontSize: 16 }}>
          {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </Typography.Text>
        <Button type="text" icon={<RightOutlined />} onClick={goNextMonth} />
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs text-gray-400 font-medium py-1">
            {w}
          </div>
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const checkedIn = checkinMap.get(dateStr) ?? false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={dateStr}
              className={`
                relative py-2 text-sm rounded-full transition-colors
                ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
                ${today ? 'font-bold' : ''}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center w-8 h-8 rounded-full
                  ${today && !checkedIn ? 'ring-2 ring-blue-400' : ''}
                  ${checkedIn ? 'bg-green-500 text-white' : ''}
                  ${today && checkedIn ? 'bg-green-500 text-white ring-2 ring-green-300' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckInCalendar;
