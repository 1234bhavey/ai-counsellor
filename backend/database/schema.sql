-- AI Counsellor Database Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS shortlists CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    academic_background VARCHAR(100),
    study_goals VARCHAR(100),
    budget VARCHAR(50),
    exam_readiness VARCHAR(50),
    preferred_countries TEXT[],
    current_stage VARCHAR(50) DEFAULT 'exploring',
    ielts_overall DECIMAL(2,1),
    ielts_listening DECIMAL(2,1),
    ielts_reading DECIMAL(2,1),
    ielts_writing DECIMAL(2,1),
    ielts_speaking DECIMAL(2,1),
    ielts_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universities table
CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    tuition_fee VARCHAR(50),
    acceptance_rate INTEGER,
    category VARCHAR(20) CHECK (category IN ('dream', 'target', 'safe')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('Low', 'Medium', 'High')),
    reason TEXT,
    ielts_requirement DECIMAL(2,1) DEFAULT 6.5,
    ielts_minimum DECIMAL(2,1) DEFAULT 6.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shortlists table
CREATE TABLE shortlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, university_id)
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample universities
INSERT INTO universities (name, location, country, tuition_fee, acceptance_rate, category, risk_level, reason, ielts_requirement, ielts_minimum) VALUES
('Stanford University', 'California', 'USA', '$55,000', 4, 'dream', 'High', 'Top-tier university with excellent programs. Highly competitive but great for ambitious students.', 7.0, 6.5),
('MIT', 'Massachusetts', 'USA', '$53,000', 7, 'dream', 'High', 'World-renowned for technology and innovation. Perfect for STEM-focused students.', 7.0, 6.5),
('University of Toronto', 'Toronto', 'Canada', '$35,000', 43, 'target', 'Medium', 'Strong academic reputation with reasonable acceptance rate. Good fit for most profiles.', 6.5, 6.0),
('University of Edinburgh', 'Edinburgh', 'UK', '$25,000', 40, 'target', 'Medium', 'Prestigious UK university with strong international reputation and reasonable costs.', 6.5, 6.0),
('University of Melbourne', 'Melbourne', 'Australia', '$30,000', 70, 'target', 'Medium', 'Top Australian university with excellent programs and good acceptance rate.', 6.5, 6.0),
('Arizona State University', 'Arizona', 'USA', '$28,000', 88, 'safe', 'Low', 'High acceptance rate and good programs. Excellent safety option for applications.', 6.0, 5.5),
('University of Ottawa', 'Ottawa', 'Canada', '$22,000', 75, 'safe', 'Low', 'Affordable Canadian option with good programs and high acceptance rate.', 6.0, 5.5),
('Griffith University', 'Queensland', 'Australia', '$25,000', 80, 'safe', 'Low', 'Well-regarded Australian university with strong support for international students.', 6.0, 5.5);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_shortlists_user_id ON shortlists(user_id);
CREATE INDEX idx_shortlists_university_id ON shortlists(university_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_universities_country ON universities(country);
CREATE INDEX idx_universities_category ON universities(category);