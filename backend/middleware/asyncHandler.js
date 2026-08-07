// Express doesn't automatically catch errors thrown inside an async route
// handler. Wrapping a handler with this passes any error along to Express's
// error handler instead of the request just hanging or crashing the server.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
