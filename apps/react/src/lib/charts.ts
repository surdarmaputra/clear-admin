export interface Series {
  name: string;
  data: number[];
}

export interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'donut';
  series: Series[] | number[];
  categories?: string[];
  slots: number[];
  height: number;
  labels?: string[];
  valuePrefix?: string;
}
