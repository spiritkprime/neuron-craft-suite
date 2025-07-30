// Data Analytics Framework (Pandas/Matplotlib equivalent)
export interface DataPoint {
  [key: string]: number | string | boolean;
}

export class DataFrame {
  data: DataPoint[];
  columns: string[];

  constructor(data: DataPoint[]) {
    this.data = data;
    this.columns = data.length > 0 ? Object.keys(data[0]) : [];
  }

  // Basic operations
  head(n: number = 5): DataPoint[] {
    return this.data.slice(0, n);
  }

  tail(n: number = 5): DataPoint[] {
    return this.data.slice(-n);
  }

  shape(): [number, number] {
    return [this.data.length, this.columns.length];
  }

  // Statistical operations
  describe(column?: string): { [key: string]: number } {
    if (column) {
      const values = this.data.map(row => Number(row[column])).filter(val => !isNaN(val));
      return this.calculateStats(values);
    }
    
    const result: { [key: string]: { [key: string]: number } } = {};
    this.columns.forEach(col => {
      const values = this.data.map(row => Number(row[col])).filter(val => !isNaN(val));
      if (values.length > 0) {
        result[col] = this.calculateStats(values);
      }
    });
    return result as any;
  }

  private calculateStats(values: number[]): { [key: string]: number } {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    
    return {
      count: values.length,
      mean: mean,
      std: Math.sqrt(variance),
      min: Math.min(...values),
      '25%': this.percentile(sorted, 0.25),
      '50%': this.percentile(sorted, 0.5),
      '75%': this.percentile(sorted, 0.75),
      max: Math.max(...values)
    };
  }

  private percentile(sortedArray: number[], p: number): number {
    const index = p * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  // Grouping operations (rollup/cube operations)
  groupBy(column: string): { [key: string]: DataFrame } {
    const groups: { [key: string]: DataPoint[] } = {};
    
    this.data.forEach(row => {
      const key = String(row[column]);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });
    
    const result: { [key: string]: DataFrame } = {};
    Object.keys(groups).forEach(key => {
      result[key] = new DataFrame(groups[key]);
    });
    
    return result;
  }

  // Aggregation functions
  sum(column: string): number {
    return this.data.reduce((sum, row) => sum + Number(row[column]), 0);
  }

  mean(column: string): number {
    const values = this.data.map(row => Number(row[column])).filter(val => !isNaN(val));
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  count(): number {
    return this.data.length;
  }

  // Filtering
  filter(predicate: (row: DataPoint) => boolean): DataFrame {
    return new DataFrame(this.data.filter(predicate));
  }

  // Sorting
  sortBy(column: string, ascending: boolean = true): DataFrame {
    const sorted = [...this.data].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    });
    return new DataFrame(sorted);
  }

  // Set operations
  union(other: DataFrame): DataFrame {
    const combined = [...this.data, ...other.data];
    return new DataFrame(combined);
  }

  intersection(other: DataFrame, compareColumns: string[]): DataFrame {
    const otherKeys = new Set(
      other.data.map(row => 
        compareColumns.map(col => row[col]).join('|')
      )
    );
    
    const intersected = this.data.filter(row => 
      otherKeys.has(compareColumns.map(col => row[col]).join('|'))
    );
    
    return new DataFrame(intersected);
  }

  // Convert to chart data
  toChartData(xColumn: string, yColumn: string): { x: any, y: any }[] {
    return this.data.map(row => ({
      x: row[xColumn],
      y: row[yColumn]
    }));
  }

  // Pivot table functionality
  pivot(indexColumn: string, valueColumn: string, aggFunc: 'sum' | 'mean' | 'count' = 'sum'): { [key: string]: number } {
    const groups = this.groupBy(indexColumn);
    const result: { [key: string]: number } = {};
    
    Object.keys(groups).forEach(key => {
      const group = groups[key];
      switch (aggFunc) {
        case 'sum':
          result[key] = group.sum(valueColumn);
          break;
        case 'mean':
          result[key] = group.mean(valueColumn);
          break;
        case 'count':
          result[key] = group.count();
          break;
      }
    });
    
    return result;
  }
}

// Sample data generators
export const generateRandomData = (rows: number): DataPoint[] => {
  const data: DataPoint[] = [];
  const categories = ['A', 'B', 'C', 'D'];
  
  for (let i = 0; i < rows; i++) {
    data.push({
      id: i,
      category: categories[Math.floor(Math.random() * categories.length)],
      value: Math.random() * 100,
      score: Math.random() * 10,
      timestamp: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString()
    });
  }
  
  return data;
};

export const generateSalesData = (): DataPoint[] => {
  const products = ['Product A', 'Product B', 'Product C'];
  const regions = ['North', 'South', 'East', 'West'];
  const data: DataPoint[] = [];
  
  for (let i = 0; i < 100; i++) {
    data.push({
      product: products[Math.floor(Math.random() * products.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      sales: Math.floor(Math.random() * 1000) + 100,
      month: Math.floor(Math.random() * 12) + 1,
      year: 2023
    });
  }
  
  return data;
};