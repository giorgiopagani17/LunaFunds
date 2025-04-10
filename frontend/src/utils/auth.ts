import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useDetailsStore } from 'src/stores/details';

const router = useRouter();

export async function getValidAccessToken(): Promise<string> {
  const authStore = useAuthStore();
  const detailsStore = useDetailsStore();

  const accessToken = authStore.accessToken;
  const refreshToken = authStore.refreshToken;

  const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() <= expirationTime;
  };

  if (isTokenValid(accessToken)) {
    return accessToken!;
  }

  if (refreshToken) {
    const response = await fetch('http://localhost:3000/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;

      authStore.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        authStore.setRefreshToken(newRefreshToken);
      }

      return newAccessToken;
    } else {
      console.error('Failed to refresh token');
      authStore.logout();
      detailsStore.clearDetails();
      await router.push('/');
      throw new Error('Session expired. Please log in again.');
    }
  }

  throw new Error('No refresh token available. Please log in again.');
}
