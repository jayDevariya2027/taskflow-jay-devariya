import { query } from '../db';

export const getProjects = async (userId: string) => {
  const result = await query(
    `SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at,
     u.name as owner_name,
     COUNT(t.id) as task_count
     FROM projects p
     JOIN users u ON u.id = p.owner_id
     LEFT JOIN tasks t ON t.project_id = p.id
     WHERE p.owner_id = $1 OR t.assignee_id = $1
     GROUP BY p.id, u.name
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const createProject = async (
  name: string,
  description: string | undefined,
  ownerId: string
) => {
  const result = await query(
    `INSERT INTO projects (name, description, owner_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, owner_id, created_at`,
    [name, description || null, ownerId]
  );
  return result.rows[0];
};

export const getProjectById = async (projectId: string, userId: string) => {
  // Get project
  const projectResult = await query(
    `SELECT p.id, p.name, p.description, p.owner_id, p.created_at
     FROM projects p
     WHERE p.id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    throw { status: 404, message: 'not found' };
  }

  // Get tasks for this project
  const tasksResult = await query(
    `SELECT t.id, t.title, t.description, t.status, t.priority,
            t.project_id, t.assignee_id, t.due_date, t.created_at, t.updated_at,
            u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.project_id = $1
     ORDER BY t.created_at DESC`,
    [projectId]
  );

  return {
    ...projectResult.rows[0],
    tasks: tasksResult.rows,
  };
};

export const updateProject = async (
  projectId: string,
  userId: string,
  name?: string,
  description?: string
) => {
  // Check project exists and user is owner
  const existing = await query(
    'SELECT id, owner_id FROM projects WHERE id = $1',
    [projectId]
  );

  if (existing.rows.length === 0) {
    throw { status: 404, message: 'not found' };
  }

  if (existing.rows[0].owner_id !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  const result = await query(
    `UPDATE projects
     SET
       name = COALESCE($1, name),
       description = COALESCE($2, description)
     WHERE id = $3
     RETURNING id, name, description, owner_id, created_at`,
    [name || null, description || null, projectId]
  );

  return result.rows[0];
};

export const deleteProject = async (projectId: string, userId: string) => {
  const existing = await query(
    'SELECT id, owner_id FROM projects WHERE id = $1',
    [projectId]
  );

  if (existing.rows.length === 0) {
    throw { status: 404, message: 'not found' };
  }

  if (existing.rows[0].owner_id !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  // Tasks are deleted automatically via ON DELETE CASCADE
  await query('DELETE FROM projects WHERE id = $1', [projectId]);
};