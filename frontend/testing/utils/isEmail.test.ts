import { describe, it, expect } from 'vitest';
import { isEmail } from '@/utils';

describe('isEmail', () => {
    it('returns true for a standard valid email', () => {
        expect(isEmail('user@example.com')).toBe(true);
    });

    it('returns true for an email with a subdomain', () => {
        expect(isEmail('user@mail.example.com')).toBe(true);
    });

    it('returns true for an email with a plus sign', () => {
        expect(isEmail('user+tag@example.com')).toBe(true);
    });

    it('returns true for an email with numbers', () => {
        expect(isEmail('user123@example123.com')).toBe(true);
    });

    it('returns false for a string without an @ symbol', () => {
        expect(isEmail('userexample.com')).toBe(false);
    });

    it('returns false for an email without a domain', () => {
        expect(isEmail('user@')).toBe(false);
    });

    it('returns false for an email without a local part', () => {
        expect(isEmail('@example.com')).toBe(false);
    });

    it('returns false for an empty string', () => {
        expect(isEmail('')).toBe(false);
    });

    it('returns false for a string with spaces in the local part', () => {
        expect(isEmail('user name@example.com')).toBe(false);
    });

    it('returns false for a string with spaces in the domain', () => {
        expect(isEmail('user@exam ple.com')).toBe(false);
    });

    it('returns false for a string that is only spaces', () => {
        expect(isEmail('   ')).toBe(false);
    });

    it('returns false when domain has no TLD', () => {
        expect(isEmail('user@example')).toBe(false);
    });
});
