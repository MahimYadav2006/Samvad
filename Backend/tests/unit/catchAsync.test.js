const catchAsync = require('../../utilities/catchAsync');

describe('catchAsync utility', () => {
  it('should return a function', () => {
    const fn = catchAsync(async () => {});
    expect(typeof fn).toBe('function');
  });

  it('should call the async function with req, res, next', async () => {
    const mockFn = jest.fn().mockResolvedValue('ok');
    const wrapped = catchAsync(mockFn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);
    expect(mockFn).toHaveBeenCalledWith(req, res, next);
  });

  it('should catch errors and pass them to next', async () => {
    const error = new Error('Test error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrapped = catchAsync(mockFn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);

    // wait for the promise rejection to be caught
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next on success', async () => {
    const mockFn = jest.fn().mockResolvedValue('ok');
    const wrapped = catchAsync(mockFn);
    const req = {};
    const res = {};
    const next = jest.fn();

    await wrapped(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});
