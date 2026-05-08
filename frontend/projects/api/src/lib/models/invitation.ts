export interface InvitePayload {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: string;
  readonly city: string;
  readonly message: string;
}

export interface InvitationCreatedResponse {
  readonly id: string;
}
