const { Router } = require('express');

function createPredictRoutes(controller) {
  const router = Router();

  router.get('/', (req, res) => controller.getStatus(req, res));
  router.post('/predict', (req, res) => controller.predict(req, res));

  return router;
}

module.exports = createPredictRoutes;
