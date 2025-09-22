export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
// 01[0,1,6,7,8,9]-XXX(X)-XXXX (하이픈은 선택)
export const PHONE_KR_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

export function validateEmail(v: string): string | null {
  const value = (v ?? '').trim();
  if (!value) return '이메일은 필수 입력값입니다.';
  if (!EMAIL_RE.test(value)) return '올바른 이메일 형식이 아닙니다.';
  return null;
}

export function validatePassword(v: string): string | null {
  const value = (v ?? '').trim();
  if (!value) return '비밀번호는 필수 입력 값입니다.';
  if (value.length < 8) return '비밀번호는 최소 8자리 이상이어야 합니다.';
  if (!PASSWORD_RE.test(value)) return '비밀번호는 영문자, 숫자, 특수문자를 포함해야 합니다.';
  return null;
}

export function validateRequired(v: string, msg = '필수 입력값입니다.'): string | null {
  return (v ?? '').trim() ? null : msg;
}

export function validatePhoneKR(v: string, required = true): string | null {
  const value = (v ?? '').trim();
  if (!value) return required ? '전화번호는 필수 입력값입니다.' : null;
  if (!PHONE_KR_RE.test(value)) return '전화번호는 올바른 한국 휴대폰 번호 형식이어야 합니다.';
  return null;
}

/** 입력 중 자동 하이픈(010-1234-5678 형태) */
export function formatPhoneKR(input: string): string {
  const digits = (input || '').replace(/[^\d]/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0,3)}-${digits.slice(3)}`;
  return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
}
