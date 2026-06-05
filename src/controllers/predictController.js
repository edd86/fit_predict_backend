const CATEGORIES = [
  { max: 25, label: "bajo" },
  { max: 50, label: "medio" },
  { max: 75, label: "alto" },
  { max: 100, label: "critico" },
];

function getCategory(score) {
  for (const cat of CATEGORIES) {
    if (score <= cat.max) return cat.label;
  }
  return "critico";
}

class PredictController {
  constructor(riskModel) {
    this.riskModel = riskModel;
  }

  getStatus(_req, res) {
    const modelInfo = this.riskModel.getModelInfo();
    res.json({
      success: true,
      message: "Fit Predict API running",
      port: process.env.PORT || 3005,
      modelTrained: this.riskModel.isTrained(),
      modelInfo,
    });
  }

  predict(req, res) {
    const { age, sleepHours, heartRate, intensity, injuryHistory } = req.body;

    if (
      age == null ||
      sleepHours == null ||
      heartRate == null ||
      intensity == null ||
      injuryHistory == null
    ) {
      return res.status(400).json({
        success: false,
        error:
          "All fields are required: age, sleepHours, heartRate, intensity, injuryHistory",
      });
    }

    if (!this.riskModel.isTrained()) {
      return res
        .status(500)
        .json({ success: false, error: "Model not trained" });
    }

    try {
      const input = [
        Number(age),
        Number(sleepHours),
        Number(heartRate),
        Number(intensity),
        Number(injuryHistory),
      ];

      const result = this.riskModel.predict([input]);
      const score = Math.round(result.predictions[0] * 10) / 10;
      const modelInfo = this.riskModel.getModelInfo();

      res.json({
        success: true,
        input: { age, sleepHours, heartRate, intensity, injuryHistory },
        risk: {
          score,
          min: 0,
          max: 100,
          category: getCategory(score),
        },
        model: {
          ...modelInfo,
          features: [
            "age",
            "sleepHours",
            "heartRate",
            "intensity",
            "injuryHistory",
          ],
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = PredictController;
