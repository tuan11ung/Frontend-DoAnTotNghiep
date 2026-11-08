export const RESET_DEMO_OTP = '123456';
export const RESET_OTP_LIFETIME_MS = 5 * 60 * 1000;
export const RESET_RESEND_DELAY_MS = 30 * 1000;
export function resetEmailError(value: string): string {
  return value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.';
}
export function resetPasswordErrors(values: { otp: string; password: string; confirmation: string }, expiresAt: number, now = Date.now()): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!/^\d{6}$/.test(values.otp)) errors.otp = 'Vui lòng nhập đủ 6 chữ số OTP.';
  else if (now >= expiresAt) errors.otp = 'Mã OTP đã hết hạn. Vui lòng gửi lại mã.';
  else if (values.otp !== RESET_DEMO_OTP) errors.otp = 'Mã OTP chưa đúng. Vui lòng kiểm tra lại.';
  if (values.password.length < 8 || values.password.length > 255 || !/[a-zA-Z]/.test(values.password) || !/\d/.test(values.password)) errors.password = 'Mật khẩu cần từ 8 đến 255 ký tự, bao gồm chữ và số.';
  if (!values.confirmation) errors.confirmation = 'Vui lòng nhập lại mật khẩu mới.';
  else if (values.password !== values.confirmation) errors.confirmation = 'Mật khẩu nhập lại chưa khớp.';
  return errors;
}
