import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TravelRecommendationEngine, 
  TravelUserSegmentation,
  TravelPreferences, 
  Destination,
  generateSampleDestinations 
} from '@/lib/travelML';
import { MapPin, DollarSign, Calendar, Users, Star } from 'lucide-react';

const TravelRecommendations = () => {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    budget: 2000,
    duration: 7,
    travelStyle: 'mid-range',
    interests: [],
    seasonality: 'any',
    groupSize: 2,
    ageGroup: '26-35'
  });
  
  const [recommendations, setRecommendations] = useState<Destination[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCluster, setUserCluster] = useState<number | null>(null);
  const [availableInterests] = useState([
    'beach', 'culture', 'adventure', 'food', 'nature', 'history', 
    'nightlife', 'shopping', 'art', 'music', 'sports', 'wellness'
  ]);

  const engine = new TravelRecommendationEngine(generateSampleDestinations());
  const clustering = new TravelUserSegmentation(4);

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate ML processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate recommendations
    const recs = engine.recommendDestinations(preferences, 6);
    setRecommendations(recs);
    
    // Simulate user clustering
    const sampleUsers = Array.from({ length: 20 }, () => ({
      ...preferences,
      budget: Math.random() * 5000 + 500,
      duration: Math.floor(Math.random() * 21) + 3,
      groupSize: Math.floor(Math.random() * 6) + 1
    }));
    
    const clusters = clustering.cluster([preferences, ...sampleUsers]);
    setUserCluster(clusters[0].cluster);
    
    setIsGenerating(false);
  };

  const getClusterDescription = (cluster: number) => {
    const descriptions = [
      'Budget Explorer - Values affordability and authentic experiences',
      'Luxury Traveler - Prefers comfort and premium experiences', 
      'Adventure Seeker - Loves outdoor activities and new challenges',
      'Cultural Enthusiast - Focuses on history, art, and local culture'
    ];
    return descriptions[cluster] || 'Unique Travel Profile';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-ocean-blue to-mountain-purple bg-clip-text text-transparent">
            AI Travel Recommendations
          </CardTitle>
          <CardDescription>
            Machine learning-powered destination recommendations based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  budget: parseInt(e.target.value) || 0
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={preferences.duration}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  duration: parseInt(e.target.value) || 1
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupSize">Group Size</Label>
              <Input
                id="groupSize"
                type="number"
                value={preferences.groupSize}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  groupSize: parseInt(e.target.value) || 1
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Travel Style</Label>
              <Select
                value={preferences.travelStyle}
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, travelStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="backpacker">Backpacker</SelectItem>
                  <SelectItem value="mid-range">Mid-range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Age Group</Label>
              <Select
                value={preferences.ageGroup}
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, ageGroup: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-25">18-25</SelectItem>
                  <SelectItem value="26-35">26-35</SelectItem>
                  <SelectItem value="36-50">36-50</SelectItem>
                  <SelectItem value="50+">50+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Season</Label>
              <Select
                value={preferences.seasonality}
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, seasonality: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Season</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="fall">Fall</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {availableInterests.map(interest => (
                <Badge
                  key={interest}
                  variant={preferences.interests.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating AI Recommendations...' : 'Get AI Recommendations'}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing preferences...</span>
                <span>Processing ML models</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>
          )}

          {userCluster !== null && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Your Travel Profile</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cluster {userCluster + 1}: {getClusterDescription(userCluster)}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((destination, index) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-ocean-blue/20 to-mountain-purple/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Destination Image</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{destination.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-sand-yellow text-sand-yellow" />
                    <span className="text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {destination.country} • {destination.region}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-forest-green" />
                    <span className="text-sm">${destination.avgCost} avg. cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sunset-orange" />
                    <span className="text-sm">
                      Best: {destination.popularMonths.map(m => 
                        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m-1]
                      ).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {destination.activities.slice(0, 3).map(activity => (
                    <Badge key={activity} variant="secondary" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                  {destination.activities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{destination.activities.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelRecommendations;