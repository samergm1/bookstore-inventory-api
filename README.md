# Bookstore Inventory API

Sistema de gestión de inventario de librerías con validación de precios contra tasas de cambio en tiempo real.

- **Backend:** Django 5.1 · Django REST Framework · SQLite · Gunicorn
- **Frontend:** React 18 · Vite 5 · React Router · Axios · Tailwind CSS v4
- **Integración externa:** [ExchangeRate API](https://api.exchangerate-api.com/v4/latest/USD)

---

## Índice

1. [Funcionalidades](#funcionalidades)
2. [Pasos de ejecución con Docker](#pasos-de-ejecución-con-docker)
3. [Pasos de ejecución local](#pasos-de-ejecución-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Endpoints y ejemplos de uso](#endpoints-y-ejemplos-de-uso)
6. [Colección de Postman](#colección-de-postman)

---

## Funcionalidades

**API REST**
- CRUD completo de libros con paginación.
- Búsqueda por categoría y listado de libros con stock bajo.
- Cálculo del precio de venta sugerido.

**Interfaz web (SPA)**
- Dashboard con tabla de libros, paginación del backend y panel de filtros (categoría y stock bajo con umbral configurable).
- Formularios de creación y edición validados en el cliente (ISBN, costo, stock, país) que además muestran los errores por campo devueltos por la API.
- Vista de detalle de libro y el desglose del cálculo del precio de venta (costo original, tasa aplicada, margen y precio final).

---

## Pasos de ejecución con Docker

### Requisitos previos
- Instalar Docker Desktop

### Pasos
```bash
git clone https://github.com/samergm1/bookstore-inventory-api.git
cd bookstore-inventory-api
docker compose up --build
```

- Las migraciones se aplican automáticamente al arrancar el backend.
- La base de datos SQLite se guarda en el volumen `backend-data` y persiste entre reinicios.
- El frontend se compila y se sirve con Nginx. Arranca solo cuando el backend responde al health check.

---

## Pasos de ejecución local

### Requisitos previos
- **Python 3.11+**
- **Node.js 18+** y npm
- Git

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Variables de entorno

### Backend (`backend/.env`)

`DJANGO_SECRET_KEY`=`+8o&7o%eqw(nkk+08-ect453(%6gl@uvo)qarkd3&$8vb4&fym`
`DJANGO_DEBUG`=`True`
`DJANGO_ALLOWED_HOSTS`=`localhost,127.0.0.1,0.0.0.0`
`CORS_ALLOWED_ORIGINS`=`http://localhost:5173,http://127.0.0.1:5173`
`EXCHANGE_RATE_API_URL`=`https://api.exchangerate-api.com/v4/latest/USD`
`EXCHANGE_RATE_TIMEOUT_SECONDS`=`5`
`PRICING_MARGIN_PERCENTAGE`=`40`

### Frontend (`frontend/.env`)

`VITE_API_URL`=`http://localhost:8000`

---

## Endpoints y ejemplos de uso

Base URL: `http://localhost:8000`

### 1. Crear un libro
`POST http://localhost:8000/books`

**Body**
```json
{
  "title": "El Quijote",
  "author": "Miguel de Cervantes",
  "isbn": "978-84-376-0494-7",
  "cost_usd": 15.99,
  "stock_quantity": 25,
  "category": "Literatura Clásica",
  "supplier_country": "ES"
}
```

**Response: 201 Created**
```json
{
  "id": 1,
  "title": "El Quijote",
  "author": "Miguel de Cervantes",
  "isbn": "978-84-376-0494-7",
  "cost_usd": 15.99,
  "selling_price_local": null,
  "currency": "EUR",
  "stock_quantity": 25,
  "category": "Literatura Clásica",
  "supplier_country": "ES",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### 2. Listar con paginación
`GET http://localhost:8000/books?page=1&page_size=5`

```json
{
  "count": 13,
  "total_pages": 3,
  "current_page": 1,
  "page_size": 5,
  "next": "http://localhost:8000/books?page=2&page_size=5",
  "previous": null,
  "results": [ { "id": 1, "title": "El Quijote", "...": "..." } ]
}
```

### 3. Obtener libro por ID
`GET http://localhost:8000/books/1`

### 4. Actualizar libro
`PUT http://localhost:8000/books/1`

Actualización completa: se envían todos los campos editables.

**Body**
```json
{
  "title": "Don Quijote de la Mancha",
  "author": "Miguel de Cervantes",
  "isbn": "978-84-376-0494-7",
  "cost_usd": 15.99,
  "stock_quantity": 5,
  "category": "Literatura Clásica",
  "supplier_country": "ES"
}
```

### 5. Eliminar libro
`DELETE http://localhost:8000/books/1`

### 6. Buscar por categoría
`GET http://localhost:8000/books/search?category=ciencia`

**Response: 200 OK**
```json
{
  "count": 1,
  "total_pages": 1,
  "current_page": 1,
  "page_size": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 3,
      "title": "Breve historia del tiempo",
      "author": "Stephen Hawking",
      "isbn": "978-0-553-38016-3",
      "cost_usd": 18.0,
      "selling_price_local": null,
      "currency": "GBP",
      "stock_quantity": 4,
      "category": "Ciencia",
      "supplier_country": "GB",
      "created_at": "2025-01-15T10:32:00Z",
      "updated_at": "2025-01-15T10:32:00Z"
    }
  ]
}
```

### 7. Libros con stock bajo
`GET http://localhost:8000/books/low-stock?threshold=5`

**Response: 200 OK**
```json
{
  "count": 1,
  "total_pages": 1,
  "current_page": 1,
  "page_size": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 4,
      "title": "Cosmos",
      "author": "Carl Sagan",
      "isbn": "978-0-345-53943-4",
      "cost_usd": 22.5,
      "selling_price_local": null,
      "currency": "USD",
      "stock_quantity": 0,
      "category": "Ciencia",
      "supplier_country": "US",
      "created_at": "2025-01-15T10:33:00Z",
      "updated_at": "2025-01-15T10:33:00Z"
    }
  ]
}
```

### 8. Calcular precio de venta
`POST http://localhost:8000/books/1/calculate-price`

**Response: 200 OK**
```json
{
  "book_id": 1,
  "cost_usd": 15.99,
  "exchange_rate": 0.85,
  "cost_local": 13.59,
  "margin_percentage": 40.0,
  "selling_price_local": 19.03,
  "currency": "EUR",
  "exchange_rate_source": "api",
  "calculation_timestamp": "2025-01-15T10:30:00Z"
}
```

### 9. Health check
`GET http://localhost:8000/health`

**Response: 200 OK**
```json
{
  "status": "ok"
}
```

### 10. Ejemplos de errores

**Response: 400 Bad Request:** datos inválidos (`POST` o `PUT` `/books`)
```json
{
  "error": {
    "status": 400,
    "code": "validation_error",
    "message": "Los datos enviados no son válidos.",
    "details": {
      "isbn": ["Ya existe un libro con este ISBN."]
    }
  }
}
```

**Response: 404 Not Found:** libro inexistente (`GET http://localhost:8000/books/999`)
```json
{
  "error": {
    "status": 404,
    "code": "not_found",
    "message": "No Book matches the given query."
  }
}
```

**Response: 503 Service Unavailable:** la API de tasas falla y no hay tasa por defecto para esa moneda
```json
{
  "error": {
    "status": 503,
    "code": "service_unavailable",
    "message": "No se pudo obtener la tasa de cambio USD -> EUR y no hay tasa por defecto configurada."
  }
}
```

---

## Colección de Postman

Archivo: [`postman/bookstore-inventory-api.postman_collection.json`](postman/bookstore-inventory-api.postman_collection.json)

1. En Postman: **Import** → selecciona el archivo.
2. Con el backend levantado: click derecho en la colección → **Run collection**.

Incluye peticiones con tests automáticos (CRUD, búsquedas, cálculo de precio y casos de error 400/404). La variable `baseUrl` vale `http://localhost:8000`. `bookId` se rellena sola al crear un libro, y el ISBN se genera aleatoriamente para poder ejecutarla varias veces.

---