import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TravelRecommendations from '@/components/TravelRecommendations';
import FlightPricePredictor from '@/components/FlightPricePredictor';
import TravelInsights from '@/components/TravelInsights';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-ocean-blue via-mountain-purple to-forest-green bg-clip-text text-transparent">
              AI Travel Platform
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Machine learning-powered travel planning and booking with personalized recommendations, 
            price predictions, and intelligent market insights.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="pricing">Price Prediction</TabsTrigger>
            <TabsTrigger value="insights">Travel Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <div className="space-y-6">
              <Card className="border-ocean-blue/20">
                <CardHeader>
                  <CardTitle className="text-center">Personalized Destination Recommendations</CardTitle>
                  <CardDescription className="text-center">
                    ML-powered recommendations using collaborative filtering and user segmentation
                  </CardDescription>
                </CardHeader>
              </Card>
              <TravelRecommendations />
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="space-y-6">
              <Card className="border-forest-green/20">
                <CardHeader>
                  <CardTitle className="text-center">Flight Price Prediction</CardTitle>
                  <CardDescription className="text-center">
                    Advanced ML models for price forecasting and optimal booking timing
                  </CardDescription>
                </CardHeader>
              </Card>
              <FlightPricePredictor />
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <Card className="border-sunset-orange/20">
                <CardHeader>
                  <CardTitle className="text-center">Travel Analytics & Market Intelligence</CardTitle>
                  <CardDescription className="text-center">
                    Sentiment analysis, market trends, and AI-driven travel insights
                  </CardDescription>
                </CardHeader>
              </Card>
              <TravelInsights />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground">
          <p className="mb-4">Powered by Advanced Machine Learning • Real-time Analytics • Personalized AI</p>
          <div className="flex justify-center space-x-8 text-sm">
            <span>🤖 ML Recommendations</span>
            <span>📈 Price Prediction</span>
            <span>💬 Sentiment Analysis</span>
            <span>🌍 Market Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
