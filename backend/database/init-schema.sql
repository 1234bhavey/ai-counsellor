-- AI Counsellor Database Schema - SAFE INITIALIZATION

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'counsellor', 'admin', 'super_admin')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    academic_background VARCHAR(100),
    study_goals VARCHAR(100),
    budget VARCHAR(50),
    exam_readiness VARCHAR(50),
    preferred_countries TEXT[],
    current_stage VARCHAR(50) DEFAULT 'exploring',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Universities table
CREATE TABLE IF NOT EXISTS universities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    country VARCHAR(100),
    tuition_fee VARCHAR(50),
    acceptance_rate INTEGER,
    category VARCHAR(20) CHECK (category IN ('dream', 'target', 'safe')),
    risk_level VARCHAR(20) CHECK (risk_level IN ('Low', 'Medium', 'High')),
    reason TEXT,
    -- Enhanced fields for better decision making
    world_ranking INTEGER,
    program_strengths TEXT[],
    application_deadline DATE,
    required_tests TEXT[],
    min_gpa DECIMAL(3,2),
    min_ielts DECIMAL(3,1),
    min_toefl INTEGER,
    scholarships_available BOOLEAN DEFAULT FALSE,
    scholarship_amount VARCHAR(50),
    living_cost VARCHAR(50),
    total_cost VARCHAR(50),
    campus_size VARCHAR(50),
    student_population INTEGER,
    international_students_percentage INTEGER,
    employment_rate INTEGER,
    average_salary VARCHAR(50),
    notable_alumni TEXT[],
    university_website VARCHAR(255),
    application_portal VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shortlists table
CREATE TABLE IF NOT EXISTS shortlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, university_id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
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

