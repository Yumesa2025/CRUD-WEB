import { describe, it, expect } from 'vitest';
import { formatDate, truncate, isValidEmail } from '@/utils/format';

describe('formatDate', () => {
  it('유효한 날짜 문자열 → YYYY.MM.DD 형식 반환', () => {
    expect(formatDate('2024-03-05T12:00:00Z')).toBe('2024.03.05');
  });

  it('월/일이 한 자리일 때 0 패딩', () => {
    expect(formatDate('2024-01-09T00:00:00Z')).toBe('2024.01.09');
  });

  it('유효하지 않은 날짜 → 빈 문자열 반환', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});

describe('truncate', () => {
  it('maxLength 이하 텍스트 → 그대로 반환', () => {
    expect(truncate('안녕하세요', 10)).toBe('안녕하세요');
  });

  it('maxLength 초과 → 잘라서 ... 추가', () => {
    expect(truncate('안녕하세요반갑습니다', 5)).toBe('안녕하세요...');
  });

  it('정확히 maxLength → 그대로 반환', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });

  it('빈 문자열 → 빈 문자열 반환', () => {
    expect(truncate('', 5)).toBe('');
  });
});

describe('isValidEmail', () => {
  it('올바른 이메일 → true', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('@ 없음 → false', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('도메인 없음 → false', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('빈 문자열 → false', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
