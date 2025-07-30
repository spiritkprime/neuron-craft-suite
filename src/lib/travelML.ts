// Travel Machine Learning Models and Algorithms

export interface TravelPreferences {
  budget: number;
  duration: number;
  travelStyle: 'luxury' | 'mid-range' | 'budget' | 'backpacker';
  interests: string[];
  seasonality: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  groupSize: number;
  ageGroup: '18-25' | '26-35' | '36-50' | '50+';
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  avgCost: number;
  popularMonths: number[];
  climate: string;
  activities: string[];
  rating: number;
  coordinates: [number, number];
  imageUrl: string;
}

export interface FlightPrediction {
  route: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  bestBookingWindow: string;
}

export interface HotelRecommendation {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  amenities: string[];
  mlScore: number;
  priceCategory: 'budget' | 'mid-range' | 'luxury';
}

// K-Means Clustering for User Segmentation
export class TravelUserSegmentation {
  private clusters: TravelPreferences[][] = [];
  
  constructor(private k: number = 4) {}

  // Simplified K-means implementation
  cluster(users: TravelPreferences[]): { cluster: number; centroid: TravelPreferences }[] {
    const features = users.map(user => this.extractFeatures(user));
    
    // Initialize centroids randomly
    let centroids = this.initializeCentroids(features, this.k);
    let assignments: number[] = new Array(users.length);
    let hasChanged = true;
    
    // Iterate until convergence
    for (let iter = 0; iter < 100 && hasChanged; iter++) {
      hasChanged = false;
      
      // Assign points to nearest centroid
      for (let i = 0; i < features.length; i++) {
        const distances = centroids.map(centroid => 
          this.euclideanDistance(features[i], centroid)
        );
        const newAssignment = distances.indexOf(Math.min(...distances));
        
        if (assignments[i] !== newAssignment) {
          hasChanged = true;
          assignments[i] = newAssignment;
        }
      }
      
      // Update centroids
      for (let k = 0; k < this.k; k++) {
        const clusterPoints = features.filter((_, i) => assignments[i] === k);
        if (clusterPoints.length > 0) {
          centroids[k] = this.calculateCentroid(clusterPoints);
        }
      }
    }
    
    return users.map((user, i) => ({
      cluster: assignments[i],
      centroid: this.featuresToPreferences(centroids[assignments[i]])
    }));
  }

  private extractFeatures(user: TravelPreferences): number[] {
    return [
      Math.log(user.budget + 1) / 10, // Normalized budget
      user.duration / 30, // Normalized duration
      user.groupSize / 10, // Normalized group size
      this.encodeCategory(user.travelStyle, ['budget', 'backpacker', 'mid-range', 'luxury']),
      this.encodeCategory(user.ageGroup, ['18-25', '26-35', '36-50', '50+']),
      user.interests.length / 20 // Normalized interest count
    ];
  }

  private encodeCategory(value: string, categories: string[]): number {
    return categories.indexOf(value) / (categories.length - 1);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  private initializeCentroids(features: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * features.length);
      centroids.push([...features[randomIndex]]);
    }
    return centroids;
  }

  private calculateCentroid(points: number[][]): number[] {
    const dimensions = points[0].length;
    const centroid = new Array(dimensions).fill(0);
    
    for (const point of points) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += point[i];
      }
    }
    
    return centroid.map(val => val / points.length);
  }

  private featuresToPreferences(features: number[]): TravelPreferences {
    const styles = ['budget', 'backpacker', 'mid-range', 'luxury'];
    const ageGroups = ['18-25', '26-35', '36-50', '50+'];
    
    return {
      budget: Math.exp(features[0] * 10) - 1,
      duration: features[1] * 30,
      groupSize: features[2] * 10,
      travelStyle: styles[Math.round(features[3] * (styles.length - 1))] as any,
      ageGroup: ageGroups[Math.round(features[4] * (ageGroups.length - 1))] as any,
      interests: [],
      seasonality: 'any'
    };
  }
}

// Recommendation Engine using Collaborative Filtering
export class TravelRecommendationEngine {
  private destinations: Destination[] = [];
  private userSimilarities: Map<string, Map<string, number>> = new Map();

  constructor(destinations: Destination[]) {
    this.destinations = destinations;
  }

