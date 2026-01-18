-- Digital Self Analysis Tables
-- Stores AI-generated insights from journal entries

-- Main insights table
CREATE TABLE IF NOT EXISTS digital_self_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    journal_entries_analyzed INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Core values (array of strings)
CREATE TABLE IF NOT EXISTS digital_self_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL,
    user_id UUID NOT NULL,
    value_name VARCHAR(100) NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotional patterns (descriptive sentences)
CREATE TABLE IF NOT EXISTS digital_self_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL,
    user_id UUID NOT NULL,
    pattern_text TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Identity themes (archetypal descriptions)
CREATE TABLE IF NOT EXISTS digital_self_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL,
    user_id UUID NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tensions (internal conflicts for growth)
CREATE TABLE IF NOT EXISTS digital_self_tensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL,
    user_id UUID NOT NULL,
    tension_description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Floating keywords (for visualization)
CREATE TABLE IF NOT EXISTS digital_self_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_id UUID NOT NULL,
    user_id UUID NOT NULL,
    keyword VARCHAR(50) NOT NULL,
    frequency INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indices
CREATE INDEX IF NOT EXISTS digital_self_insights_user_idx ON digital_self_insights(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS digital_self_values_user_idx ON digital_self_values(user_id, insight_id);
CREATE INDEX IF NOT EXISTS digital_self_patterns_user_idx ON digital_self_patterns(user_id, insight_id);
CREATE INDEX IF NOT EXISTS digital_self_themes_user_idx ON digital_self_themes(user_id, insight_id);
CREATE INDEX IF NOT EXISTS digital_self_tensions_user_idx ON digital_self_tensions(user_id, insight_id);
CREATE INDEX IF NOT EXISTS digital_self_keywords_user_idx ON digital_self_keywords(user_id, insight_id);
