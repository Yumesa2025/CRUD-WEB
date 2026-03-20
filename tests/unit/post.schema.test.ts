import { describe, it, expect } from 'vitest';
import { postFormSchema } from '@/types/post.schema';
import { z } from 'zod';

// 회원가입 스키마도 같이 테스트
const signupSchema = z
  .object({
    email: z.string().email(),
    username: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[a-zA-Z0-9가-힣]+$/),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
  });

// ─── postFormSchema ────────────────────────────────────────────────────────────

describe('postFormSchema - 제목', () => {
  it('제목 4자 → 실패', () => {
    const result = postFormSchema.safeParse({ title: '네글', content: '본문 열 글자 이상이어야함' });
    expect(result.success).toBe(false);
  });

  it('제목 5자 → 성공', () => {
    const result = postFormSchema.safeParse({ title: '다섯글자제', content: '본문 열 글자 이상이어야함' });
    expect(result.success).toBe(true);
  });

  it('제목 21자 → 실패', () => {
    const result = postFormSchema.safeParse({ title: '가'.repeat(21), content: '본문 열 글자 이상이어야함' });
    expect(result.success).toBe(false);
  });
});

describe('postFormSchema - 본문', () => {
  it('본문 9자 → 실패', () => {
    const result = postFormSchema.safeParse({ title: '다섯글자제목', content: '짧은글임' });
    expect(result.success).toBe(false);
  });

  it('본문 10자 → 성공', () => {
    const result = postFormSchema.safeParse({ title: '다섯글자제목', content: '본문 열 글자 이상이어야함' });
    expect(result.success).toBe(true);
  });

  it('본문 1001자 → 실패', () => {
    const result = postFormSchema.safeParse({ title: '다섯글자제목', content: 'a'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('본문 1000자 → 성공', () => {
    const result = postFormSchema.safeParse({ title: '다섯글자제목', content: 'a'.repeat(1000) });
    expect(result.success).toBe(true);
  });
});

// ─── signupSchema ──────────────────────────────────────────────────────────────

describe('signupSchema - 유저네임', () => {
  it('특수문자 포함 → 실패', () => {
    const result = signupSchema.safeParse({
      email: 'test@test.com',
      username: 'user!@#',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });
    expect(result.success).toBe(false);
  });

  it('영문+숫자만 → 성공', () => {
    const result = signupSchema.safeParse({
      email: 'test@test.com',
      username: 'user123',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });
    expect(result.success).toBe(true);
  });
});

describe('signupSchema - 비밀번호', () => {
  it('숫자만 → 실패 (영문 미포함)', () => {
    const result = signupSchema.safeParse({
      email: 'test@test.com',
      username: 'user123',
      password: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(false);
  });

  it('영문만 → 실패 (숫자 미포함)', () => {
    const result = signupSchema.safeParse({
      email: 'test@test.com',
      username: 'user123',
      password: 'abcdefgh',
      confirmPassword: 'abcdefgh',
    });
    expect(result.success).toBe(false);
  });

  it('영문+숫자 조합 → 성공', () => {
    const result = signupSchema.safeParse({
      email: 'test@test.com',
      username: 'user123',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });
    expect(result.success).toBe(true);
  });

  it('비밀번호 불일치 → 실패', () => {
    const result = signupSchema.safeParse({
      email: 'test@test.com',
      username: 'user123',
      password: 'pass1234',
      confirmPassword: 'pass9999',
    });
    expect(result.success).toBe(false);
  });
});
