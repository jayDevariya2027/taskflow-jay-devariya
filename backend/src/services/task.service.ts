import { query } from '../db';

export const getTasksByProject = async (
  projectId: string,
  status?: string,
  assigneeId?: string
) => {
  const conditions: string[] = ['t.project_id = $1'];
  const values: any[] = [projectId];
  let paramCount = 2;

  if (status) {
    conditions.push(`t.status = $${paramCount++}`);
    values.push(status);
  }

  if (assigneeId) {
    conditions.push(`t.assignee_id = $${paramCount++}`);
    values.push(assigneeId);
  }

  const result = await query(
    `SELECT t.id, t.title, t.description, t.status, t.priority,
            t.project_id, t.assignee_id, t.due_date, t.created_at, t.updated_at,
            u.name as assignee_name
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.created_at DESC`,
    values
  );

  return result.rows;
};

export const createTask = async (
  projectId: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
  }
) => {
  // Check project exists and user is owner
  const project = await query(
    'SELECT id, owner_id FROM projects WHERE id = $1',
    [projectId]
  );

  if (project.rows.length === 0) {
    throw { status: 404, message: 'not found' };
  }

  if (project.rows[0].owner_id !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  const result = await query(
    `INSERT INTO tasks
      (title, description, status, priority, project_id, assignee_id, due_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, description, status, priority,
               project_id, assignee_id, due_date, created_at, updated_at`,
    [
      data.title,
      data.description || null,
      data.status || 'todo',
      data.priority || 'medium',
      projectId,
      data.assignee_id || null,
      data.due_date || null,
    ]
  );

  return result.rows[0];
};

export const updateTask = async (
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_id?: string;
    due_date?: string;
  }
) => {
  // Check task exists
  const existing = await query(
    `SELECT t.id, t.project_id, p.owner_id
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [taskId]
  );

  if (existing.rows.length === 0) {
    throw { status: 404, message: 'not found' };
  }

  // Only project owner can update
  if (existing.rows[0].owner_id !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(data.title);
  }

  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }

  if (data.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(data.status);
  }

  if (data.priority !== undefined) {
    fields.push(`priority = $${paramCount++}`);
    values.push(data.priority);
  }

  if (data.assignee_id !== undefined) {
    fields.push(`assignee_id = $${paramCount++}`);
    values.push(data.assignee_id === '' ? null : data.assignee_id);
  }

  if (data.due_date !== undefined) {
    fields.push(`due_date = $${paramCount++}`);
    values.push(data.due_date);
  }

  if (fields.length === 0) {
    throw { status: 400, message: 'no fields to update' };
  }

  // Always update updated_at
  fields.push(`updated_at = $${paramCount++}`);
  values.push(new Date());

  values.push(taskId);

  const result = await query(
    `UPDATE tasks
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, title, description, status, priority,
               project_id, assignee_id, due_date, created_at, updated_at`,
    values
  );

  return result.rows[0];
};

export const deleteTask = async (taskId: string, userId: string) => {
  // Check task exists and get project owner
  const existing = await query(
    `SELECT t.id, p.owner_id
     FROM tasks t
     JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [taskId]
  );

  if (existing.rows.length === 0) {
    throw { status: 404, message: 'not found' };
  }

  if (existing.rows[0].owner_id !== userId) {
    throw { status: 403, message: 'forbidden' };
  }

  await query('DELETE FROM tasks WHERE id = $1', [taskId]);
};