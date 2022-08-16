import { useQuery } from 'react-query';
import { QueryClientConfig } from '../types';
import * as Api from '../api';
import {
  buildPlanKey,
  CARDS_KEY,
  CURRENT_CUSTOMER_KEY,
  OWN_PLAN_KEY,
  PLANS_KEY,
} from '../config/keys';
import { convertJs } from '../utils/util';

export default (queryConfig: QueryClientConfig) => {
  const { defaultQueryOptions: defaultOptions } = queryConfig;

  const usePlan = ({ planId }: { planId: string }) =>
    useQuery({
      queryKey: buildPlanKey(planId),
      queryFn: () =>
        Api.getPlan({ planId }, queryConfig).then((data) => convertJs(data)),
      ...defaultOptions,
    });

  const usePlans = () =>
    useQuery({
      queryKey: PLANS_KEY,
      queryFn: () => Api.getPlans(queryConfig).then((data) => convertJs(data)),
      ...defaultOptions,
    });

  const useOwnPlan = () =>
    useQuery({
      queryKey: OWN_PLAN_KEY,
      queryFn: () =>
        Api.getOwnPlan(queryConfig).then((data) => convertJs(data)),
      ...defaultOptions,
    });

  const useCards = () =>
    useQuery({
      queryKey: CARDS_KEY,
      queryFn: () => Api.getCards(queryConfig).then((data) => convertJs(data)),
      ...defaultOptions,
    });

  const useCurrentCustomer = () =>
    useQuery({
      queryKey: CURRENT_CUSTOMER_KEY,
      queryFn: () =>
        Api.getCurrentCustomer(queryConfig).then((data) => convertJs(data)),
      ...defaultOptions,
    });

  return { usePlan, usePlans, useOwnPlan, useCards, useCurrentCustomer };
};
