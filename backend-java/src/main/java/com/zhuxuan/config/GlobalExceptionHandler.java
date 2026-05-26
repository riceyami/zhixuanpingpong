package com.zhuxuan.config;

import com.zhuxuan.dto.Result;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Result<Void> handleAuthError(RuntimeException e) {
        String message = e.getMessage();
        if (message != null && (message.contains("未认证") || message.contains("未登录") || message.contains("认证信息异常"))) {
            return Result.error(401, message);
        }
        return Result.error(500, message != null ? message : "服务器内部错误");
    }
}
