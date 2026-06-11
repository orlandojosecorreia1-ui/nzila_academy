-- ==========================================
-- NZILA ACADEMY - SUPABASE SCHEMA DEFINITION
-- Copy and run this in your Supabase SQL Editor
-- (https://supabase.com/dashboard/project/_/sql)
-- ==========================================

-- Ensure public schema is enabled
CREATE SCHEMA IF NOT EXISTS public;

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    duration TEXT,
    modules_count INTEGER DEFAULT 0,
    lessons_list JSONB DEFAULT '[]'::jsonb,
    category TEXT,
    image TEXT,
    students_count INTEGER DEFAULT 0,
    price NUMERIC DEFAULT 0
);

-- 2. Access Codes Table
CREATE TABLE IF NOT EXISTS access_codes (
    code TEXT PRIMARY KEY,
    course_id TEXT,
    course_title TEXT,
    status TEXT DEFAULT 'disponivel', -- 'disponivel' | 'resgatado'
    resgatado_por TEXT,
    resgatado_em TEXT
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    course_id TEXT,
    course_title TEXT,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Novos', -- 'Novos' | 'Em Andamento' | 'Concluídos' | 'Inativos'
    registered_at TEXT,
    code_used TEXT,
    enrolled_courses JSONB DEFAULT '[]'::jsonb
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_name TEXT NOT NULL,
    author_title TEXT,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TEXT,
    likes INTEGER DEFAULT 0,
    liked_by_current_user BOOLEAN DEFAULT false,
    comments JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}'::text[],
    is_pinned BOOLEAN DEFAULT false
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    student_name TEXT,
    course_title TEXT,
    amount NUMERIC DEFAULT 0,
    payment_method TEXT,
    date TEXT,
    status TEXT DEFAULT 'completado' -- 'completado' | 'pendente'
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    timestamp TEXT,
    category TEXT DEFAULT 'info', -- 'info' | 'alert' | 'success'
    read BOOLEAN DEFAULT false,
    target_course_id TEXT
);

-- 7. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    "user" TEXT NOT NULL,
    action TEXT NOT NULL,
    category TEXT DEFAULT 'system'
);

-- Enable RLS for security (Standard Supabase setup)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous public select/insert/update permission policies
DROP POLICY IF EXISTS "Allow public select on courses" ON courses;
CREATE POLICY "Allow public select on courses" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on courses" ON courses;
CREATE POLICY "Allow public all on courses" ON courses FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public select on access_codes" ON access_codes;
CREATE POLICY "Allow public select on access_codes" ON access_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on access_codes" ON access_codes;
CREATE POLICY "Allow public all on access_codes" ON access_codes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public select on students" ON students;
CREATE POLICY "Allow public select on students" ON students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on students" ON students;
CREATE POLICY "Allow public all on students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public select on posts" ON posts;
CREATE POLICY "Allow public select on posts" ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on posts" ON posts;
CREATE POLICY "Allow public all on posts" ON posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public select on transactions" ON transactions;
CREATE POLICY "Allow public select on transactions" ON transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on transactions" ON transactions;
CREATE POLICY "Allow public all on transactions" ON transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public select on notifications" ON notifications;
CREATE POLICY "Allow public select on notifications" ON notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on notifications" ON notifications;
CREATE POLICY "Allow public all on notifications" ON notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public select on activity_logs" ON activity_logs;
CREATE POLICY "Allow public select on activity_logs" ON activity_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public all on activity_logs" ON activity_logs;
CREATE POLICY "Allow public all on activity_logs" ON activity_logs FOR ALL USING (true);
