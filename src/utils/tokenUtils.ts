export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function getRefreshToken() {
  console.log('Getting refresh token', localStorage.getItem('refresh_token'));
  return localStorage.getItem('refresh_token');
}

export function setAccessToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem('refresh_token', token);
}

export function setUserInfo(user: any) {
  localStorage.setItem('userInfo', JSON.stringify(user));
}

export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.error('Error parsing user info from localStorage:', error);
      return null;
    }
  }
  return null;
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userInfo');
}
