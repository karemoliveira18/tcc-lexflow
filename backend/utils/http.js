const buildError = ({ status, code, message, details = [] }) => ({
  status,
  payload: {
    error: {
      code,
      message,
      details,
    },
  },
});

const sendError = (res, { status, code, message, details = [] }) => {
  return res.status(status).json({
    error: {
      code,
      message,
      details,
    },
  });
};

export { buildError, sendError };
