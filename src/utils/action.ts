import { UUID } from '@graasp/sdk';

export enum AggregateFunction {
  Avg = 'avg',
  Sum = 'sum',
  Count = 'count',
}

export type AggregateActionsArgs = {
  itemId: UUID;
  view: string;
  requestedSampleSize: number;
  type: string;
  countGroupBy: string[];
  aggregateFunction: AggregateFunction;
  aggregateMetric: string;
  aggregateBy: string[];
};