  // Content-based filtering
  recommendDestinations(
    preferences: TravelPreferences, 
    limit: number = 10
  ): Destination[] {
    const scores = this.destinations.map(destination => ({
      destination,
      score: this.calculateDestinationScore(destination, preferences)
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.destination);
  }

  private calculateDestinationScore(
    destination: Destination, 
    preferences: TravelPreferences
  ): number {
    let score = 0;

    // Budget compatibility (30% weight)
    const budgetScore = this.calculateBudgetScore(destination.avgCost, preferences.budget);
    score += budgetScore * 0.3;

    // Interest matching (40% weight)
    const interestScore = this.calculateInterestScore(destination.activities, preferences.interests);
    score += interestScore * 0.4;

    // Seasonality matching (20% weight)
    const seasonScore = this.calculateSeasonScore(destination, preferences.seasonality);
    score += seasonScore * 0.2;

    // Base rating (10% weight)
    score += (destination.rating / 5) * 0.1;

    return score;
  }

  private calculateBudgetScore(destCost: number, userBudget: number): number {
    if (destCost <= userBudget) {
      return 1 - (destCost / userBudget) * 0.5; // Prefer moderate spending
    } else {
      const overage = (destCost - userBudget) / userBudget;
      return Math.max(0, 1 - overage * 2); // Penalize over-budget destinations
    }
  }

  private calculateInterestScore(activities: string[], interests: string[]): number {
    if (interests.length === 0) return 0.5;
    
    const matches = activities.filter(activity => 
      interests.some(interest => 
        activity.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(activity.toLowerCase())
      )
    ).length;
    
    return Math.min(matches / interests.length, 1);
  }

  private calculateSeasonScore(destination: Destination, season: string): number {
    if (season === 'any') return 1;
    
    const seasonMonths = {
      'spring': [3, 4, 5],
      'summer': [6, 7, 8],
      'fall': [9, 10, 11],
      'winter': [12, 1, 2]
    };
    
    const preferredMonths = seasonMonths[season as keyof typeof seasonMonths] || [];
    const overlap = destination.popularMonths.filter(month => 
      preferredMonths.includes(month)
    ).length;
    
    return overlap / Math.max(preferredMonths.length, 1);
  }
}

// Price Prediction using Linear Regression
export class FlightPricePrediction {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number = 0.01;

  constructor() {
    // Initialize with some reasonable weights
    this.weights = [0.1, -0.05, 0.3, 0.2, -0.1]; // [days_ahead, day_of_week, month, demand, fuel_cost]
    this.bias = 0;
  }

  predict(features: number[]): FlightPrediction {
    const prediction = this.linearPredict(features);
    const currentPrice = features[features.length - 1]; // Assume last feature is current price
    
    // Add some realistic noise and trends
    const trend = prediction > currentPrice ? 'increasing' : 
                  prediction < currentPrice ? 'decreasing' : 'stable';
    
    const confidence = Math.max(0.6, Math.min(0.95, 1 - Math.abs(prediction - currentPrice) / currentPrice));
    
    return {
      route: 'Sample Route',
      currentPrice,
      predictedPrice: Math.max(100, prediction),
      confidence,
      trend,
      bestBookingWindow: this.calculateBestBookingWindow(features)
    };
  }

  private linearPredict(features: number[]): number {
    let result = this.bias;
    for (let i = 0; i < Math.min(features.length, this.weights.length); i++) {
      result += features[i] * this.weights[i];
    }
    return result;
  }

  private calculateBestBookingWindow(features: number[]): string {
    const daysAhead = features[0];
    
    if (daysAhead > 60) return '45-60 days before departure';
    if (daysAhead > 30) return '21-45 days before departure';
    if (daysAhead > 14) return '7-21 days before departure';
    return 'Book now - prices may increase';
  }

  // Simplified training method
  train(trainingData: { features: number[], target: number }[]): void {
    for (let epoch = 0; epoch < 100; epoch++) {
      for (const sample of trainingData) {
        const prediction = this.linearPredict(sample.features);
        const error = sample.target - prediction;
        
        // Update weights
        for (let i = 0; i < this.weights.length && i < sample.features.length; i++) {
          this.weights[i] += this.learningRate * error * sample.features[i];
        }
        this.bias += this.learningRate * error;
      }
    }
  }
}

// Sentiment Analysis for Reviews
export class ReviewSentimentAnalyzer {
  private positiveWords = [
    'amazing', 'excellent', 'fantastic', 'wonderful', 'great', 'perfect',
    'beautiful', 'stunning', 'incredible', 'awesome', 'outstanding',
    'magnificent', 'spectacular', 'breathtaking', 'unforgettable'
  ];

  private negativeWords = [
    'terrible', 'awful', 'horrible', 'disgusting', 'disappointing',
    'overpriced', 'crowded', 'dirty', 'rude', 'worst', 'nightmare',
    'waste', 'avoid', 'regret', 'scam', 'fraud'
  ];

  analyzeSentiment(review: string): { score: number; sentiment: 'positive' | 'negative' | 'neutral' } {
    const words = review.toLowerCase().split(/\s+/);
    let score = 0;

    for (const word of words) {
      if (this.positiveWords.includes(word)) {
        score += 1;
      } else if (this.negativeWords.includes(word)) {
        score -= 1;
      }
    }

    // Normalize score
    const normalizedScore = Math.max(-1, Math.min(1, score / words.length * 10));
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (normalizedScore > 0.1) sentiment = 'positive';
    else if (normalizedScore < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';

    return { score: normalizedScore, sentiment };
  }

  analyzeReviews(reviews: string[]): { 
    averageScore: number; 
    sentiment: 'positive' | 'negative' | 'neutral';
    breakdown: { positive: number; negative: number; neutral: number };
  } {
    const analyses = reviews.map(review => this.analyzeSentiment(review));
    const averageScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0) / analyses.length;
    
    const breakdown = analyses.reduce((acc, analysis) => {
      acc[analysis.sentiment]++;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    let overallSentiment: 'positive' | 'negative' | 'neutral';
    if (averageScore > 0.1) overallSentiment = 'positive';
    else if (averageScore < -0.1) overallSentiment = 'negative';
    else overallSentiment = 'neutral';

    return { averageScore, sentiment: overallSentiment, breakdown };
  }
}

// Sample data generators
export const generateSampleDestinations = (): Destination[] => [
  {
    id: '1',
    name: 'Bali',
    country: 'Indonesia',
    region: 'Southeast Asia',
    avgCost: 1200,
    popularMonths: [6, 7, 8, 9],
    climate: 'tropical',
    activities: ['beach', 'temples', 'yoga', 'surfing', 'culture'],
    rating: 4.6,
    coordinates: [-8.3405, 115.0920],
    imageUrl: '/api/placeholder/400/300'
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    region: 'East Asia',
    avgCost: 2500,
    popularMonths: [3, 4, 5, 10, 11],
    climate: 'temperate',
    activities: ['culture', 'food', 'technology', 'temples', 'shopping'],
    rating: 4.8,
    coordinates: [35.6762, 139.6503],
    imageUrl: '/api/placeholder/400/300'
  },
  {
    id: '3',
    name: 'Iceland',
    country: 'Iceland',
    region: 'Northern Europe',
    avgCost: 3000,
    popularMonths: [6, 7, 8],
    climate: 'arctic',
    activities: ['nature', 'hiking', 'aurora', 'geysers', 'photography'],
    rating: 4.7,
    coordinates: [64.9631, -19.0208],
    imageUrl: '/api/placeholder/400/300'
  },
  {
    id: '4',
    name: 'Costa Rica',
    country: 'Costa Rica',
    region: 'Central America',
    avgCost: 1800,
    popularMonths: [12, 1, 2, 3, 4],
    climate: 'tropical',
    activities: ['adventure', 'wildlife', 'beaches', 'hiking', 'eco-tourism'],
    rating: 4.5,
    coordinates: [9.7489, -83.7534],
    imageUrl: '/api/placeholder/400/300'
  },
  {
    id: '5',
    name: 'Morocco',
    country: 'Morocco',
    region: 'North Africa',
    avgCost: 1500,
    popularMonths: [3, 4, 5, 10, 11],
    climate: 'arid',
    activities: ['culture', 'markets', 'desert', 'architecture', 'food'],
    rating: 4.4,
    coordinates: [31.7917, -7.0926],
    imageUrl: '/api/placeholder/400/300'
  }
];

export const generateFlightData = (): { features: number[], target: number }[] => {
  const data = [];
  for (let i = 0; i < 100; i++) {
    const daysAhead = Math.random() * 120;
    const dayOfWeek = Math.floor(Math.random() * 7);
    const month = Math.floor(Math.random() * 12) + 1;
    const demand = Math.random();
    const currentPrice = 300 + Math.random() * 800;
    
    // Simple price model: earlier booking = cheaper, peak months = more expensive
    const target = currentPrice * (1 + (120 - daysAhead) / 240) * (month === 7 || month === 12 ? 1.3 : 1);
    
    data.push({
      features: [daysAhead, dayOfWeek, month, demand, currentPrice],
      target
    });
  }
  return data;
};