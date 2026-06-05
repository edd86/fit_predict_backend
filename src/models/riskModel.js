const { DecisionTreeRegression } = require("ml-cart");
const fs = require("fs");
const path = require("path");

const datasetPath = path.join(__dirname, "..", "data", "data_set.json");
const FEATURE_NAMES = ["edad", "horasSueno", "frecCardiaca", "intensidad", "historialLesiones"];

class RiskModel {
  constructor() {
    this.model = null;
    this.metadata = null;
  }

  loadDataset() {
    const raw = fs.readFileSync(datasetPath, "utf-8");
    return JSON.parse(raw);
  }

  train() {
    const data = this.loadDataset();
    const features = data.map((d) => [
      d.edad,
      d.horasSueno,
      d.frecCardiaca,
      d.intensidad,
      d.historialLesiones,
    ]);
    const labels = data.map((d) => d.riesgo);

    const options = {
      gainFunction: "regression",
      maxDepth: 6,
      minRowLength: 2,
    };

    this.model = new DecisionTreeRegression(options);
    this.model.train(features, labels);

    const depth = this._computeDepth(this.model.root);
    this.metadata = {
      type: "regression",
      numRecords: data.length,
      treeDepth: depth,
      features: FEATURE_NAMES,
    };

    console.log(`Model trained with ${data.length} records (depth: ${depth})`);
  }

  _computeDepth(node) {
    if (!node || (!node.left && !node.right)) return 0;
    const leftDepth = node.left ? this._computeDepth(node.left) : 0;
    const rightDepth = node.right ? this._computeDepth(node.right) : 0;
    return 1 + Math.max(leftDepth, rightDepth);
  }

  predict(features) {
    if (!this.model) {
      throw new Error("Model not trained yet");
    }

    return {
      predictions: this.model.predict(features),
    };
  }

  getModelInfo() {
    return this.metadata;
  }

  isTrained() {
    return this.model !== null;
  }
}

module.exports = RiskModel;
