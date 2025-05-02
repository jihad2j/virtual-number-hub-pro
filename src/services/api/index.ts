
import { authApi } from './authApi';
import { countryApi } from './countryApi';
import { phoneNumberApi } from './phoneNumberApi';
import { providerApi } from './providerApi';
import { transactionApi } from './transactionApi';
import { supportApi } from './supportApi';
import { manualServiceApi } from './manualServiceApi';
import { prepaidCodeApi } from './prepaidCodeApi';
import { initApi } from './initApi';
import { adminApi } from './adminApi';
import { userApi } from './userApi';

// Export types from files for easier access
export type { Country } from '@/types/Country';
export type { Provider } from '@/types/Provider';
export type { SupportTicket } from '@/types/SupportTicket';

// Consolidate all API functions into one object
export const api = {
  // Auth API
  login: authApi.login,
  logout: authApi.logout,
  register: authApi.register,
  getCurrentUser: authApi.getCurrentUser,
  updateUser: authApi.updateUser,

  // Country API
  getCountries: countryApi.getAllCountries,
  getCountryServices: countryApi.getCountryServices,
  getAvailableCountries: countryApi.getAvailableCountries,
  createCountry: countryApi.createCountry,
  updateCountry: countryApi.updateCountry,
  deleteCountry: countryApi.deleteCountry,

  // Number API
  getNumbersByCountry: phoneNumberApi.getAllPhoneNumbers,
  getNumberByService: phoneNumberApi.purchasePhoneNumber,
  getActiveNumbers: phoneNumberApi.getUserPhoneNumbers,
  checkActivationStatus: phoneNumberApi.checkPhoneNumber,
  cancelActivation: phoneNumberApi.cancelPhoneNumber,
  getUserPhoneNumbers: phoneNumberApi.getUserPhoneNumbers,

  // Provider API
  getProviders: providerApi.getProviders,
  getAllProviders: providerApi.getProviders, // Alias for getProviders
  updateProvider: providerApi.updateProvider,
  createProvider: providerApi.createProvider,
  deleteProvider: providerApi.deleteProvider,
  getProviderBalance: providerApi.getProviderBalance,
  getActiveProviders: providerApi.getActiveProviders,

  // Transaction API
  getAllTransactions: transactionApi.getAllTransactions,
  getUserTransactions: transactionApi.getUserTransactions,
  createDepositTransaction: transactionApi.createDepositTransaction,
  giftBalance: transactionApi.giftBalance,

  // Support API
  createSupportTicket: supportApi.createSupportTicket,
  getUserSupportTickets: supportApi.getUserSupportTickets,
  getAllSupportTickets: supportApi.getAllSupportTickets,
  replySupportTicket: supportApi.respondToSupportTicket,
  respondToSupportTicket: supportApi.respondToSupportTicket, // Alias for replySupportTicket
  closeSupportTicket: supportApi.closeSupportTicket,

  // Manual Service API
  getManualServices: manualServiceApi.getManualServices,
  getAllManualServices: manualServiceApi.getAllManualServices,
  getManualService: manualServiceApi.getManualService,
  createManualService: manualServiceApi.createManualService,
  updateManualService: manualServiceApi.updateManualService,
  deleteManualService: manualServiceApi.deleteManualService,
  getUserManualRequests: manualServiceApi.getUserManualRequests,
  getAllManualRequests: manualServiceApi.getAllManualRequests,
  createManualRequest: manualServiceApi.createManualRequest,
  deleteManualRequest: manualServiceApi.deleteManualRequest,
  respondToManualRequest: manualServiceApi.respondToManualRequest,

  // Prepaid Code API
  getAllPrepaidCodes: prepaidCodeApi.getAllPrepaidCodes,
  generatePrepaidCodes: prepaidCodeApi.generatePrepaidCodes,
  redeemPrepaidCode: prepaidCodeApi.redeemPrepaidCode,
  deletePrepaidCode: prepaidCodeApi.deletePrepaidCode,

  // Init API
  initLocalData: initApi.initLocalData,

  // Admin API
  getDashboardStats: adminApi.getDashboardStats,

  // User API
  getAllUsers: userApi.getAllUsers
};

