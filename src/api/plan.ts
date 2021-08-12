import { QueryClientConfig } from '../types';
import {
  buildChangePlanRoute,
  buildSetDefaultCardRoute,
  CREATE_SETUP_INTENT_ROUTE,
  GET_CARDS_ROUTE,
  GET_CURRENT_CUSTOMER,
  GET_OWN_PLAN_ROUTE,
  GET_PLANS_ROUTE,
} from './routes';
import { DEFAULT_GET, DEFAULT_PATCH, DEFAULT_POST, failOnError } from './utils';

export const getPlans = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_PLANS_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );

  return res.json();
};

export const getOwnPlan = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(
    `${API_HOST}/${GET_OWN_PLAN_ROUTE}`,
    DEFAULT_GET,
  ).then(failOnError);
  return res.json();
};

// payload: planId
export const changePlan = async (
  { planId }: { planId: string },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildChangePlanRoute(planId)}`, {
    ...DEFAULT_PATCH,
    headers: {},
  }).then(failOnError);

  return res.json();
};

export const getCards = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${GET_CARDS_ROUTE}`, DEFAULT_GET).then(
    failOnError,
  );
  return res.json();
};

export const setDefaultCard = async (
  { cardId }: { cardId: string },
  { API_HOST }: QueryClientConfig,
) => {
  const res = await fetch(`${API_HOST}/${buildSetDefaultCardRoute(cardId)}`, {
    ...DEFAULT_PATCH,
    headers: {},
  }).then(failOnError);

  return res.json();
};

export const createSetupIntent = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(`${API_HOST}/${CREATE_SETUP_INTENT_ROUTE}`, {
    ...DEFAULT_POST,
    headers: {},
  }).then(failOnError);
  return res.json();
};

export const getCurrentCustomer = async ({ API_HOST }: QueryClientConfig) => {
  const res = await fetch(
    `${API_HOST}/${GET_CURRENT_CUSTOMER}`,
    DEFAULT_GET,
  ).then(failOnError);
  return res.json();
};
