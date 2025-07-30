import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { NeuralNetwork, generateCatData } from '@/lib/neuralNetwork';
import { Scatter } from 'react-chartjs-2';
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

const CatClassifier = () => {
  const [network, setNetwork] = useState<NeuralNetwork | null>(null);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [testData, setTestData] = useState<any[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [testFeatures, setTestFeatures] = useState({
    avgColor: 0.5,
    edgeDensity: 0.5,
    roundness: 0.5
  });
  const [prediction, setPrediction] = useState<{ probability: number; label: string } | null>(null);

  useEffect(() => {
    // Initialize network for image classification (3 features -> 4 hidden -> 1 output)
    setNetwork(new NeuralNetwork(3, 8, 1));
    
    // Generate training and test data
    const allData = generateCatData();
    const trainSize = Math.floor(allData.length * 0.8);
    setTrainingData(allData.slice(0, trainSize));
    setTestData(allData.slice(trainSize));
  }, []);

  const trainClassifier = async () => {
    if (!network || !trainingData.length) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    const epochs = 500;
    network.setLearningRate(0.3);
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      // Shuffle training data
      const shuffled = [...trainingData].sort(() => Math.random() - 0.5);
      
      for (const sample of shuffled) {
        network.train(sample.inputs, sample.target);
      }
      
      // Update progress
      const progress = ((epoch + 1) / epochs) * 100;
      setTrainingProgress(progress);
      
      // Calculate accuracy every 50 epochs
      if ((epoch + 1) % 50 === 0) {
        calculateAccuracy();
      }
      
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    
    setIsTraining(false);
    calculateAccuracy();
  };

  const calculateAccuracy = () => {
    if (!network || !testData.length) return;
    
    let correct = 0;
    for (const sample of testData) {
      const prediction = network.predict(sample.inputs)[0];
      const predicted = prediction > 0.5 ? 1 : 0;
      if (predicted === sample.target[0]) {
        correct++;
      }
    }
    
    setAccuracy((correct / testData.length) * 100);
  };

  const classifyImage = () => {
    if (!network) return;
    
    const features = [testFeatures.avgColor, testFeatures.edgeDensity, testFeatures.roundness];
    const output = network.predict(features)[0];
    const label = output > 0.5 ? 'Cat' : 'Not Cat';
    
    setPrediction({
      probability: output,
      label: label
    });
  };

  // Prepare scatter plot data
  const scatterData = {
    datasets: [
      {
        label: 'Cats',
        data: trainingData
          .filter(item => item.target[0] === 1)
          .map(item => ({
            x: item.inputs[0], // avg color
            y: item.inputs[1]  // edge density
          })),
        backgroundColor: 'hsl(var(--success-green))',
        pointRadius: 4,
      },
      {
        label: 'Not Cats',
        data: trainingData
          .filter(item => item.target[0] === 0)
          .map(item => ({
            x: item.inputs[0],
            y: item.inputs[1]
          })),
        backgroundColor: 'hsl(var(--destructive))',
        pointRadius: 4,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Training Data Distribution (Color vs Edge Density)',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Average Color'
        },
        min: 0,
        max: 1
      },
      y: {
        title: {
          display: true,
          text: 'Edge Density'
        },
        min: 0,
        max: 1
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-success-green to-data-purple bg-clip-text text-transparent">
            Cat vs Non-Cat Classifier
          </CardTitle>
          <CardDescription>
            Train a neural network to classify images as cats or non-cats using extracted features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Training Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{trainingProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-bold text-success-green">{accuracy.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={trainClassifier}
                disabled={isTraining}
                className="w-full"
              >
                {isTraining ? 'Training...' : 'Train Classifier'}
              </Button>

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Test Image Features</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="avgColor">Average Color Intensity</Label>
                    <Input
                      id="avgColor"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={testFeatures.avgColor}
                      onChange={(e) => setTestFeatures({
                        ...testFeatures,
                        avgColor: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edgeDensity">Edge Density</Label>
                    <Input
                      id="edgeDensity"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={testFeatures.edgeDensity}
                      onChange={(e) => setTestFeatures({
                        ...testFeatures,
                        edgeDensity: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="roundness">Roundness</Label>
                    <Input
                      id="roundness"
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={testFeatures.roundness}
                      onChange={(e) => setTestFeatures({
                        ...testFeatures,
                        roundness: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <Button onClick={classifyImage} className="w-full">
                  Classify
                </Button>
              </div>

              {prediction && (
                <div className="p-4 bg-accent rounded-lg">
                  <h3 className="font-semibold mb-2">Classification Result</h3>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-primary">{prediction.label}</p>
                    <p className="text-sm">
                      Confidence: {(prediction.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-96">
              <Scatter data={scatterData} options={scatterOptions} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatClassifier;