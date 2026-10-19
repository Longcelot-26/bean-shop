
class ServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status || 400;
    this.expose = true; 
  }
}
class ValidationError extends ServiceError {
  constructor(message) { super(message, 400); }
}
class NotFoundError extends ServiceError {
  constructor(message) { super(message, 404); }
}
class EmptyCartError extends ServiceError {
  constructor(message) { super(message || 'Giỏ hàng trống', 400); }
}

module.exports = { ServiceError, ValidationError, NotFoundError, EmptyCartError };
