import {
  AggregateBy,
  AggregateFunction,
  AggregateMetric,
  Context,
  CountGroupBy,
  Item,
} from '@graasp/sdk';

export type AggregateActionsArgs = {
  itemId: Item['id'];
  view: Context;
  requestedSampleSize: number;
  type?: string[];
  countGroupBy: CountGroupBy[];
  aggregateFunction: AggregateFunction;
  aggregateMetric: AggregateMetric;
  aggregateBy: AggregateBy[];
};
