# bank-account
Personal project about a bank account to learn React + Django frameworks in combination.

- start the backend: `cd backend` --> `python manage.py runserver`
- start the frontend: `npm run dev`

# file
- `settings.py`: principal configuration file of the Django project. Here we can define installed apps, middleware, database, security configuration and CORS and static file and media.
- `api/views.py`: function to manage HTTP request. For example we can manage GET, POST and UPDATE...
- `api/urls.py`: we map here the urls of the functions or class
- `backend/urls`: we can add here the routes of Django app
- `models.py`: add here the class definition and the data structure
- `serializers.py`: create this in `api/`

# Step by Step Installation

## Backend (Django)

### Python
- `python --version`
- `python -m venv .venv`
- `python install pip`
- `pip install -r requirements.txt`
- nel terminale: `.venv\Scripts\activate.ps1`
#### requirements.txt
```
django
djangorestframework
django-cors-headers
djangorestframework-simplejwt
psycopg2
gunicorn
django-environ
pytes
whitenoise
pandas
numpy
matplotlib
```
### Django
- `django-admin startproject backend`
- `cd backend`
- `python manage.py startapp api`
- `python manage.py migrate`
- `pip install djangorestframework django-cors-headers`
#### settings.py
```
INSTALLED_APPS = [
    ...,
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...,
]

CORS_ALLOW_ALL_ORIGINS = True
```
#### api/views.py
```
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Ciao dal backend Django!"})

```
#### api/urls.py
```
from django.urls import path
from .views import hello_world

urlpatterns = [
    path('hello/', hello_world),
]
```
#### backend/urls.py
```
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

## Frontend (React)

#### Connect React to Django
- `npm create vite@latest fronted -- --template react`
- project name: frontend
- variant: JavaScrispt
- `cd frontend` --> `npm install`
- `npm install axios`
#### frontend/src/App.jsx
```
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8000/api/hello/')
            .then(response => {
                setMessage(response.data.message);
            })
            .catch(error => {
                console.error('Errore:', error);
            });
    }, []);

    return (
        <div>
            <h1>React + Vite + Django</h1>
            <p>Messaggio dal backend: {message}</p>
        </div>
    );
}

export default App;
```

## Production
- in React: npm run build to obtain static file in dist/
- copy the contents inside dist/ in static/ of Django