import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FlightPricePrediction, FlightPrediction, generateFlightData } from '@/lib/travelML';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus, Plane, Calendar, DollarSign, AlertCircle } from 'lucide-react';
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

const FlightPricePredictor = () => {
  const [predictor] = useState(() => {
    const pred = new FlightPricePrediction();
    pred.train(generateFlightData());
    return pred;
  });
  
  const [fromCity, setFromCity] = useState('New York');
  const [toCity, setToCity] = useState('London');
  const [departureDate, setDepartureDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [prediction, setPrediction] = useState<FlightPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  useEffect(() => {
    // Set default departure date to 30 days from now
    const future = new Date();
    future.setDate(future.getDate() + 30);
    setDepartureDate(future.toISOString().split('T')[0]);
  }, []);

  const generatePrediction = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const today = new Date();
    const departure = new Date(departureDate);
    const daysAhead = Math.max(0, Math.floor((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const dayOfWeek = departure.getDay();
    const month = departure.getMonth() + 1;
    const demand = Math.random(); // Simulated demand factor
    const currentPrice = 400 + Math.random() * 800;
    
    const features = [daysAhead, dayOfWeek, month, demand, currentPrice];
    const pred = predictor.predict(features);
    
    // Generate price history for visualization
    const history = [];
    for (let i = 60; i >= 0; i -= 5) {
      const histFeatures = [i, dayOfWeek, month, demand * (1 + Math.random() * 0.2), currentPrice];
      const histPred = predictor.predict(histFeatures);
      history.push(histPred.predictedPrice);
    }
    setPriceHistory(history);
    
    setPrediction({
      ...pred,
      route: `${fromCity} → ${toCity}`,
      currentPrice: Math.round(currentPrice),
      predictedPrice: Math.round(pred.predictedPrice)
    });
    
    setIsLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-destructive" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-forest-green" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'destructive';
      case 'decreasing':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const chartData = {
    labels: Array.from({ length: priceHistory.length }, (_, i) => `${60 - i * 5} days ago`),
    datasets: [
      {
        label: 'Price History',
        data: priceHistory,
        borderColor: 'hsl(var(--ocean-blue))',
        backgroundColor: 'hsl(var(--ocean-blue) / 0.1)',
        tension: 0.4,
        fill: true,
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
        text: 'Price Trend Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (USD)',
        },
      },
    },
  };

  const cities = [
    'New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Dubai', 'Singapore',
    'Los Angeles', 'Barcelona', 'Rome', 'Amsterdam', 'Bangkok'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-ocean-blue to-forest-green bg-clip-text text-transparent">
            Flight Price Predictor
          </CardTitle>
          <CardDescription>
            AI-powered price prediction and booking recommendations using machine learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromCity} onValueChange={setFromCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toCity} onValueChange={setToCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.filter(city => city !== fromCity).map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Passengers</Label>
              <Input
                type="number"
                value={passengers}
                onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                min="1"
                max="9"
              />
            </div>
          </div>

          <Button 
            onClick={generatePrediction}
            disabled={isLoading || !fromCity || !toCity || !departureDate}
            className="w-full"
          >
            {isLoading ? 'Analyzing Market Data...' : 'Predict Prices'}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Price Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-2xl font-bold">${prediction.currentPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Predicted Price</p>
                  <p className="text-2xl font-bold text-primary">${prediction.predictedPrice}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {getTrendIcon(prediction.trend)}
                    <span className="text-sm font-medium">Trend</span>
                  </div>
                  <Badge variant={getTrendColor(prediction.trend) as any}>
                    {prediction.trend}
                  </Badge>
                </div>

                <div className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Confidence</span>
                  </div>
                  <p className="text-lg font-bold">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-accent rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">Booking Recommendation</span>
                </div>
                <p className="text-sm">{prediction.bestBookingWindow}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Price Breakdown (per person)</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Base fare</span>
                    <span>${Math.round(prediction.predictedPrice * 0.7)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & fees</span>
                    <span>${Math.round(prediction.predictedPrice * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel surcharge</span>
                    <span>${Math.round(prediction.predictedPrice * 0.1)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total</span>
                    <span>${prediction.predictedPrice}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Book Flight - ${prediction.predictedPrice * passengers} total
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Price History & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {priceHistory.length > 0 && (
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-1 text-forest-green" />
                  <p className="text-sm text-muted-foreground">Best Price</p>
                  <p className="font-bold">${Math.min(...priceHistory)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1 text-sunset-orange" />
                  <p className="text-sm text-muted-foreground">Peak Price</p>
                  <p className="font-bold">${Math.max(...priceHistory)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FlightPricePredictor;