-- Clean existing data
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE users CASCADE;

-- Seed user (password: password123)
INSERT INTO users (id, name, email, password) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Test User',
  'test@example.com',
  '$2a$12$IWBIPNihpbxE8yuf94xPn.okioP4unzc1N6bYZI/eYiu03RsOy5Ha'
);

-- Seed project
INSERT INTO projects (id, name, description, owner_id) VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Demo Project',
  'This is a seeded demo project',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Seed tasks (3 different statuses)
INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id) VALUES
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Setup project repository',
  'Initialize git repo and project structure',
  'done',
  'high',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'Build authentication API',
  'Implement register and login endpoints',
  'in_progress',
  'high',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
  'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  'Design database schema',
  'Create ERD and migration files',
  'todo',
  'medium',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  null
);