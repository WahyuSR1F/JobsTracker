export type OAuthProviderId = 'google' | 'linkedin';

type ProviderConfig = {
  id: OAuthProviderId;
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
};

const PROVIDERS: Record<OAuthProviderId, ProviderConfig> = {
  google: {
    id: 'google',
    label: 'Google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scope: 'openid profile email',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
};

export type OAuthProfile = {
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export const OAUTH_STATE_COOKIE = 'jt_oauth_state';

export function getOAuthProvider(id: string): (ProviderConfig & { clientId: string; clientSecret: string }) | null {
  if (id !== 'google' && id !== 'linkedin') return null;
  const provider = PROVIDERS[id];
  if (!provider.clientId || !provider.clientSecret) return null;
  return {
    ...provider,
    clientId: provider.clientId,
    clientSecret: provider.clientSecret,
  };
}

export function getAppOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return new URL(request.url).origin;
}

export function buildRedirectUri(origin: string, provider: OAuthProviderId): string {
  return `${origin}/api/auth/oauth/${provider}/callback`;
}

export function buildAuthorizationUrl(
  provider: ProviderConfig & { clientId: string; clientSecret: string },
  input: { origin: string; state: string },
): string {
  const url = new URL(provider.authorizeUrl);
  url.searchParams.set('client_id', provider.clientId);
  url.searchParams.set('redirect_uri', buildRedirectUri(input.origin, provider.id));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', provider.scope);
  url.searchParams.set('state', input.state);
  url.searchParams.set('access_type', 'offline');
  if (provider.id === 'google') url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

export async function fetchOAuthProfile(
  provider: ProviderConfig & { clientId: string; clientSecret: string },
  input: { code: string; origin: string },
): Promise<OAuthProfile | null> {
  const tokenResponse = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: input.code,
      redirect_uri: buildRedirectUri(input.origin, provider.id),
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
    }),
  });

  if (!tokenResponse.ok) return null;

  const token = (await tokenResponse.json().catch(() => null)) as { access_token?: string } | null;
  if (!token?.access_token) return null;

  const profileResponse = await fetch(provider.userInfoUrl, {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: 'application/json' },
  });

  if (!profileResponse.ok) return null;

  const profile = (await profileResponse.json().catch(() => null)) as {
    email?: string;
    name?: string;
    picture?: string;
  } | null;

  const email = profile?.email?.trim().toLowerCase();
  if (!email) return null;

  return {
    email,
    name: profile?.name?.trim() || null,
    avatarUrl: profile?.picture ?? null,
  };
}
