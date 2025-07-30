// Neural Network Framework Implementation
export class Matrix {
  rows: number;
  cols: number;
  data: number[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.data = [];
    
    for (let i = 0; i < rows; i++) {
      this.data[i] = [];
      for (let j = 0; j < cols; j++) {
        this.data[i][j] = 0;
      }
    }
  }

  static fromArray(array: number[]): Matrix {
    const m = new Matrix(array.length, 1);
    for (let i = 0; i < array.length; i++) {
      m.data[i][0] = array[i];
    }
    return m;
  }

  toArray(): number[] {
    const array: number[] = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        array.push(this.data[i][j]);
      }
    }
    return array;
  }

  randomize(): Matrix {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = Math.random() * 2 - 1; // Random between -1 and 1
      }
    }
    return this;
  }

  static multiply(a: Matrix, b: Matrix): Matrix {
    if (a.cols !== b.rows) {
      throw new Error('Columns of A must match rows of B');
    }
    
    const result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  multiply(scalar: number): Matrix {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= scalar;
      }
    }
    return this;
  }

  add(other: Matrix): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrices must have same dimensions');
    }
    
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] += other.data[i][j];
      }
    }
    return this;
  }

  static subtract(a: Matrix, b: Matrix): Matrix {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      throw new Error('Matrices must have same dimensions');
    }
    
    const result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j];
      }
    }
    return result;
  }

  static transpose(matrix: Matrix): Matrix {
    const result = new Matrix(matrix.cols, matrix.rows);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[j][i] = matrix.data[i][j];
      }
    }
    return result;
  }

  map(func: (value: number, i: number, j: number) => number): Matrix {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = func(this.data[i][j], i, j);
      }
    }
    return this;
  }

  static map(matrix: Matrix, func: (value: number, i: number, j: number) => number): Matrix {
    const result = new Matrix(matrix.rows, matrix.cols);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[i][j] = func(matrix.data[i][j], i, j);
      }
    }
    return result;
  }

  copy(): Matrix {
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j];
      }
    }
    return result;
  }
}

// Activation functions
export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
export const dsigmoid = (y: number): number => y * (1 - y);
export const relu = (x: number): number => Math.max(0, x);
export const drelu = (x: number): number => x > 0 ? 1 : 0;

// Single Neuron class
export class SingleNeuron {
  weights: Matrix;
  bias: number;
  learningRate: number;

  constructor(inputSize: number, learningRate: number = 0.1) {
    this.weights = new Matrix(inputSize, 1).randomize();
    this.bias = Math.random() * 2 - 1;
    this.learningRate = learningRate;
  }

  feedforward(inputs: number[]): number {
    const inputMatrix = Matrix.fromArray(inputs);
    const output = Matrix.multiply(Matrix.transpose(this.weights), inputMatrix);
    return sigmoid(output.data[0][0] + this.bias);
  }

  train(inputs: number[], target: number): number {
    const prediction = this.feedforward(inputs);
    const error = target - prediction;
    
    // Backpropagation
    const dOutput = error * dsigmoid(prediction);
    
    // Update weights
    for (let i = 0; i < this.weights.rows; i++) {
      this.weights.data[i][0] += this.learningRate * dOutput * inputs[i];
    }
    
    // Update bias
    this.bias += this.learningRate * dOutput;
    
    return Math.abs(error);
  }
}

// Multi-layer Neural Network
export class NeuralNetwork {
  inputNodes: number;
  hiddenNodes: number;
  outputNodes: number;
  weightsIH: Matrix;
  weightsHO: Matrix;
  biasH: Matrix;
  biasO: Matrix;
  learningRate: number;

  constructor(inputNodes: number, hiddenNodes: number, outputNodes: number) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;

    this.weightsIH = new Matrix(this.hiddenNodes, this.inputNodes).randomize();
    this.weightsHO = new Matrix(this.outputNodes, this.hiddenNodes).randomize();
    
