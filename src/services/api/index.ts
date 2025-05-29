
// Re-export all API services
export * from './authApi';
export * from './userApi';
export * from './countryApi';
export * from './providerApi';
export * from './phoneNumberApi';
export * from './transactionApi';
export * from './prepaidCodeApi';
export * from './supportApi';
export * from './manualServiceApi';
export * from './adminApi';
export * from './initApi';

// Re-export types from the original api.ts
import { User } from '@/types/User';
import { Country } from '@/types/Country';
import { Provider } from '@/types/Provider';
import { Transaction } from '@/types/Transaction';
import { PhoneNumber } from '@/types/PhoneNumber';
import { PrepaidCode } from '@/types/PrepaidCode';
import { SupportTicket } from '@/types/SupportTicket';
import { ManualService, ManualRequest, AdminManualRequest } from '@/types/ManualRequest';

export type {
  User,
  Country,
  Provider,
  Transaction,
  PhoneNumber,
  PrepaidCode,
  SupportTicket,
  ManualService,
  ManualRequest,
  AdminManualRequest
};

// Create a unified API object that contains all methods from individual API services
import { authApi } from './authApi';
import { userApi } from './userApi';
import { countryApi } from './countryApi';
import { providerApi } from './providerApi';
import { phoneNumberApi } from './phoneNumberApi';
import { transactionApi } from './transactionApi';
import { prepaidCodeApi } from './prepaidCodeApi';
import { supportApi } from './supportApi';
import { manualServiceApi } from './manualServiceApi';
import { adminApi } from './adminApi';
import { initApi } from './initApi';

// Combine all API services into one object for backward compatibility
export const api = {
  ...authApi,
  ...userApi,
  ...countryApi,
  ...providerApi,
  ...phoneNumberApi,
  ...transactionApi,
  ...prepaidCodeApi,
  ...supportApi,
  ...manualServiceApi,
  ...adminApi,
  ...initApi
};
