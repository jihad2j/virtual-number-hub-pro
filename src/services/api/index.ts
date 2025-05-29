
import { authApi } from './authApi';
import { countryApi } from './countryApi';
import { numberApi } from './numberApi';
import { providerApi } from './providerApi';
import { transactionApi } from './transactionApi';
import { supportApi } from './supportApi';
import { manualServiceApi } from './manualServiceApi';
import { prepaidCodeApi } from './prepaidCodeApi';

// Consolidate all API functions into one object
export const api = {
  // Auth API
  login: authApi.login,
  logout: authApi.logout,
  register: authApi.register,
  getCurrentUser: authApi.getCurrentUser,
  updateUser: authApi.updateUser,

  // Country API
  getCountries: countryApi.getCountries,
  getCountryServices: countryApi.getCountryServices,

  // Number API
  getNumbersByCountry: numberApi.getNumbersByCountry,
  getNumberByService: numberApi.getNumberByService,
  getActiveNumbers: numberApi.getActiveNumbers,
  checkActivationStatus: numberApi.checkActivationStatus,
  cancelActivation: numberApi.cancelActivation,

  // Provider API
  getProviders: providerApi.getProviders,
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
  replySupportTicket: supportApi.replySupportTicket,

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
  deletePrepaidCode: prepaidCodeApi.deletePrepaidCode
};
