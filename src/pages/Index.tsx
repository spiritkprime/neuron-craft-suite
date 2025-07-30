import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import NeuralNetworkTrainer from '@/components/NeuralNetworkTrainer';
import CatClassifier from '@/components/CatClassifier';
import DataAnalytics from '@/components/DataAnalytics';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-data-blue to-data-purple bg-clip-text text-transparent">
              Neural Network Framework
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive machine learning platform featuring custom neural network implementation, 
            classification algorithms, and advanced data analytics capabilities.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="neural-network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="neural-network">Neural Networks</TabsTrigger>
            <TabsTrigger value="classifier">Cat Classifier</TabsTrigger>
            <TabsTrigger value="analytics">Data Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="neural-network">
            <div className="space-y-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Neural Network Implementation</CardTitle>
                  <CardDescription className="text-center">
                    Custom implementation with backpropagation, supporting single neurons and multi-layer networks
                  </CardDescription>
                </CardHeader>
              </Card>
              <NeuralNetworkTrainer />
            </div>
          </TabsContent>

          <TabsContent value="classifier">
            <div className="space-y-6">
              <Card className="border-success-green/20">
                <CardHeader>
                  <CardTitle className="text-center">Image Classification</CardTitle>
                  <CardDescription className="text-center">
                    Machine learning classifier for cat vs non-cat image recognition using extracted features
                  </CardDescription>
                </CardHeader>
              </Card>
              <CatClassifier />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card className="border-data-blue/20">
                <CardHeader>
                  <CardTitle className="text-center">Data Analytics Platform</CardTitle>
                  <CardDescription className="text-center">
                    Comprehensive data analysis with statistical operations, grouping, and visualization
                  </CardDescription>
                </CardHeader>
              </Card>
              <DataAnalytics />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground">
          <p className="mb-4">Built with custom neural network framework • TypeScript • React • Chart.js</p>
          <div className="flex justify-center space-x-8 text-sm">
            <span>🧠 Custom Backpropagation</span>
            <span>📊 Statistical Analysis</span>
            <span>🎯 Real-time Training</span>
            <span>📈 Interactive Visualizations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
