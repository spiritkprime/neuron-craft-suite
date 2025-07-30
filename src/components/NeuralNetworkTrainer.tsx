import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SingleNeuron, NeuralNetwork, generateSimpleData, generateXORData } from '@/lib/neuralNetwork';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NeuralNetworkTrainer = () => {
  const [singleNeuron, setSingleNeuron] = useState<SingleNeuron | null>(null);
  const [neuralNetwork, setNeuralNetwork] = useState<NeuralNetwork | null>(null);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [epochs, setEpochs] = useState(100);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [errorHistory, setErrorHistory] = useState<number[]>([]);
  const [testInput, setTestInput] = useState('0.5');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [networkType, setNetworkType] = useState<'single' | 'multi'>('single');

  useEffect(() => {
    // Initialize networks
    setSingleNeuron(new SingleNeuron(1, 0.1));
    setNeuralNetwork(new NeuralNetwork(2, 4, 1));
    setTrainingData(generateSimpleData());
  }, []);

  const trainSingleNeuron = async () => {
    if (!singleNeuron) return;
    
    setIsTraining(true);
    setErrorHistory([]);
    setCurrentEpoch(0);
    
    const data = generateSimpleData();
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (const sample of data) {
        const error = singleNeuron.train(sample.inputs, sample.target[0]);
        totalError += error;
      }
      
      setCurrentEpoch(epoch + 1);
      setErrorHistory(prev => [...prev, totalError / data.length]);
      
      // Add delay for visualization
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    setIsTraining(false);
  };

  const trainMultiLayerNetwork = async () => {
    if (!neuralNetwork) return;
    
    setIsTraining(true);
    setErrorHistory([]);
    setCurrentEpoch(0);
    
    const data = generateXORData();
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (const sample of data) {
        const error = neuralNetwork.train(sample.inputs, sample.target);
        totalError += error;
      }
      
      setCurrentEpoch(epoch + 1);
      setErrorHistory(prev => [...prev, totalError / data.length]);
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setIsTraining(false);
  };

  const testPrediction = () => {
    if (networkType === 'single' && singleNeuron) {
      const input = parseFloat(testInput);
      const result = singleNeuron.feedforward([input]);
      setPrediction(result);
    } else if (networkType === 'multi' && neuralNetwork) {
      const inputs = testInput.split(',').map(x => parseFloat(x.trim()));
      if (inputs.length === 2) {
        const result = neuralNetwork.predict(inputs);
        setPrediction(result[0]);
      }
    }
  };

  const chartData = {
    labels: errorHistory.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Training Error',
        data: errorHistory,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Training Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-primary to-data-blue bg-clip-text text-transparent">
            Neural Network Trainer
          </CardTitle>
          <CardDescription>
            Train single neurons and multi-layer networks with custom data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={networkType === 'single' ? 'default' : 'outline'}
              onClick={() => setNetworkType('single')}
            >
              Single Neuron
            </Button>
            <Button
              variant={networkType === 'multi' ? 'default' : 'outline'}
              onClick={() => setNetworkType('multi')}
            >
              Multi-Layer Network
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="epochs">Training Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={epochs}
                  onChange={(e) => setEpochs(parseInt(e.target.value))}
                  disabled={isTraining}
                />
              </div>

              <Button
                onClick={networkType === 'single' ? trainSingleNeuron : trainMultiLayerNetwork}
                disabled={isTraining}
                className="w-full"
              >
                {isTraining ? `Training... (${currentEpoch}/${epochs})` : 'Start Training'}
              </Button>

              <div className="space-y-2">
                <Label htmlFor="testInput">
                  Test Input {networkType === 'multi' && '(comma-separated: x,y)'}
                </Label>
                <Input
                  id="testInput"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder={networkType === 'single' ? '0.5' : '0,1'}
                />
                <Button onClick={testPrediction} className="w-full">
                  Predict
                </Button>
              </div>

              {prediction !== null && (
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm font-medium">Prediction</p>
                  <p className="text-2xl font-bold text-primary">
                    {prediction.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            <div className="h-64">
              {errorHistory.length > 0 && (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NeuralNetworkTrainer;