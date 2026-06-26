class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = '접근 권한이 없습니다.') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = '리소스를 찾을 수 없습니다.') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = '이미 존재하는 데이터입니다.') {
    super(message, 409);
  }
}

class ValidationError extends AppError {
  constructor(message = '입력값이 올바르지 않습니다.') {
    super(message, 422);
  }
}

module.exports = { AppError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, ValidationError };
