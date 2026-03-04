const OTPTemplate = require('../../template/OTP');

describe('OTP Email Template', () => {
  it('should return HTML string containing the name', () => {
    const html = OTPTemplate({ name: 'John', otp: '1234' });
    expect(typeof html).toBe('string');
    expect(html).toContain('John');
  });

  it('should return HTML string containing the OTP', () => {
    const html = OTPTemplate({ name: 'Jane', otp: '5678' });
    expect(html).toContain('5678');
  });

  it('should return valid HTML with doctype', () => {
    const html = OTPTemplate({ name: 'Test', otp: '0000' });
    expect(html).toContain('<!DOCTYPE');
  });

  it('should handle special characters in name', () => {
    const html = OTPTemplate({ name: 'O\'Brien', otp: '1111' });
    expect(html).toContain('O\'Brien');
  });
});
