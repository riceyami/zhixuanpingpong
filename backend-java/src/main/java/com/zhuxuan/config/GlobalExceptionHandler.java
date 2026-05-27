package com.zhuxuan.config;

import com.zhuxuan.dto.Result;
import com.zhuxuan.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessException(BusinessException e) {
        HttpStatus httpStatus = switch (e.getCode()) {
            case 401 -> HttpStatus.UNAUTHORIZED;
            case 400 -> HttpStatus.BAD_REQUEST;
            case 404 -> HttpStatus.NOT_FOUND;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
        return ResponseEntity.status(httpStatus).body(Result.error(e.getCode(), e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Result<Void>> handleRuntimeException(RuntimeException e) {
        String message = e.getMessage();
        if (message != null && (message.contains("未认证") || message.contains("未登录") || message.contains("认证信息异常"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Result.error(401, message));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Result.error(500, message != null ? message : "服务器内部错误"));
    }
}
