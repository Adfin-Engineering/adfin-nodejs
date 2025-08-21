/* eslint-disable camelcase */
/* eslint-disable no-warning-comments */

// Error generation helpers inspired by stripe-node

export const generateV1Error = (raw = {}) => {
  switch (raw.type) {
    case 'card_error':
      return new AdfinCardError(raw);
    case 'invalid_request_error':
      return new AdfinInvalidRequestError(raw);
    case 'api_error':
      return new AdfinAPIError(raw);
    case 'authentication_error':
      return new AdfinAuthenticationError(raw);
    case 'rate_limit_error':
      return new AdfinRateLimitError(raw);
    case 'idempotency_error':
      return new AdfinIdempotencyError(raw);
    case 'invalid_grant':
      return new AdfinInvalidGrantError(raw);
    default:
      return new AdfinUnknownError(raw);
  }
};

// eslint-disable-next-line complexity
export const generateV2Error = (raw = {}) => {
  switch (raw.type) {
    // switchCases: The beginning of the section generated from our OpenAPI spec
    case 'temporary_session_expired':
      return new TemporarySessionExpiredError(raw);
    // switchCases: The end of the section generated from our OpenAPI spec
  }

  // Special handling for requests with missing required fields in V2 APIs.
  switch (raw.code) {
    case 'invalid_fields':
      return new AdfinInvalidRequestError(raw);
  }

  return generateV1Error(raw);
};

class AdfinError extends Error {
  constructor(raw = {}, type = null) {
    super(raw.message);
    this.type = type || this.constructor.name;

    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    this.message = raw.message ?? '';
    this.userMessage = raw.user_message;
    this.charge = raw.charge;
    this.decline_code = raw.decline_code;
    this.payment_intent = raw.payment_intent;
    this.payment_method = raw.payment_method;
    this.payment_method_type = raw.payment_method_type;
    this.setup_intent = raw.setup_intent;
    this.source = raw.source;
  }

  static generate = generateV1Error;
}

class AdfinCardError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinCardError');
  }
}

class AdfinInvalidRequestError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinInvalidRequestError');
  }
}

class AdfinAPIError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinAPIError');
  }
}

class AdfinAuthenticationError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinAuthenticationError');
  }
}

class AdfinPermissionError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinPermissionError');
  }
}

class AdfinRateLimitError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinRateLimitError');
  }
}

class AdfinConnectionError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinConnectionError');
  }
}

class AdfinSignatureVerificationError extends AdfinError {
  constructor(header, payload, raw = {}) {
    super(raw, 'AdfinSignatureVerificationError');
    this.header = header;
    this.payload = payload;
  }
}

class AdfinIdempotencyError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinIdempotencyError');
  }
}

class AdfinInvalidGrantError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinInvalidGrantError');
  }
}

class AdfinUnknownError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'AdfinUnknownError');
  }
}

// classDefinitions: The beginning of the section generated from our OpenAPI spec
class TemporarySessionExpiredError extends AdfinError {
  constructor(raw = {}) {
    super(raw, 'TemporarySessionExpiredError');
  }
}
// classDefinitions: The end of the section generated from our OpenAPI spec

export {
  // classes
  AdfinError,
  AdfinAPIError,
  AdfinAuthenticationError,
  AdfinPermissionError,
  AdfinRateLimitError,
  AdfinConnectionError,
  AdfinSignatureVerificationError,
  AdfinCardError,
  AdfinInvalidRequestError,
  AdfinIdempotencyError,
  AdfinInvalidGrantError,
  AdfinUnknownError,
  TemporarySessionExpiredError,
};
