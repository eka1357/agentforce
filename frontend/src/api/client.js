const API_BASE = '/api';

export const fetchWorkflows = async () => {
  const res = await fetch(`${API_BASE}/workflows`);
  if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.statusText}`);
  return res.json();
};

export const fetchWorkflow = async (id) => {
  const res = await fetch(`${API_BASE}/workflows/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch workflow ${id}`);
  return res.json();
};

export const saveWorkflow = async (workflow) => {
  const res = await fetch(`${API_BASE}/workflows/${workflow.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });
  if (!res.ok) throw new Error(`Failed to save workflow`);
  return res.json();
};

export const createWorkflow = async (workflowData) => {
  const res = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflowData),
  });
  if (!res.ok) throw new Error(`Failed to create workflow`);
  return res.json();
};

export const deleteWorkflow = async (id) => {
  const res = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete workflow`);
  return res.json();
};
