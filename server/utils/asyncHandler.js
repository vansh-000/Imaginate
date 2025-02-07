const asyncHandler = (fn) => {
  Promise.resolve(fn(req, req, next)).catch((err) => next(err));
};

export { asyncHandler };
