# Fit Predict API

API de predicción de riesgo de lesiones deportivas basada en un modelo de **árbol de decisión (regresión)**. Entrena el modelo al arrancar usando un dataset sintético y expone un endpoint para predecir el nivel de riesgo (0–100) dados parámetros fisiológicos y de entrenamiento.

## Tecnologías

- **Node.js** + **Express 5**
- **ml-cart** (Decision Tree Regression)
- **pnpm** como gestor de paquetes
- Hosteado en **Vercel**

## Estructura del proyecto (MVC)

```
fit_predict_backend/
├── src/
│   ├── index.js                 # Punto de entrada, configura Express y arranca el servidor
│   ├── models/
│   │   └── riskModel.js         # Carga el dataset, entrena y expone el modelo ML
│   ├── controllers/
│   │   └── predictController.js # Lógica de los endpoints (validación, predicción, categorización)
│   ├── routes/
│   │   └── predictRoutes.js     # Definición de rutas (GET /, POST /predict)
│   └── data/
│       └── data_set.json        # Dataset sintético de 50 registros
├── vercel.json                  # Configuración de despliegue en Vercel
└── package.json
```

### Capas

| Capa           | Archivo                                 | Responsabilidad                                                                   |
| -------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| **Model**      | `src/models/riskModel.js`               | Carga el dataset, entrena un `DecisionTreeRegression`, predice y expone metadatos |
| **View**       | _ — la respuesta JSON actúa como vista_ |
| **Controller** | `src/controllers/predictController.js`  | Valida entrada, invoca al modelo, categoriza el score y arma la respuesta         |
| **Routes**     | `src/routes/predictRoutes.js`           | Enruta `GET /` y `POST /predict` al controlador                                   |

## Dataset

Ubicación: `src/data/data_set.json`

- **100 registros sintéticos** con 5 features y un target numérico.
- Cada registro representa a un atleta con los siguientes campos:

| Campo original (JSON) | Campo en API    | Tipo         | Descripción                         |
| --------------------- | --------------- | ------------ | ----------------------------------- |
| `edad`                | `age`           | number       | Edad del atleta                     |
| `horasSueno`          | `sleepHours`    | number       | Horas de sueño promedio             |
| `frecCardiaca`        | `heartRate`     | number       | Frecuencia cardíaca en reposo (bpm) |
| `intensidad`          | `intensity`     | number       | Intensidad del entrenamiento (1–10) |
| `historialLesiones`   | `injuryHistory` | number (0/1) | Antecedente de lesiones             |
| `riesgo`              | _(target)_      | number       | Score de riesgo (0–100)             |

## Endpoints

### `GET /`

Devuelve el estado del servidor y metadatos del modelo entrenado.

**Request:**

```
GET /
```

**Response (200):**

```json
{
  "success": true,
  "message": "Fit Predict API running",
  "port": 3005,
  "modelTrained": true,
  "modelInfo": {
    "type": "regression",
    "numRecords": 50,
    "treeDepth": 6,
    "features": [
      "edad",
      "horasSueno",
      "frecCardiaca",
      "intensidad",
      "historialLesiones"
    ]
  }
}
```

### `POST /predict`

Predice el riesgo de lesión a partir de los datos fisiológicos del atleta.

**Request:**

```
POST /predict
Content-Type: application/json

{
  "age": 42,
  "sleepHours": 5,
  "heartRate": 94,
  "intensity": 7,
  "injuryHistory": 1
}
```

**Response (200):**

```json
{
  "success": true,
  "input": {
    "age": 42,
    "sleepHours": 5,
    "heartRate": 94,
    "intensity": 7,
    "injuryHistory": 1
  },
  "risk": {
    "score": 94,
    "min": 0,
    "max": 100,
    "category": "critico"
  },
  "model": {
    "type": "regression",
    "numRecords": 50,
    "treeDepth": 6,
    "features": [
      "edad",
      "horasSueno",
      "frecCardiaca",
      "intensidad",
      "historialLesiones"
    ],
    "features_en": [
      "age",
      "sleepHours",
      "heartRate",
      "intensity",
      "injuryHistory"
    ]
  }
}
```

**Response (400) — campos faltantes:**

```json
{
  "success": false,
  "error": "All fields are required: age, sleepHours, heartRate, intensity, injuryHistory"
}
```

**Response (500) — modelo no entrenado:**

```json
{
  "success": false,
  "error": "Model not trained"
}
```

### Categorías de riesgo

| Score    | Categoría |
| -------- | --------- |
| 0 – 25   | bajo      |
| 26 – 50  | medio     |
| 51 – 75  | alto      |
| 76 – 100 | crítico   |

## Cómo iniciar el servicio

### Requisitos

- Node.js >= 18
- pnpm >= 10.7.1

### Instalación

```bash
pnpm install
```

### Desarrollo (con recarga automática)

```bash
pnpm dev
```

### Producción

```bash
pnpm start
```

El servidor corre por defecto en `http://localhost:3005`.

### Variable de entorno

- `PORT` — puerto del servidor (default: `3005`)

## Hosting

La API está desplegada en **Vercel** usando `@vercel/node`.

- **URL de producción:** (determinada por el deploy en Vercel)
- **Repositorio:** [github.com/edd86/fit_predict_backend](https://github.com/edd86/fit_predict_backend)

### Despliegue manual

```bash
vercel --prod
```

## Ejemplo con curl

```bash
curl -X POST http://localhost:3005/predict \
  -H "Content-Type: application/json" \
  -d '{"age":30,"sleepHours":7,"heartRate":70,"intensity":5,"injuryHistory":0}'
```
