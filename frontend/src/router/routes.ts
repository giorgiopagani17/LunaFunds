import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('pages/LoginPage.vue')
  },
  {
    path: '/home',
    name: 'HomePage',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'Home', component: () => import('pages/HomePage.vue') }],
  },
  {
    path: '/details',
    name: 'Details',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', name: 'Details', component: () => import('pages/DetailsPage.vue') }],
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('layouts/GroupLayout.vue'),
    children: [{ path: '', name: 'Groups', component: () => import('pages/GroupsPage.vue') }],
  },
  {
    path: '/crypto',
    name: 'Crypto',
    component: () => import('layouts/CryptoLayout.vue'),
    children: [{ path: '', name: 'Crypto', component: () => import('pages/InvestmentsPage.vue') }],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
