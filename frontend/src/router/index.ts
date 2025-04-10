import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/auth'; // Importa il tuo store

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Implement route guard
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore(); // Ottieni lo store dell'autenticazione
    const { accessToken } = authStore; // Accedi al token

    console.log('Access Token:', accessToken);
    console.log('Navigating to:', to.name);

    if (!accessToken && to.name !== 'Login') {
      next({ name: 'Login' }); // Redirect to Login if not authenticated
    } else if (to.name === 'Login' && accessToken) {
      next({ name: 'Home' }); // Redirect to Home if authenticated
    } else {
      next(); // Otherwise, allow navigation
    }
  });

  // Change background color for /crypto route
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore(); // Get the auth store
    const { accessToken } = authStore; // Access the token

    console.log('Access Token:', accessToken);
    console.log('Navigating to:', to.name);

    if (!accessToken && to.name !== 'Login') {
      next({ name: 'Login' }); // Redirect to Login if not authenticated
    } else if (to.name === 'Login' && accessToken) {
      next({ name: 'Home' }); // Redirect to Home if authenticated
    } else {
      if (to.path === '/crypto') {
        document.body.classList.add('bg-dark');
      } else if (to.path === '/home' || to.path === '/details' || to.path === '/groups') {
        document.body.classList.remove('bg-dark');
        document.body.classList.remove('bg-warning');
      } else {
        document.body.classList.add('bg-warning');
        document.body.classList.remove('bg-dark');
      }
      next(); // Allow navigation
    }
  });

  return Router;
});
