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
    const { edad, horasSueno, frecCardiaca, intensidad, historialLesiones } =
      req.body;

    if (
      edad == null ||
      horasSueno == null ||
      frecCardiaca == null ||
      intensidad == null ||
      historialLesiones == null
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Todos los campos son requeridos: edad, horasSueno, frecCardiaca, intensidad, historialLesiones",
      });
    }

    if (!this.riskModel.isTrained()) {
      return res.status(500).json({ success: false, error: "Modelo no entrenado" });
    }

    try {
      const input = [
        Number(edad),
        Number(horasSueno),
        Number(frecCardiaca),
        Number(intensidad),
        Number(historialLesiones),
      ];

      const result = this.riskModel.predict([input]);
      const puntaje = Math.round(result.predictions[0] * 10) / 10;

      res.json({
        success: true,
        input: { edad, horasSueno, frecCardiaca, intensidad, historialLesiones },
        riesgo: {
          puntaje,
          min: 0,
          max: 100,
          categoria: getCategory(puntaje),
        },
        modelo: this.riskModel.getModelInfo(),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = PredictController;
