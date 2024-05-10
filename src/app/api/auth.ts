import { oidcClient } from '@/libs/oidcClient';
import { getServerConfig } from '@/config/server';
import { ChatErrorType } from '@/types/fetch';

interface AuthConfig {
  accessCode?: string | null;
  apiKey?: string | null;
  oauthAuthorized?: boolean;
  zeroIDToken?: string; // New optional field for zeroID token
}

export const checkAuth = async ({ apiKey, accessCode, oauthAuthorized, zeroIDToken }: AuthConfig) => {
  if (zeroIDToken) {
    const zeroIDAuthResult = await oidcClient.verifyToken(zeroIDToken);
    if (!zeroIDAuthResult.authenticated) {
      return { auth: false, error: 'Invalid zeroID Token' };
    }
    return { auth: true };
  }
  // If authorized by oauth
  if (oauthAuthorized) {
    return { auth: true };
  }

  const { ACCESS_CODES } = getServerConfig();

  // if apiKey exist
  if (apiKey) {
    return { auth: true };
  }

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return { auth: true };

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    return { auth: false, error: ChatErrorType.InvalidAccessCode };
  }

  return { auth: true };
};
