import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

export interface Request extends ExpressRequest {
  // Add any custom properties or overrides here
}

export interface Response extends ExpressResponse {
  // Add any custom properties or overrides here
}