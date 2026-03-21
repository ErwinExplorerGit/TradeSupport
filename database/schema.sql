-- TradeSupport Database Schema
-- This script creates all tables and indexes for the application
-- Run this file using: psql -h localhost -U postgres -d tradedb -f schema.sql

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       CHAR(60)        NOT NULL,
    refresh_token_hash  CHAR(64),
    refresh_expires_at  TIMESTAMPTZ,
    reset_token_hash    CHAR(64),
    reset_expires_at    TIMESTAMPTZ,
    failed_login_count  SMALLINT        NOT NULL DEFAULT 0,
    is_locked           BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)    NOT NULL,
    ticker      VARCHAR(10)     NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_ticker ON companies (UPPER(ticker));

-- ============================================
-- USER_COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_companies (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id  UUID    NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_companies_user_id    ON user_companies (user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies (company_id);

-- ============================================
-- SCAN_HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scan_history (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_company_id     UUID        NOT NULL REFERENCES user_companies(id) ON DELETE CASCADE,
    scanned_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    result              TEXT
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user_company_id ON scan_history (user_company_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at       ON scan_history (scanned_at DESC);
