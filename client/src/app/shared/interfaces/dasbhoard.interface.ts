export interface Metric {
    name: string;
    type: string;
    value: number;
    lastWeek: number;
    lastWeekName: string;
    rank: number;
}

export interface Filters {
    years?: number[];
    months?: number[];
    salesPersonIds?: string[];
    departments?: string[];
}
