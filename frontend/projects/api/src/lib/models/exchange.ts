export interface ExchangeRequest {
  readonly code: string;
  readonly codeVerifier: string;
  readonly expectedChallenge: string;
}

export interface ExchangeResponse {
  readonly accessToken: string;
}
