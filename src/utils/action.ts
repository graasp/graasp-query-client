import {
  AggregateBy,
  AggregateFunction,
  AggregateMetric,
  Context,
  CountGroupBy,
  DiscriminatedItem,
} from '@graasp/sdk';

export type AggregateActionsArgs<K extends AggregateBy[]> = {
  itemId: DiscriminatedItem['id'];
  view: `${Context}` | Context;
  requestedSampleSize: number;
  type?: string[];
  countGroupBy: CountGroupBy[];
  aggregateFunction: AggregateFunction;
  aggregateMetric: AggregateMetric;
  aggregateBy: K;
  startDate: string;
  endDate: string;
};

export type MappedAggregateBy = {
  [AggregateBy.CreatedDay]: string;
  // todo: this should maybe be returned by the backend as a number directly ?
  [AggregateBy.CreatedDayOfWeek]: string;
  // todo: same as above, this should be returned as a number by the backend
  [AggregateBy.CreatedTimeOfDay]: string;
  [AggregateBy.ItemId]: string;
  [AggregateBy.ActionType]: string;
  [AggregateBy.ActionCount]: number;
  [AggregateBy.ActionLocation]: string;
};
