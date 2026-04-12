export const parseApiError = (error: any): string => {
  const msg = error?.response?.data?.error;
  if (!msg) return 'Something went wrong. Please try again.';
  if (msg === 'forbidden') return 'You are not authorized to perform this action.';
  if (msg === 'not found') return 'Resource not found.';
  if (msg === 'unauthorized') return 'Please log in to continue.';
  return msg;
};