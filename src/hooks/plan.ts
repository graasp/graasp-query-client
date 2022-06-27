import { useQuery } from 'react-query';
import { Map, List } from 'immutable';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import {
  CARDS_KEY,
  CURRENT_CUSTOMER_KEY,
  OWN_PLAN_KEY,
  PLANS_KEY,
} from '../config/keys';

export default (queryConfig: QueryClientConfig) => {
  const { retry, cacheTime, staleTime } = queryConfig;
  const defaultOptions = {
    retry,
    cacheTime,
    staleTime,
  };

  const usePlan = ({ planId }: { planId: string }) =>
    useQuery({
      queryKey: PLANS_KEY,
      queryFn: () =>
        Api.getPlan({ planId }, queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  const usePlans = () =>
    useQuery({
      queryKey: PLANS_KEY,
      queryFn: () => Api.getPlans(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  const useOwnPlan = () =>
    useQuery({
      queryKey: OWN_PLAN_KEY,
      queryFn: () => Api.getOwnPlan(queryConfig).then((data) => Map(data)),
      ...defaultOptions,
    });

  const useCards = () =>
    useQuery({
      queryKey: CARDS_KEY,
      queryFn: () => Api.getCards(queryConfig).then((data) => List(data)),
      ...defaultOptions,
    });

  const useCurrentCustomer = () =>
    useQuery({
      queryKey: CURRENT_CUSTOMER_KEY,
      queryFn: () =>
        Api.getCurrentCustomer(queryConfig).then((data) => Map(data)),
      ...defaultOptions,
    });

  return { usePlan, usePlans, useOwnPlan, useCards, useCurrentCustomer };
};
