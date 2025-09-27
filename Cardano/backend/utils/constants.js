/**
 * @description Application constants
 */

// Order status constants

import dotenv from 'dotenv';
dotenv.config();

const ADDRESSES = {
  "network": "sepolia",
  "chainId": 11155111,
  "accessToken": "0x3e70bE1e5C2939A352a45264D1dF8B8efe9BE170",
  "cardanoEscrowFactory": "0xb47F5269d4A06D1cFD428aD239FEBBDAA19Ecf67",
  "limitOrderProtocol": "0x15FEc45f2e0578216b9Ff871999237D96546fE36",
  "cardanoEscrowSrcImplementation": "0xF1B52Bb9EAf06c9d1BcDD4cff16CDE47F9a21aCD",
  "cardanoEscrowDstImplementation": "0x6c6d2E859422FcD4aec2b8f8dCda6f6c735daEE8",
  "deployedAt": "2025-09-23T14:57:26.351Z"
}


const ORDER_STATUSES = {
  PENDING: 'pending',
  DEPOSITING: 'depositing',
  WITHDRAWING: 'withdrawing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Valid order statuses array
const VALID_ORDER_STATUSES = Object.values(ORDER_STATUSES);

// Supported blockchain networks
const SUPPORTED_CHAINS = {
  EVM: 'EVM',
  CARDANO: 'Cardano',
  ETHEREUM: 'Ethereum',
  POLYGON: 'Polygon',
  BSC: 'BSC'
};

// Pagination limits
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

// Error messages
const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_STATUS: 'Invalid or missing status field',
  MISSING_REQUIRED_FIELD: 'Missing required field',
  ORDER_ALREADY_EXISTS: 'An order with this hashlock already exists',
  CANNOT_ACCEPT_ORDER: 'Order cannot be accepted',
  NO_TX_HASH_PROVIDED: 'No transaction hash provided to update',
  INTERNAL_SERVER_ERROR: 'Internal server error'
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export {
    ADDRESSES,
  ORDER_STATUSES,
  VALID_ORDER_STATUSES,
  SUPPORTED_CHAINS,
  PAGINATION,
  ERROR_MESSAGES,
  HTTP_STATUS,
};
