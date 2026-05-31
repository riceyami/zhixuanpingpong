package com.zhuxuan.service;

import com.zhuxuan.dto.CheckinResponse;
import com.zhuxuan.dto.CalendarDayDTO;

import java.util.List;

public interface CheckinService {

    CheckinResponse checkin(Long userId, String trainDate);

    CheckinResponse getTodayStatus(Long userId);

    List<CalendarDayDTO> getCalendar(Long userId, int year, int month);
}
