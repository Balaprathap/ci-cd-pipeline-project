# CI/CD Pipeline Project

![CI/CD Pipeline](https://github.com/Balaprathap/ci-cd-pipeline-project/actions/workflows/deploy.yml/badge.svg)

A production-grade REST API with automated CI/CD pipeline deployed to the cloud.

##  Live Demo
- **API:** https://ci-cd-pipeline-project-three.vercel.app
- **Health:** https://ci-cd-pipeline-project-three.vercel.app/health
- **Status:** https://ci-cd-pipeline-project-three.vercel.app/status

##  Tech Stack
- **Runtime:** Node.js + Express
- **CI/CD:** GitHub Actions
- **Cloud Hosting:** Vercel (Serverless)
- **Testing:** Jest + Supertest

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check + metrics |
| GET | `/status` | Live status page |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks?search=x` | Search tasks by title |
| GET | `/tasks?status=pending` | Filter by status |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

##  Pipeline Flow
1. Push code to `main` branch
2. GitHub Actions triggers automatically
3. Installs dependencies
4. Runs Jest test suite
5. If tests pass → deploys to Vercel
6. If tests fail → deployment is blocked

##  Run Locally
```bash
npm install
npm test
npm start
```
