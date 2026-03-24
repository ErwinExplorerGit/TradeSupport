-- =============================================================
-- schema.sql
-- Full database schema — run this once against your database
-- =============================================================
-- -------------------------------------------------------------
-- users
-- -------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash CHAR(60) NOT NULL,
        refresh_token_hash CHAR(64),
        refresh_expires_at TIMESTAMPTZ,
        reset_token_hash CHAR(64),
        reset_expires_at TIMESTAMPTZ,
        verification_token_hash CHAR(64),
        verification_expires_at TIMESTAMPTZ,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        failed_login_count SMALLINT NOT NULL DEFAULT 0,
        is_locked BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- -------------------------------------------------------------
-- companies
-- -------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        ticker VARCHAR(10) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_ticker ON companies (UPPER(ticker));

-- -------------------------------------------------------------
-- user_companies
-- -------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS user_companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
        UNIQUE (user_id, company_id)
    );

CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies (user_id);

CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies (company_id);

-- -------------------------------------------------------------
-- scan_history
-- -------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS scan_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_company_id UUID NOT NULL REFERENCES user_companies (id) ON DELETE CASCADE,
        scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        result TEXT
    );

CREATE INDEX IF NOT EXISTS idx_scan_history_user_company_id ON scan_history (user_company_id);

CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at ON scan_history (scanned_at DESC);

-- =============================================================
-- seed data — companies
-- =============================================================
INSERT INTO
    companies (name, ticker)
