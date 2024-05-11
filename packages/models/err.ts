/**
 * JSON-RPC 2.0 Error codes
 *
 * `-32000` to `-32099` are reserved for implementation-defined server-errors.
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const APP_ERROR_CODES_BY_KEY = {
  /**
   * Invalid JSON was received by the server.
   * An error occurred on the server while parsing the JSON text.
   */
  PARSE_ERROR: -32700,
  /**
   * The JSON sent is not a valid Request object.
   */
  BAD_REQUEST: -32600, // 400

  // Internal JSON-RPC error
  INTERNAL_SERVER_ERROR: -32603,
  NOT_IMPLEMENTED: -32603,

  // Implementation specific errors
  UNAUTHORIZED: -32001, // 401
  FORBIDDEN: -32003, // 403
  NOT_FOUND: -32004, // 404
  METHOD_NOT_SUPPORTED: -32005, // 405
  TIMEOUT: -32008, // 408
  CONFLICT: -32009, // 409
  PRECONDITION_FAILED: -32012, // 412
  PAYLOAD_TOO_LARGE: -32013, // 413
  UNPROCESSABLE_CONTENT: -32022, // 422
  TOO_MANY_REQUESTS: -32029, // 429
  CLIENT_CLOSED_REQUEST: -32099, // 499
} as const;

export type APP_ERROR_CODE_KEY = keyof typeof APP_ERROR_CODES_BY_KEY;

export class AppError extends Error {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore override doesn't work in all environments due to "This member cannot have an 'override' modifier because it is not declared in the base class 'Error'"
  public readonly code;

  constructor(opts: { messages?: string[]; code: APP_ERROR_CODE_KEY; cause?: unknown }) {
    const messages = opts.messages ?? [opts.code];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore https://github.com/tc39/proposal-error-cause
    super(messages, { cause });

    this.code = opts.code;
    this.name = "AppError";
  }

  getStatusFromCode(): number {
    return APP_ERROR_CODES_BY_KEY[this.code];
  }
}
