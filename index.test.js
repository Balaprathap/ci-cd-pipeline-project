const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json());

const tasks = [];
app.get('/', (req, res) => res.json({ message: 'CI/CD Pipeline API is live!', version: '1.0.0' }));
app.get('/tasks', (req, res) => res.json(tasks));
app.post('/tasks', (req, res) => {
  const task = { id: tasks.length + 1, ...req.body };
  tasks.push(task);
  res.status(201).json(task);
});

test('GET / returns welcome message', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('CI/CD Pipeline API is live!');
});

test('POST /tasks creates a task', async () => {
  const res = await request(app).post('/tasks').send({ title: 'Test task' });
  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe('Test task');
});