# python_project
Progetto personale Python

# Requirements
- FastAPI → backend veloce e async
- uvicorn → server ASGI
- bcrypt → hash sicuri per password
- pydantic → validazione dati
- httpx → se fai chiamate async interne
- pytest → per test automatici
- python-dotenv → per gestire variabili ambiente (es. secret)


### Test
- avviare backend: `uvicorn main:app --reload`
- avviare fronted: `cd frontend` -> `npm install` -> `npm run dev`
- usare estensione VSCode `REST Client` o Postman per testare API backend
- SQLite Browswer