-- Insert sample universities only if table is empty
INSERT INTO universities (
    name, location, country, tuition_fee, acceptance_rate, category, risk_level, reason,
    world_ranking, program_strengths, application_deadline, required_tests, min_gpa, min_ielts, min_toefl,
    scholarships_available, scholarship_amount, living_cost, total_cost, campus_size, student_population,
    international_students_percentage, employment_rate, average_salary, notable_alumni,
    university_website, application_portal, contact_email
) 
SELECT * FROM (VALUES
    ('Stanford University', 'California', 'USA', '$55,000', 4, 'dream', 'High', 
     'Top-tier university with excellent programs. Highly competitive but great for ambitious students.',
     2, ARRAY['Computer Science', 'Engineering', 'Business', 'Medicine'], '2024-12-01'::DATE,
     ARRAY['SAT/ACT', 'TOEFL/IELTS', 'GRE/GMAT'], 3.8, 7.0, 100,
     true, 'Up to $50,000', '$20,000-25,000', '$75,000-80,000', 'Large (8,180 acres)', 17000,
     23, 94, '$150,000+', ARRAY['Elon Musk', 'Larry Page', 'Reed Hastings'],
     'https://www.stanford.edu', 'https://admission.stanford.edu', 'admission@stanford.edu'),
     
    ('MIT', 'Massachusetts', 'USA', '$53,000', 7, 'dream', 'High', 
     'World-renowned for technology and innovation. Perfect for STEM-focused students.',
     1, ARRAY['Engineering', 'Computer Science', 'Physics', 'Mathematics'], '2024-12-01'::DATE,
     ARRAY['SAT/ACT', 'TOEFL/IELTS', 'Subject Tests'], 3.9, 7.5, 105,
     true, 'Up to $45,000', '$18,000-22,000', '$71,000-75,000', 'Medium (168 acres)', 11500,
     33, 96, '$140,000+', ARRAY['Bill Gates', 'Buzz Aldrin', 'Kofi Annan'],
     'https://www.mit.edu', 'https://mitadmissions.org', 'admissions@mit.edu'),
     
    ('University of Toronto', 'Toronto', 'Canada', '$35,000', 43, 'target', 'Medium', 
     'Strong academic reputation with reasonable acceptance rate. Good fit for most profiles.',
     18, ARRAY['Medicine', 'Engineering', 'Business', 'Arts & Sciences'], '2024-11-15'::DATE,
     ARRAY['IELTS/TOEFL', 'SAT (Optional)'], 3.5, 6.5, 89,
     true, 'Up to $25,000', '$12,000-15,000', '$47,000-50,000', 'Large (714 hectares)', 97000,
     25, 92, '$65,000+', ARRAY['Lester Pearson', 'Margaret Atwood', 'David Frum'],
     'https://www.utoronto.ca', 'https://future.utoronto.ca', 'admissions@utoronto.ca'),
     
    ('University of Edinburgh', 'Edinburgh', 'UK', '$25,000', 40, 'target', 'Medium', 
     'Prestigious UK university with strong international reputation and reasonable costs.',
     16, ARRAY['Medicine', 'Law', 'Literature', 'Sciences'], '2024-10-15'::DATE,
     ARRAY['IELTS/TOEFL', 'A-Levels/IB'], 3.4, 6.5, 92,
     true, 'Up to £15,000', '£10,000-12,000', '£35,000-37,000', 'Medium (Central Edinburgh)', 47000,
     42, 89, '£35,000+', ARRAY['Charles Darwin', 'Arthur Conan Doyle', 'J.K. Rowling'],
     'https://www.ed.ac.uk', 'https://www.ed.ac.uk/studying', 'admissions@ed.ac.uk'),
     
    ('University of Melbourne', 'Melbourne', 'Australia', '$30,000', 70, 'target', 'Medium', 
     'Top Australian university with excellent programs and good acceptance rate.',
     14, ARRAY['Medicine', 'Law', 'Engineering', 'Business'], '2024-10-31'::DATE,
     ARRAY['IELTS/TOEFL', 'ATAR/IB'], 3.3, 6.5, 79,
     true, 'Up to AUD $20,000', 'AUD $15,000-18,000', 'AUD $45,000-48,000', 'Large (Multiple campuses)', 51000,
     45, 91, 'AUD $70,000+', ARRAY['Julia Gillard', 'Cate Blanchett', 'Peter Singer'],
     'https://www.unimelb.edu.au', 'https://study.unimelb.edu.au', 'admissions@unimelb.edu.au'),
     
    ('Arizona State University', 'Arizona', 'USA', '$28,000', 88, 'safe', 'Low', 
     'High acceptance rate and good programs. Excellent safety option for applications.',
     115, ARRAY['Business', 'Engineering', 'Journalism', 'Public Affairs'], '2024-12-01'::DATE,
     ARRAY['SAT/ACT (Optional)', 'TOEFL/IELTS'], 3.0, 6.0, 61,
     true, 'Up to $15,000', '$12,000-15,000', '$40,000-43,000', 'Very Large (Multiple campuses)', 80000,
     15, 85, '$55,000+', ARRAY['Phil Mickelson', 'Kate Spade', 'Jimmy Kimmel'],
     'https://www.asu.edu', 'https://admission.asu.edu', 'admissions@asu.edu'),
     
    ('University of Ottawa', 'Ottawa', 'Canada', '$22,000', 75, 'safe', 'Low', 
     'Affordable Canadian option with good programs and high acceptance rate.',
     279, ARRAY['Public Administration', 'Law', 'Medicine', 'Engineering'], '2024-11-01'::DATE,
     ARRAY['IELTS/TOEFL'], 3.0, 6.5, 86,
     true, 'Up to CAD $10,000', 'CAD $10,000-12,000', 'CAD $32,000-34,000', 'Medium (42.5 hectares)', 42000,
     20, 88, 'CAD $55,000+', ARRAY['Alex Trebek', 'Paul Martin', 'Michaëlle Jean'],
     'https://www.uottawa.ca', 'https://www.uottawa.ca/admissions', 'admissions@uottawa.ca'),
     
    ('Griffith University', 'Queensland', 'Australia', '$25,000', 80, 'safe', 'Low', 
     'Well-regarded Australian university with strong support for international students.',
     300, ARRAY['Environmental Science', 'Arts', 'Business', 'Health Sciences'], '2024-11-30'::DATE,
     ARRAY['IELTS/TOEFL', 'ATAR/IB'], 2.8, 6.0, 79,
     true, 'Up to AUD $15,000', 'AUD $12,000-15,000', 'AUD $37,000-40,000', 'Large (Multiple campuses)', 50000,
     35, 86, 'AUD $60,000+', ARRAY['Peter Beattie', 'Quentin Bryce', 'Ian Frazer'],
     'https://www.griffith.edu.au', 'https://www.griffith.edu.au/apply', 'international@griffith.edu.au')
) AS v(name, location, country, tuition_fee, acceptance_rate, category, risk_level, reason,
        world_ranking, program_strengths, application_deadline, required_tests, min_gpa, min_ielts, min_toefl,
        scholarships_available, scholarship_amount, living_cost, total_cost, campus_size, student_population,
        international_students_percentage, employment_rate, average_salary, notable_alumni,
        university_website, application_portal, contact_email)
WHERE NOT EXISTS (SELECT 1 FROM universities);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_user_id ON shortlists(user_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_university_id ON shortlists(university_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_universities_country ON universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_category ON universities(category);