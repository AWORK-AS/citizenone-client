import { useRuntimeConfig } from '#app'
export function useOneDriveAuth() {
  const runtimeConfig = useRuntimeConfig();
  const clientId = runtimeConfig.public.VITE_ONEDRIVE_CLIENT_ID as string;
  const redirectUri = runtimeConfig.public.VITE_ONEDRIVE_REDIRECT_URI as string;
  const scopes = 'https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/Files.Read.All offline_access';
  function login() {
    const url =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&prompt=consent`;
    window.location.href = url;
  }
  return { login };
}