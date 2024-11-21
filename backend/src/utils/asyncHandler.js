const asyncHandler = (requestHandler) => {
  // promise method
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// const asyncHandler1 = () => {};
// const asyncHandler1 = (func) => {}; // higher order function which taking another function as parameter
// const asyncHandler1 = (func) => {() => {}};
// const asyncHandler1 = (func) => {async () => {}}; // using async in the inside callback(arrow function)

// const asyncHandler1 = (func) => async () => {}; // we just removed the braces for readablity.

// const asyncHandler1 = (func) => async (req, res, next) => { // try catch method
//   try {
//     await func(req, res, next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//       sucess: false, // json flags
//       message: error.message,
//     });
//   }
// };