VALUES
    -- Technology
    ('Apple', 'AAPL'),
    ('Microsoft', 'MSFT'),
    ('NVIDIA', 'NVDA'),
    ('Alphabet', 'GOOGL'),
    ('Amazon', 'AMZN'),
    ('Meta Platforms', 'META'),
    ('Tesla', 'TSLA'),
    ('Broadcom', 'AVGO'),
    ('Taiwan Semiconductor', 'TSM'),
    ('ASML Holding', 'ASML'),
    ('Samsung Electronics', 'SSNLF'),
    ('Intel', 'INTC'),
    ('Advanced Micro Devices', 'AMD'),
    ('Qualcomm', 'QCOM'),
    ('Texas Instruments', 'TXN'),
    ('Applied Materials', 'AMAT'),
    ('Micron Technology', 'MU'),
    ('Salesforce', 'CRM'),
    ('Oracle', 'ORCL'),
    ('SAP', 'SAP'),
    ('Adobe', 'ADBE'),
    ('ServiceNow', 'NOW'),
    ('Snowflake', 'SNOW'),
    ('Palantir Technologies', 'PLTR'),
    ('CrowdStrike', 'CRWD'),
    ('Palo Alto Networks', 'PANW'),
    ('Fortinet', 'FTNT'),
    ('Cloudflare', 'NET'),
    ('Datadog', 'DDOG'),
    ('MongoDB', 'MDB'),
    ('Workday', 'WDAY'),
    ('Intuit', 'INTU'),
    ('Autodesk', 'ADSK'),
    ('Zoom Video', 'ZM'),
    ('Shopify', 'SHOP'),
    ('Block', 'SQ'),
    ('PayPal', 'PYPL'),
    ('Uber Technologies', 'UBER'),
    ('Airbnb', 'ABNB'),
    ('DoorDash', 'DASH'),
    ('Lyft', 'LYFT'),
    ('Spotify Technology', 'SPOT'),
    ('Netflix', 'NFLX'),
    ('Roblox', 'RBLX'),
    ('Unity Software', 'U'),
    ('Riot Platforms', 'RIOT'),
    ('Coinbase Global', 'COIN'),
    -- Financial Services
    ('JPMorgan Chase', 'JPM'),
    ('Bank of America', 'BAC'),
    ('Wells Fargo', 'WFC'),
    ('Goldman Sachs', 'GS'),
    ('Morgan Stanley', 'MS'),
    ('Citigroup', 'C'),
    ('American Express', 'AXP'),
    ('Visa', 'V'),
    ('Mastercard', 'MA'),
    ('BlackRock', 'BLK'),
    ('Charles Schwab', 'SCHW'),
    ('Berkshire Hathaway', 'BRK.B'),
    -- Healthcare & Pharma
    ('Johnson & Johnson', 'JNJ'),
    ('UnitedHealth Group', 'UNH'),
    ('Eli Lilly', 'LLY'),
    ('AbbVie', 'ABBV'),
    ('Merck', 'MRK'),
    ('Pfizer', 'PFE'),
    ('Moderna', 'MRNA'),
    ('Bristol-Myers Squibb', 'BMY'),
    ('Amgen', 'AMGN'),
    ('Gilead Sciences', 'GILD'),
    ('Intuitive Surgical', 'ISRG'),
    ('Medtronic', 'MDT'),
    ('Abbott Laboratories', 'ABT'),
    ('Thermo Fisher Scientific', 'TMO'),
    ('Danaher', 'DHR'),
    -- Consumer
    ('Walmart', 'WMT'),
    ('Costco Wholesale', 'COST'),
    ('Home Depot', 'HD'),
    ('McDonald''s', 'MCD'),
    ('Starbucks', 'SBUX'),
    ('Nike', 'NKE'),
    ('Coca-Cola', 'KO'),
    ('PepsiCo', 'PEP'),
    ('Procter & Gamble', 'PG'),
    ('Colgate-Palmolive', 'CL'),
    ('Unilever', 'UL'),
    ('Nestle', 'NSRGY'),
    ('LVMH', 'LVMUY'),
    ('Hermes International', 'HESAY'),
    ('Lululemon Athletica', 'LULU'),
    ('Target', 'TGT'),
    ('Dollar General', 'DG'),
    -- Energy
    ('ExxonMobil', 'XOM'),
    ('Chevron', 'CVX'),
    ('Shell', 'SHEL'),
    ('BP', 'BP'),
    ('TotalEnergies', 'TTE'),
    ('ConocoPhillips', 'COP'),
    ('Schlumberger', 'SLB'),
    ('NextEra Energy', 'NEE'),
    ('Enphase Energy', 'ENPH'),
    ('First Solar', 'FSLR'),
    -- Industrials & Aerospace
    ('Caterpillar', 'CAT'),
    ('Deere & Company', 'DE'),
    ('Honeywell', 'HON'),
    ('3M', 'MMM'),
    ('General Electric', 'GE'),
    ('Boeing', 'BA'),
    ('Lockheed Martin', 'LMT'),
    ('Raytheon Technologies', 'RTX'),
    ('Northrop Grumman', 'NOC'),
    ('General Dynamics', 'GD'),
    ('Airbus', 'EADSY'),
    -- Telecommunications
    ('AT&T', 'T'),
    ('Verizon', 'VZ'),
    ('T-Mobile', 'TMUS'),
    ('Deutsche Telekom', 'DTEGY'),
    ('SoftBank Group', 'SFTBY'),
    -- Real Estate
    ('American Tower', 'AMT'),
    ('Prologis', 'PLD'),
    ('Crown Castle', 'CCI'),
    ('Equinix', 'EQIX'),
    ('Public Storage', 'PSA'),
    -- Transportation & Logistics
    ('FedEx', 'FDX'),
    ('UPS', 'UPS'),
    ('Union Pacific', 'UNP'),
    ('CSX', 'CSX'),
    ('Delta Air Lines', 'DAL'),
    ('United Airlines', 'UAL'),
    ('American Airlines', 'AAL'),
    -- Automotive
    ('Toyota Motor', 'TM'),
    ('Volkswagen', 'VWAGY'),
    ('General Motors', 'GM'),
    ('Ford Motor', 'F'),
    ('Stellantis', 'STLA'),
    ('Rivian Automotive', 'RIVN'),
    ('Lucid Group', 'LCID'),
    ('BYD Company', 'BYDDY'),
    ('Ferrari', 'RACE') ON CONFLICT DO NOTHING;