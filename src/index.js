const express = require('express');
const RiskModel = require('./models/riskModel');
const PredictController = require('./controllers/predictController');
const createPredictRoutes = require('./routes/predictRoutes');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

const riskModel = new RiskModel();
riskModel.train();

const controller = new PredictController(riskModel);

app.use('/', createPredictRoutes(controller));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
