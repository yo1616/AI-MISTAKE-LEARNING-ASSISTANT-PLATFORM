PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  account TEXT UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_year TEXT,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_year TEXT,
  subject_id TEXT NOT NULL,
  teacher_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_classes (
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  PRIMARY KEY (student_id, class_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  name TEXT NOT NULL,
  unit_order INTEGER,
  is_fixed INTEGER NOT NULL DEFAULT 1 CHECK (is_fixed IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sub_units (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  code TEXT,
  name TEXT NOT NULL,
  sub_unit_order INTEGER,
  is_fixed INTEGER NOT NULL DEFAULT 1 CHECK (is_fixed IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  sub_unit_id TEXT,
  name TEXT NOT NULL,
  keywords TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by TEXT NOT NULL DEFAULT 'seed',
  source_session_id TEXT,
  creation_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_unit_id) REFERENCES sub_units(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  class_id TEXT,
  unit_id TEXT,
  sub_unit_id TEXT,
  title TEXT,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'photo', 'photo_text')),
  question_group_count INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_unit_id) REFERENCES sub_units(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS question_groups (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  unit_id TEXT,
  sub_unit_id TEXT,
  concept_id TEXT,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'photo', 'photo_text')),
  question_text TEXT,
  question_image_url TEXT,
  classification_confidence REAL,
  is_new_concept INTEGER NOT NULL DEFAULT 0 CHECK (is_new_concept IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_unit_id) REFERENCES sub_units(id) ON DELETE SET NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_group_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'assistant')),
  message_type TEXT NOT NULL CHECK (message_type IN ('new_question', 'follow_up', 'request_practice', 'answer', 'classification_explanation')),
  input_type TEXT CHECK (input_type IN ('text', 'photo', 'photo_text')),
  content TEXT NOT NULL,
  question_text TEXT,
  question_image_url TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_group_id) REFERENCES question_groups(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS message_images (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generated_exams (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  unit_id TEXT,
  sub_unit_id TEXT,
  concept_id TEXT,
  class_id TEXT,
  question_count INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'short_answer')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_unit_id) REFERENCES sub_units(id) ON DELETE SET NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS generated_exam_questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  concept_id TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer')),
  question_text TEXT NOT NULL,
  options TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES generated_exams(id) ON DELETE CASCADE,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mistake_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  source_session_id TEXT,
  source_exam_id TEXT,
  source_question_id TEXT,
  question_group_id TEXT,
  subject_id TEXT NOT NULL,
  class_id TEXT,
  unit_id TEXT,
  sub_unit_id TEXT,
  concept_id TEXT,
  input_type TEXT CHECK (input_type IN ('text', 'photo', 'photo_text')),
  question_image_url TEXT,
  question_text TEXT,
  student_question TEXT,
  student_answer TEXT,
  correct_answer TEXT,
  ai_summary TEXT,
  full_explanation TEXT,
  classification_confidence REAL,
  is_new_concept INTEGER NOT NULL DEFAULT 0 CHECK (is_new_concept IN (0, 1)),
  starred INTEGER NOT NULL DEFAULT 0 CHECK (starred IN (0, 1)),
  starred_at TEXT,
  alert_triggered INTEGER NOT NULL DEFAULT 0 CHECK (alert_triggered IN (0, 1)),
  error_count INTEGER NOT NULL DEFAULT 1,
  review_status TEXT NOT NULL DEFAULT 'not_reviewed' CHECK (review_status IN ('not_reviewed', 'reviewing', 'mastered', 'need_help')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (source_exam_id) REFERENCES generated_exams(id) ON DELETE SET NULL,
  FOREIGN KEY (source_question_id) REFERENCES generated_exam_questions(id) ON DELETE SET NULL,
  FOREIGN KEY (question_group_id) REFERENCES question_groups(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_unit_id) REFERENCES sub_units(id) ON DELETE SET NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS concept_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  source_session_id TEXT,
  question_group_id TEXT,
  subject_id TEXT NOT NULL,
  class_id TEXT,
  unit_id TEXT,
  sub_unit_id TEXT,
  concept_id TEXT,
  note_title TEXT NOT NULL,
  note_content TEXT NOT NULL,
  starred INTEGER NOT NULL DEFAULT 0 CHECK (starred IN (0, 1)),
  starred_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_session_id) REFERENCES chat_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY (question_group_id) REFERENCES question_groups(id) ON DELETE SET NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_unit_id) REFERENCES sub_units(id) ON DELETE SET NULL,
  FOREIGN KEY (concept_id) REFERENCES concepts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS concept_note_mistakes (
  note_id TEXT NOT NULL,
  mistake_record_id TEXT NOT NULL,
  PRIMARY KEY (note_id, mistake_record_id),
  FOREIGN KEY (note_id) REFERENCES concept_notes(id) ON DELETE CASCADE,
  FOREIGN KEY (mistake_record_id) REFERENCES mistake_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generated_exam_selected_mistakes (
  exam_id TEXT NOT NULL,
  mistake_record_id TEXT NOT NULL,
  PRIMARY KEY (exam_id, mistake_record_id),
  FOREIGN KEY (exam_id) REFERENCES generated_exams(id) ON DELETE CASCADE,
  FOREIGN KEY (mistake_record_id) REFERENCES mistake_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES generated_exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  exam_question_id TEXT NOT NULL,
  student_answer TEXT,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  can_save_to_mistakes INTEGER NOT NULL DEFAULT 1 CHECK (can_save_to_mistakes IN (0, 1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY (submission_id) REFERENCES exam_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_question_id) REFERENCES generated_exam_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_classes_subject_id ON classes(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class_id ON student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_units_subject_id ON units(subject_id);
CREATE INDEX IF NOT EXISTS idx_sub_units_unit_id ON sub_units(unit_id);
CREATE INDEX IF NOT EXISTS idx_concepts_subject_unit_sub_unit ON concepts(subject_id, unit_id, sub_unit_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student_updated ON chat_sessions(student_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_groups_session_id ON question_groups(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mistake_records_student_created ON mistake_records(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mistake_records_student_concept ON mistake_records(student_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_mistake_records_class_created ON mistake_records(class_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_concept_notes_student_created ON concept_notes(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_exams_student_created ON generated_exams(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam_id ON exam_submissions(exam_id);
