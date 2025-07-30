import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewSentimentAnalyzer } from '@/lib/travelML';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar, 
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TravelInsights = () => {
  const [analyzer] = useState(new ReviewSentimentAnalyzer());
  const [userReview, setUserReview] = useState('');
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [travelTrends, setTravelTrends] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleReviews = [
    "Amazing destination! The beaches were beautiful and the local food was incredible. Highly recommended!",
    "Overpriced and too crowded. The hotel service was terrible and the weather was disappointing.",
    "Good experience overall. Nice culture and friendly people, but transportation was challenging.",
    "Perfect vacation spot! Everything exceeded expectations. The tours were fantastic and staff was helpful.",
    "Average destination. Nothing special but not bad either. Would consider visiting again.",
    "Absolutely horrible. Worst vacation ever. Avoid this place at all costs.",
    "Breathtaking scenery and unforgettable experiences. The adventure activities were amazing!",
    "Decent value for money. Some issues with accommodation but the attractions made up for it."
  ];

  useEffect(() => {
    generateTravelTrends();
  }, []);

  const analyzeUserReview = async () => {
    if (!userReview.trim()) return;
    
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = analyzer.analyzeSentiment(userReview);
    setSentimentResult(result);
    setIsAnalyzing(false);
  };

  const generateTravelTrends = () => {
    // Simulate travel analytics data
    const destinations = ['Bali', 'Tokyo', 'Paris', 'New York', 'Dubai', 'Bangkok'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const popularityData = destinations.map(dest => ({
      destination: dest,
      searches: Math.floor(Math.random() * 10000) + 5000,
      bookings: Math.floor(Math.random() * 5000) + 2000,
      avgRating: (Math.random() * 2 + 3).toFixed(1)
    }));

    const seasonalData = months.map(month => ({
      month,
      bookings: Math.floor(Math.random() * 8000) + 2000,
      avgPrice: Math.floor(Math.random() * 500) + 800
    }));

    // Analyze sample reviews
    const reviewAnalysis = analyzer.analyzeReviews(sampleReviews);

    setTravelTrends({
      popularity: popularityData,
      seasonal: seasonalData,
      sentiment: reviewAnalysis
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-forest-green';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4" />;
      case 'negative': return <ThumbsDown className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Chart configurations
  const popularityChartData = travelTrends ? {
    labels: travelTrends.popularity.map((d: any) => d.destination),
    datasets: [
      {
        label: 'Searches',
        data: travelTrends.popularity.map((d: any) => d.searches),
        backgroundColor: 'hsl(var(--ocean-blue) / 0.7)',
        borderColor: 'hsl(var(--ocean-blue))',
        borderWidth: 1,
      },
      {
        label: 'Bookings',
        data: travelTrends.popularity.map((d: any) => d.bookings),
        backgroundColor: 'hsl(var(--forest-green) / 0.7)',
        borderColor: 'hsl(var(--forest-green))',
        borderWidth: 1,
      },
    ],
  } : null;

  const sentimentChartData = travelTrends ? {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        data: [
          travelTrends.sentiment.breakdown.positive,
          travelTrends.sentiment.breakdown.negative,
          travelTrends.sentiment.breakdown.neutral,
        ],
        backgroundColor: [
          'hsl(var(--forest-green))',
          'hsl(var(--destructive))',
          'hsl(var(--muted))',
        ],
        borderWidth: 2,
        borderColor: 'hsl(var(--background))',
      },
    ],
  } : null;

  const seasonalChartData = travelTrends ? {
    labels: travelTrends.seasonal.map((d: any) => d.month),
    datasets: [
      {
        label: 'Average Price',
        data: travelTrends.seasonal.map((d: any) => d.avgPrice),
        borderColor: 'hsl(var(--sunset-orange))',
        backgroundColor: 'hsl(var(--sunset-orange) / 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
      {
        label: 'Bookings',
        data: travelTrends.seasonal.map((d: any) => d.bookings),
        borderColor: 'hsl(var(--mountain-purple))',
        backgroundColor: 'hsl(var(--mountain-purple) / 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const seasonalChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Bookings',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Price (USD)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-forest-green to-sunset-orange bg-clip-text text-transparent">
            Travel Analytics & Insights
          </CardTitle>
          <CardDescription>
            AI-powered sentiment analysis and travel market intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sentiment" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
              <TabsTrigger value="trends">Market Trends</TabsTrigger>
              <TabsTrigger value="insights">Travel Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="sentiment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Analyze the sentiment of travel reviews using natural language processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter a travel review</label>
                    <Textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder="Share your travel experience..."
                      className="min-h-20"
                    />
                  </div>

                  <Button 
                    onClick={analyzeUserReview}
                    disabled={isAnalyzing || !userReview.trim()}
                    className="w-full"
                  >
                    {isAnalyzing ? 'Analyzing Sentiment...' : 'Analyze Review'}
                  </Button>

                  {sentimentResult && (
                    <Card className="border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(sentimentResult.sentiment)}
                            <span className="font-semibold">Sentiment Analysis</span>
                          </div>
                          <Badge 
                            variant={sentimentResult.sentiment === 'positive' ? 'default' : 
                                    sentimentResult.sentiment === 'negative' ? 'destructive' : 'secondary'}
                          >
                            {sentimentResult.sentiment.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sentiment Score</span>
                            <span className={getSentimentColor(sentimentResult.sentiment)}>
                              {sentimentResult.score.toFixed(3)}
                            </span>
                          </div>
                          <Progress 
                            value={(sentimentResult.score + 1) * 50} 
                            className="w-full h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Negative</span>
                            <span>Neutral</span>
                            <span>Positive</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {travelTrends && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Overall Review Sentiment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="p-3 bg-forest-green/10 rounded-lg">
                                <ThumbsUp className="w-6 h-6 mx-auto mb-1 text-forest-green" />
                                <p className="text-lg font-bold">{travelTrends.sentiment.breakdown.positive}</p>
                                <p className="text-xs text-muted-foreground">Positive</p>
                              </div>
                              <div className="p-3 bg-muted rounded-lg">
                                <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-lg font-bold">{travelTrends.sentiment.breakdown.neutral}</p>
                                <p className="text-xs text-muted-foreground">Neutral</p>
                              </div>
                              <div className="p-3 bg-destructive/10 rounded-lg">
                                <ThumbsDown className="w-6 h-6 mx-auto mb-1 text-destructive" />
                                <p className="text-lg font-bold">{travelTrends.sentiment.breakdown.negative}</p>
                                <p className="text-xs text-muted-foreground">Negative</p>
                              </div>
                            </div>
                          </div>
                          <div className="h-48">
                            {sentimentChartData && (
                              <Doughnut data={sentimentChartData} options={chartOptions} />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {travelTrends && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Destination Popularity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {popularityChartData && (
                          <Bar data={popularityChartData} options={chartOptions} />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Seasonal Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        {seasonalChartData && (
                          <Line data={seasonalChartData} options={seasonalChartOptions} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {travelTrends && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-forest-green" />
                        <span className="font-semibold">Top Destination</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {travelTrends.popularity.reduce((max: any, dest: any) => 
                          dest.bookings > max.bookings ? dest : max
                        ).destination}
                      </p>
                      <p className="text-sm text-muted-foreground">Most bookings this month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-ocean-blue" />
                        <span className="font-semibold">Peak Season</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {travelTrends.seasonal.reduce((max: any, month: any) => 
                          month.bookings > max.bookings ? month : max
                        ).month}
                      </p>
                      <p className="text-sm text-muted-foreground">Highest booking volume</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-sand-yellow" />
                        <span className="font-semibold">Avg Sentiment</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {travelTrends.sentiment.averageScore > 0 ? 'Positive' : 
                         travelTrends.sentiment.averageScore < 0 ? 'Negative' : 'Neutral'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {travelTrends.sentiment.averageScore.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">AI Travel Recommendations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">Best Value Destinations</span>
                          </div>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Bangkok - High satisfaction, low cost</li>
                            <li>• Bali - Perfect for longer stays</li>
                            <li>• Dubai - Luxury experiences available</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium">Booking Insights</span>
                          </div>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Book 6-8 weeks ahead for best prices</li>
                            <li>• Avoid peak summer months for crowds</li>
                            <li>• Tuesday/Wednesday departures save 15%</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelInsights;