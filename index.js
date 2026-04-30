const express = require('express');
const app = express();
app.use(express.json());
// Request logger
const logs = [];
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logs.unshift({
      id: logs.length + 1,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      time: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
    if (logs.length > 100) logs.pop();
  });
  next();
});

const tasks = [];
const startTime = Date.now();

app.get('/', (req, res) => {
  res.json({ message: 'CI/CD Pipeline API is live!', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'healthy', version: '1.0.0',
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    checks: { server: 'ok', memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB` }
  });
});

app.get('/status', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>System Status</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}.card{background:#111;border:1px solid #222;border-radius:16px;padding:40px;width:420px}.dot{width:12px;height:12px;background:#22c55e;border-radius:50%;display:inline-block;margin-right:8px;animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}h1{font-size:22px;font-weight:600;margin-bottom:6px}.sub{color:#666;font-size:14px;margin-bottom:32px}.bar{background:#1a1a1a;border-radius:10px;padding:16px 20px;margin-bottom:12px;display:flex;justify-content:space-between}.label{font-size:13px;color:#888}.value{font-size:13px;font-weight:500;color:#22c55e}.divider{border:none;border-top:1px solid #1e1e1e;margin:24px 0}.footer{font-size:12px;color:#444;text-align:center}</style>
  </head><body><div class="card"><h1><span class="dot"></span>All Systems Operational</h1><p class="sub">CI/CD Pipeline Project — Live Status</p>
  <div class="bar"><span class="label">API Server</span><span class="value">● Online</span></div>
  <div class="bar"><span class="label">Version</span><span class="value">1.0.0</span></div>
  <div class="bar"><span class="label">Uptime</span><span class="value">${uptimeSeconds}s</span></div>
  <div class="bar"><span class="label">Memory</span><span class="value">${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB</span></div>
  <div class="bar"><span class="label">Timestamp</span><span class="value">${new Date().toISOString()}</span></div>
  <hr class="divider"><p class="footer">Auto-deployed via GitHub Actions · Hosted on Vercel</p></div></body></html>`);
});
app.get('/logs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>API Logs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #0a0a0a; color: #e0e0e0; min-height: 100vh; }
    header { background: #111; border-bottom: 1px solid #222; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 18px; font-weight: 600; }
    .live { background: #22c55e22; color: #22c55e; font-size: 12px; padding: 4px 10px; border-radius: 20px; border: 1px solid #22c55e44; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    .container { max-width: 960px; margin: 32px auto; padding: 0 24px; }
    .stats { display: flex; gap: 12px; margin-bottom: 24px; }
    .stat { background: #111; border: 1px solid #222; border-radius: 10px; padding: 14px 20px; flex: 1; }
    .stat-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 22px; font-weight: 600; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; font-size: 13px; }
    th { text-align: left; padding: 12px 16px; font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1e1e1e; }
    td { padding: 12px 16px; border-bottom: 1px solid #161616; font-family: 'SF Mono', monospace; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #141414; }
    .method { font-weight: 600; font-size: 11px; padding: 3px 8px; border-radius: 4px; }
    .GET { background: #3b82f622; color: #3b82f6; }
    .POST { background: #22c55e22; color: #22c55e; }
    .DELETE { background: #ef444422; color: #ef4444; }
    .PATCH { background: #f59e0b22; color: #f59e0b; }
    .s2 { color: #22c55e; }
    .s4, .s5 { color: #ef4444; }
    .empty { text-align: center; color: #333; padding: 48px; }
    .counter { font-size: 12px; color: #444; margin-bottom: 12px; }
  </style>
</head>
<body>
  <header>
    <h1>📋 API Request Logs</h1>
    <span class="live">● Live — refreshes every 3s</span>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat"><div class="stat-label">Total Requests</div><div class="stat-value" id="total">0</div></div>
      <div class="stat"><div class="stat-label">Success (2xx)</div><div class="stat-value s2" id="success">0</div></div>
      <div class="stat"><div class="stat-label">Errors (4xx/5xx)</div><div class="stat-value s4" id="errors">0</div></div>
      <div class="stat"><div class="stat-label">Last Endpoint</div><div class="stat-value" id="last" style="font-size:14px">—</div></div>
    </div>
    <div class="counter" id="counter"></div>
    <table>
      <thead>
        <tr><th>#</th><th>Method</th><th>Path</th><th>Status</th><th>Duration</th><th>Time</th></tr>
      </thead>
      <tbody id="log-body"><tr><td colspan="6" class="empty">No requests logged yet.</td></tr></tbody>
    </table>
  </div>
  <script>
    async function loadLogs() {
      const res = await fetch('/logs/data');
      const data = await res.json();
      document.getElementById('total').textContent = data.length;
      document.getElementById('success').textContent = data.filter(l => l.status < 400).length;
      document.getElementById('errors').textContent = data.filter(l => l.status >= 400).length;
      document.getElementById('last').textContent = data[0]?.path || '—';
      document.getElementById('counter').textContent = data.length + ' requests recorded (last 100)';
      const tbody = document.getElementById('log-body');
      if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty">No requests yet.</td></tr>'; return; }
      tbody.innerHTML = data.map(l => \`
        <tr>
          <td style="color:#333">\${l.id}</td>
          <td><span class="method \${l.method}">\${l.method}</span></td>
          <td>\${l.path}</td>
          <td class="\${l.status < 400 ? 's2' : 's4'}">\${l.status}</td>
          <td style="color:#555">\${l.duration}</td>
          <td style="color:#444">\${new Date(l.time).toLocaleTimeString()}</td>
        </tr>
      \`).join('');
    }
    loadLogs();
    setInterval(loadLogs, 3000);
  </script>
</body>
</html>`);
});

app.get('/logs/data', (req, res) => {
  res.json(logs);
});
app.get('/dashboard', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f0f0f; color: #e0e0e0; min-height: 100vh; }
    header { background: #111; border-bottom: 1px solid #222; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 18px; font-weight: 600; }
    .badge { background: #22c55e22; color: #22c55e; font-size: 12px; padding: 4px 10px; border-radius: 20px; border: 1px solid #22c55e44; }
    .container { max-width: 900px; margin: 40px auto; padding: 0 24px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat { background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px 24px; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: 600; color: #fff; }
    .form-card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .form-card h2 { font-size: 14px; font-weight: 500; color: #888; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-row { display: flex; gap: 12px; }
    input, select { background: #1a1a1a; border: 1px solid #2a2a2a; color: #e0e0e0; border-radius: 8px; padding: 10px 14px; font-size: 14px; outline: none; transition: border 0.15s; }
    input { flex: 1; }
    input:focus { border-color: #444; }
    button { background: #fff; color: #000; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.15s; white-space: nowrap; }
    button:hover { opacity: 0.85; }
    .filters { display: flex; gap: 10px; margin-bottom: 16px; }
    .filters input { flex: 1; }
    .filters select { width: 160px; }
    table { width: 100%; border-collapse: collapse; background: #111; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
    th { text-align: left; font-size: 12px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 20px; border-bottom: 1px solid #1e1e1e; }
    td { padding: 14px 20px; font-size: 14px; border-bottom: 1px solid #1a1a1a; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #161616; }
    .pill { display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
    .pill-pending { background: #f59e0b22; color: #f59e0b; border: 1px solid #f59e0b44; }
    .pill-completed { background: #22c55e22; color: #22c55e; border: 1px solid #22c55e44; }
    .pill-high { background: #ef444422; color: #ef4444; border: 1px solid #ef444444; }
    .pill-medium { background: #3b82f622; color: #3b82f6; border: 1px solid #3b82f644; }
    .pill-low { background: #6b728022; color: #6b7280; border: 1px solid #6b728044; }
    .del-btn { background: transparent; color: #ef4444; border: 1px solid #ef444433; border-radius: 6px; padding: 5px 10px; font-size: 12px; cursor: pointer; }
    .del-btn:hover { background: #ef444422; opacity: 1; }
    .empty { text-align: center; color: #444; padding: 48px; font-size: 14px; }
  </style>
</head>
<body>
  <header>
    <h1> Task Dashboard</h1>
    <span class="badge">● Live</span>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat"><div class="stat-label">Total Tasks</div><div class="stat-value" id="count-total">0</div></div>
      <div class="stat"><div class="stat-label">Pending</div><div class="stat-value" id="count-pending">0</div></div>
      <div class="stat"><div class="stat-label">Completed</div><div class="stat-value" id="count-completed">0</div></div>
    </div>
    <div class="form-card">
      <h2>Add New Task</h2>
      <div class="form-row">
        <input type="text" id="task-title" placeholder="Task title..." />
        <select id="task-priority">
          <option value="low">Low Priority</option>
          <option value="medium" selected>Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button onclick="addTask()">+ Add Task</button>
      </div>
    </div>
    <div class="filters">
      <input type="text" id="search" placeholder="Search tasks..." oninput="loadTasks()" />
      <select id="filter-status" onchange="loadTasks()">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="task-body">
        <tr><td colspan="6" class="empty">No tasks yet. Add one above!</td></tr>
      </tbody>
    </table>
  </div>
  <script>
    async function loadTasks() {
      const search = document.getElementById('search').value;
      const status = document.getElementById('filter-status').value;
      let url = '/tasks?';
      if (search) url += 'search=' + encodeURIComponent(search) + '&';
      if (status) url += 'status=' + status;
      const res = await fetch(url);
      const data = await res.json();
      const all = await (await fetch('/tasks')).json();
      document.getElementById('count-total').textContent = all.count;
      document.getElementById('count-pending').textContent = all.tasks.filter(t => t.status === 'pending').length;
      document.getElementById('count-completed').textContent = all.tasks.filter(t => t.status === 'completed').length;
      const tbody = document.getElementById('task-body');
      if (!data.tasks.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No tasks found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.tasks.map(t => \`
        <tr>
          <td style="color:#444">\${t.id}</td>
          <td>\${t.title}</td>
          <td><span class="pill pill-\${t.status}">\${t.status}</span></td>
          <td><span class="pill pill-\${t.priority}">\${t.priority}</span></td>
          <td style="color:#444;font-size:12px">\${new Date(t.createdAt).toLocaleString()}</td>
          <td><button class="del-btn" onclick="deleteTask(\${t.id})">Delete</button></td>
        </tr>
      \`).join('');
    }
    async function addTask() {
      const title = document.getElementById('task-title').value.trim();
      const priority = document.getElementById('task-priority').value;
      if (!title) return alert('Please enter a title!');
      await fetch('/tasks', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title, priority }) });
      document.getElementById('task-title').value = '';
      loadTasks();
    }
    async function deleteTask(id) {
      await fetch('/tasks/' + id, { method: 'DELETE' });
      loadTasks();
    }
    loadTasks();
    setInterval(loadTasks, 5000);
  </script>
</body>
</html>`);
});

app.get('/tasks', (req, res) => {
  let result = [...tasks];
  if (req.query.search) result = result.filter(t => t.title?.toLowerCase().includes(req.query.search.toLowerCase()));
  if (req.query.status) result = result.filter(t => t.status === req.query.status);
  res.json({ count: result.length, tasks: result });
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/tasks', (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title is required' });
  const task = { id: tasks.length + 1, title: req.body.title, status: req.body.status || 'pending', priority: req.body.priority || 'medium', createdAt: new Date().toISOString() };
  tasks.push(task);
  res.status(201).json(task);
});

app.patch('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (req.body.title) task.title = req.body.title;
  if (req.body.status) task.status = req.body.status;
  if (req.body.priority) task.priority = req.body.priority;
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks.splice(index, 1);
  res.json({ message: 'Task deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));