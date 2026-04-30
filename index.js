const express = require('express');
const app = express();
app.use(express.json());

const tasks = [];
const startTime = Date.now();

app.get('/', (req, res) => {
  res.json({ message: 'CI/CD Pipeline API is live!', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'healthy',
    version: '1.0.0',
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    checks: {
      server: 'ok',
      memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  });
});

app.get('/status', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Status</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #111; border: 1px solid #222; border-radius: 16px; padding: 40px; width: 420px; }
    .dot { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 8px; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 6px; }
    .sub { color: #666; font-size: 14px; margin-bottom: 32px; }
    .status-bar { background: #1a1a1a; border-radius: 10px; padding: 16px 20px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .label { font-size: 13px; color: #888; }
    .value { font-size: 13px; font-weight: 500; color: #22c55e; }
    .divider { border: none; border-top: 1px solid #1e1e1e; margin: 24px 0; }
    .footer { font-size: 12px; color: #444; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h1><span class="dot"></span>All Systems Operational</h1>
    <p class="sub">CI/CD Pipeline Project — Live Status</p>
    <div class="status-bar"><span class="label">API Server</span><span class="value">● Online</span></div>
    <div class="status-bar"><span class="label">Version</span><span class="value">1.0.0</span></div>
    <div class="status-bar"><span class="label">Uptime</span><span class="value">${uptimeSeconds}s</span></div>
    <div class="status-bar"><span class="label">Memory</span><span class="value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</span></div>
    <div class="status-bar"><span class="label">Timestamp</span><span class="value">${new Date().toISOString()}</span></div>
    <hr class="divider">
    <p class="footer">Auto-deployed via GitHub Actions · Hosted on Vercel</p>
  </div>
</body>
</html>`);
});

// GET all tasks (with optional search & filter)
app.get('/tasks', (req, res) => {
  let result = [...tasks];
  if (req.query.search) {
    result = result.filter(t =>
      t.title?.toLowerCase().includes(req.query.search.toLowerCase())
    );
  }
  if (req.query.status) {
    result = result.filter(t => t.status === req.query.status);
  }
  res.json({ count: result.length, tasks: result });
});

// GET single task
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// POST create task
app.post('/tasks', (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title is required' });
  const task = {
    id: tasks.length + 1,
    title: req.body.title,
    status: req.body.status || 'pending',
    priority: req.body.priority || 'medium',
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH update task
app.patch('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (req.body.title) task.title = req.body.title;
  if (req.body.status) task.status = req.body.status;
  if (req.body.priority) task.priority = req.body.priority;
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// DELETE task
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(index, 1);
  res.json({ message: 'Task deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));