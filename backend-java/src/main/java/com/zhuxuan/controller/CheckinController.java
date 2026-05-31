package com.zhuxuan.controller;

import com.zhuxuan.dto.CalendarDayDTO;
import com.zhuxuan.dto.CheckinRequest;
import com.zhuxuan.dto.CheckinResponse;
import com.zhuxuan.dto.Result;
import com.zhuxuan.exception.BusinessException;
import com.zhuxuan.service.CheckinService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinService checkinService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) throw BusinessException.unauthorized("用户未认证");
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof Long)) throw BusinessException.unauthorized("认证信息异常");
        return (Long) principal;
    }

    @PostMapping("/checkin")
    public Result<CheckinResponse> checkin(@RequestBody CheckinRequest request) {
        Long userId = getCurrentUserId();
        return Result.success(checkinService.checkin(userId, request.getTrainDate()));
    }

    @GetMapping("/checkin/today")
    public Result<CheckinResponse> getTodayStatus() {
        Long userId = getCurrentUserId();
        return Result.success(checkinService.getTodayStatus(userId));
    }

    @GetMapping("/checkin/calendar")
    public Result<List<CalendarDayDTO>> getCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        Long userId = getCurrentUserId();
        return Result.success(checkinService.getCalendar(userId, year, month));
    }
}
