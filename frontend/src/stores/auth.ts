import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') as string | null,
    refreshToken: localStorage.getItem('refresh_token') as string | null,
    userDetails: {
      name: null as string | null,
      accountID: null as string | null,
      groupID: null as string | null,
      currency: null as string | null,
      iban: null as string | null,
    },
    loginError: ''
  }),
  actions: {
    setAccessToken(token: string | null) {
      this.accessToken = token;
      if (token) {
        localStorage.setItem('access_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('access_token');
        delete axios.defaults.headers.common['Authorization'];
      }
    },

    setRefreshToken(token: string | null) {
      this.refreshToken = token;
      if (token) {
        localStorage.setItem('refresh_token', token);
      } else {
        localStorage.removeItem('refresh_token');
      }
    },

    async login(email: string, password: string) {
      try {
        const response = await axios.post('http://localhost:3000/auth/login', {
          email,
          password,
        });

        if (response.data.access_token) {
          this.setAccessToken(response.data.access_token);
          this.setRefreshToken(response.data.refresh_token);

          // Save user details
          this.userDetails.name = response.data.name;
          this.userDetails.accountID = response.data.account_id; // Use account_id
          this.userDetails.groupID = response.data.group_id; // Use group_id
          this.userDetails.currency = response.data.currency;
          this.userDetails.iban = response.data.iban;
        } else {
          throw new Error('Login failed');
        }
      } catch (error: unknown) {
        console.error('Error during login:', error);
        if (axios.isAxiosError(error) && error.response) {
          this.loginError = error.response.data?.message || 'Login failed';
        } else {
          this.loginError = 'Login failed';
        }
        throw error; // Re-throw the error to handle it in the component
      }
    },

    async register(email: string, password: string, name: string, accountName: string, currency: string) {
      try {
        const response = await axios.post('http://localhost:3000/auth/register', {
          email,
          password,
          name,
          accountName,
          currency,
        });

        if (response.data.access_token) {
          this.setAccessToken(response.data.access_token);
          this.setRefreshToken(response.data.refresh_token);

          // Save user details
          this.userDetails.name = response.data.name;
          this.userDetails.accountID = response.data.account_id; // Use account_id
          this.userDetails.groupID = response.data.group_id; // Use group_id
          this.userDetails.currency = response.data.currency;
          this.userDetails.iban = response.data.iban;
        } else {
          throw new Error('Login failed');
        }
      } catch (error: unknown) {
        console.error('Error during login:', error);
        if (axios.isAxiosError(error) && error.response) {
          this.loginError = error.response.data?.message || 'Login failed';
        } else {
          this.loginError = 'Login failed';
        }
        throw error; // Re-throw the error to handle it in the component
      }
    },

    logout() {
      this.setAccessToken(null);
      this.setRefreshToken(null);
      this.userDetails = {
        name: null,
        accountID: null,
        currency: null,
        groupID: null,
        iban: null,
      };
      this.loginError = '';
    },
  },
});