    this.biasH = new Matrix(this.hiddenNodes, 1).randomize();
    this.biasO = new Matrix(this.outputNodes, 1).randomize();
    
    this.learningRate = 0.1;
  }

  setLearningRate(rate: number): void {
    this.learningRate = rate;
  }

  predict(inputArray: number[]): number[] {
    // Convert input array to matrix
    const inputs = Matrix.fromArray(inputArray);
    
    // Calculate hidden layer
    const hidden = Matrix.multiply(this.weightsIH, inputs);
    hidden.add(this.biasH);
    hidden.map(sigmoid);
    
    // Calculate output layer
    const output = Matrix.multiply(this.weightsHO, hidden);
    output.add(this.biasO);
    output.map(sigmoid);
    
    return output.toArray();
  }

  train(inputArray: number[], targetArray: number[]): number {
    // Convert arrays to matrices
    const inputs = Matrix.fromArray(inputArray);
    const targets = Matrix.fromArray(targetArray);
    
    // Forward pass
    const hidden = Matrix.multiply(this.weightsIH, inputs);
    hidden.add(this.biasH);
    hidden.map(sigmoid);
    
    const outputs = Matrix.multiply(this.weightsHO, hidden);
    outputs.add(this.biasO);
    outputs.map(sigmoid);
    
    // Calculate error
    const outputErrors = Matrix.subtract(targets, outputs);
    
    // Calculate gradients for output layer
    const gradients = Matrix.map(outputs, dsigmoid);
    gradients.multiply(this.learningRate);
    gradients.map((val, i, j) => val * outputErrors.data[i][j]);
    
    // Calculate deltas for weights between hidden and output
    const hiddenT = Matrix.transpose(hidden);
    const weightHODeltas = Matrix.multiply(gradients, hiddenT);
    
    // Update weights and bias
    this.weightsHO.add(weightHODeltas);
    this.biasO.add(gradients);
    
    // Calculate hidden layer errors
    const weightsHOT = Matrix.transpose(this.weightsHO);
    const hiddenErrors = Matrix.multiply(weightsHOT, outputErrors);
    
    // Calculate gradients for hidden layer
    const hiddenGradients = Matrix.map(hidden, dsigmoid);
    hiddenGradients.multiply(this.learningRate);
    hiddenGradients.map((val, i, j) => val * hiddenErrors.data[i][j]);
    
    // Calculate deltas for weights between input and hidden
    const inputsT = Matrix.transpose(inputs);
    const weightIHDeltas = Matrix.multiply(hiddenGradients, inputsT);
    
    // Update weights and bias
    this.weightsIH.add(weightIHDeltas);
    this.biasH.add(hiddenGradients);
    
    // Return total error for monitoring
    return outputErrors.toArray().reduce((sum, error) => sum + Math.abs(error), 0);
  }
}

// Training data generator
export const generateXORData = () => {
  return [
    { inputs: [0, 0], target: [0] },
    { inputs: [0, 1], target: [1] },
    { inputs: [1, 0], target: [1] },
    { inputs: [1, 1], target: [0] }
  ];
};

export const generateSimpleData = () => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    const x = Math.random();
    const y = x > 0.5 ? 1 : 0; // Simple threshold function
    data.push({ inputs: [x], target: [y] });
  }
  return data;
};

// Cat classifier simulation (using simple features)
export const generateCatData = () => {
  const data = [];
  for (let i = 0; i < 200; i++) {
    // Simulate image features: [average_color, edge_density, roundness]
    const features = [
      Math.random(), // average color (0-1)
      Math.random(), // edge density (0-1)
      Math.random()  // roundness (0-1)
    ];
    
    // Simple rule: cats tend to have certain feature combinations
    const isCat = (features[0] > 0.3 && features[1] > 0.4 && features[2] > 0.5) ? 1 : 0;
    data.push({ 
      inputs: features, 
      target: [isCat],
      label: isCat ? 'Cat' : 'Not Cat'
    });
  }
  return data;
};