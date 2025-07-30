import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataFrame, generateRandomData, generateSalesData } from '@/lib/dataAnalytics';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DataAnalytics = () => {
  const [dataFrame, setDataFrame] = useState<DataFrame | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<'random' | 'sales'>('random');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [groupByColumn, setGroupByColumn] = useState<string>('');
  const [aggregateColumn, setSelectedAggregateColumn] = useState<string>('');
  const [aggregateFunction, setAggregateFunction] = useState<'sum' | 'mean' | 'count'>('sum');
  const [statistics, setStatistics] = useState<any>(null);
  const [pivotData, setPivotData] = useState<any>(null);

  useEffect(() => {
    loadDataset();
  }, [selectedDataset]);

  const loadDataset = () => {
    let data;
    if (selectedDataset === 'random') {
      data = new DataFrame(generateRandomData(50));
    } else {
      data = new DataFrame(generateSalesData());
    }
    setDataFrame(data);
    if (data.columns.length > 0) {
      setSelectedColumn(data.columns[0]);
      setGroupByColumn(data.columns[0]);
      setSelectedAggregateColumn(data.columns.find(col => 
        typeof data.data[0][col] === 'number'
      ) || data.columns[0]);
    }
  };

  const calculateStatistics = () => {
    if (!dataFrame || !selectedColumn) return;
    const stats = dataFrame.describe(selectedColumn);
    setStatistics(stats);
  };

  const generatePivotTable = () => {
    if (!dataFrame || !groupByColumn || !aggregateColumn) return;
    const pivot = dataFrame.pivot(groupByColumn, aggregateColumn, aggregateFunction);
    setPivotData(pivot);
  };

  // Chart data preparation
  const getBarChartData = () => {
    if (!pivotData) return null;
    
    return {
      labels: Object.keys(pivotData),
      datasets: [
        {
          label: `${aggregateFunction.toUpperCase()} of ${aggregateColumn}`,
          data: Object.values(pivotData),
          backgroundColor: [
            'hsl(var(--primary))',
            'hsl(var(--data-blue))',
            'hsl(var(--data-purple))',
            'hsl(var(--success-green))',
          ],
          borderColor: 'hsl(var(--border))',
          borderWidth: 1,
        },
      ],
    };
  };

  const getPieChartData = () => {
    if (!dataFrame || !groupByColumn) return null;
    
    const groups = dataFrame.groupBy(groupByColumn);
    const labels = Object.keys(groups);
    const data = labels.map(label => groups[label].count());
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'hsl(var(--primary))',
            'hsl(var(--data-blue))',
            'hsl(var(--data-purple))',
            'hsl(var(--success-green))',
            'hsl(var(--warning-orange))',
          ],
          borderColor: 'hsl(var(--background))',
          borderWidth: 2,
        },
      ],
    };
  };

  const getLineChartData = () => {
    if (!dataFrame) return null;
    
    const numericColumns = dataFrame.columns.filter(col => 
      typeof dataFrame.data[0][col] === 'number'
    );
    
    if (numericColumns.length < 2) return null;
    
    const sortedData = dataFrame.sortBy(numericColumns[0]);
    
    return {
      labels: sortedData.data.map((_, index) => index + 1),
      datasets: numericColumns.slice(0, 3).map((col, index) => ({
        label: col,
        data: sortedData.data.map(row => Number(row[col])),
        borderColor: [
          'hsl(var(--primary))',
          'hsl(var(--data-blue))',
          'hsl(var(--data-purple))',
        ][index],
        backgroundColor: [
          'hsl(var(--primary) / 0.1)',
          'hsl(var(--data-blue) / 0.1)',
          'hsl(var(--data-purple) / 0.1)',
        ][index],
        tension: 0.4,
      })),
    };
  };

  const chartOptions = {
    responsive: true,
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
          <CardTitle className="bg-gradient-to-r from-data-blue to-data-purple bg-clip-text text-transparent">
            Data Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Pandas/Matplotlib equivalent for statistical analysis and visualization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="grouping">Grouping</TabsTrigger>
              <TabsTrigger value="visualization">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex gap-4 items-center">
                <Select value={selectedDataset} onValueChange={(value: 'random' | 'sales') => setSelectedDataset(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random Data</SelectItem>
                    <SelectItem value="sales">Sales Data</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadDataset}>Reload Data</Button>
              </div>

              {dataFrame && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{dataFrame.shape()[0]}</div>
                        <p className="text-sm text-muted-foreground">Rows</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-data-blue">{dataFrame.shape()[1]}</div>
                        <p className="text-sm text-muted-foreground">Columns</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-data-purple">{dataFrame.columns.length}</div>
                        <p className="text-sm text-muted-foreground">Features</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-success-green">
                          {dataFrame.columns.filter(col => typeof dataFrame.data[0][col] === 'number').length}
                        </div>
                        <p className="text-sm text-muted-foreground">Numeric</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Sample Data (First 5 rows)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {dataFrame.columns.map(col => (
                              <th key={col} className="text-left p-2 font-medium">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dataFrame.head(5).map((row, index) => (
                            <tr key={index} className="border-b">
                              {dataFrame.columns.map(col => (
                                <td key={col} className="p-2">{String(row[col])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="flex gap-4 items-center">
                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataFrame?.columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={calculateStatistics}>Calculate Statistics</Button>
              </div>

              {statistics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(statistics).map(([key, value]) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="text-lg font-bold">{typeof value === 'number' ? value.toFixed(2) : String(value)}</div>
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="grouping" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select value={groupByColumn} onValueChange={setGroupByColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataFrame?.columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={aggregateColumn} onValueChange={setSelectedAggregateColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aggregate column" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataFrame?.columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={aggregateFunction} onValueChange={(value: 'sum' | 'mean' | 'count') => setAggregateFunction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="mean">Mean</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={generatePivotTable}>Generate Pivot</Button>
              </div>

              {pivotData && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Pivot Table Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(pivotData).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 border rounded">
                        <span className="font-medium">{key}</span>
                        <span className="text-primary">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="visualization" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getBarChartData() && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bar Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Bar data={getBarChartData()!} options={chartOptions} />
                    </CardContent>
                  </Card>
                )}

                {getPieChartData() && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Pie data={getPieChartData()!} options={chartOptions} />
                    </CardContent>
                  </Card>
                )}

                {getLineChartData() && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Trend Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Line data={getLineChartData()!} options={chartOptions} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAnalytics;