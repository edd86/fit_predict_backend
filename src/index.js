const express = require('express');
const RiskModel = require('./models/riskModel');
const PredictController = require('./controllers/predictController');
const createPredictRoutes = require('./routes/predictRoutes');

const app = express();
const PORT = 3005;

app.use(express.json());

const riskModel = new RiskModel();
const controller = new PredictController(riskModel);

app.use('/', createPredictRoutes(controller));

app.listen(PORT, () => {
  riskModel.train();
  console.log(`Server running on http://localhost:${PORT}`);
});
