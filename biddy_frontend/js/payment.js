const PAYMENT_SERVICE_BASE = 'http://localhost:8085'; // 예시: 결제 서비스 포트

// 모든 주소를 API_BASE 기준(8000번 서버)으로 통일합니다.
const depositApi = {
  charge: (amount) => apiCall('POST', '/api/payments/deposits/charge', { amount }, true),
  cancelCharge: (chargeId) => apiCall('POST', '/api/payments/deposits/charge/cancel', { chargeId }, true),
  withdraw: (amount) => apiCall('POST', '/api/payments/deposits/withdraw', { amount }, true),
  adjust: (userId, amount) => apiCall('PATCH', '/api/payments/deposits/adjust', { userId, amount }, true),
  getBalance: (userId) => apiCall('GET', `/api/payments/deposits/users/${userId}/balance`, null, true),
  getTransactions: (userId) => apiCall('GET', `/api/payments/deposits/users/${userId}/transactions`, null, true)
};

const paymentApi = {
  charge: (request) => apiCall('POST', '/api/payments/deposits/charge', request, true),
  cancelCharge: (request) => apiCall('POST', '/api/payments/deposits/charge/cancel', request, true),
  withdraw: (request) => apiCall('POST', '/api/payments/deposits/withdraw', request, true),
  getBalance: (userId) => apiCall('GET', `/api/payments/deposits/users/${userId}/balance`, null, true),
  getTransactions: (userId) => apiCall('GET', `/api/payments/deposits/users/${userId}/transactions`, null, true),
  adjust: (request) => apiCall('PATCH', '/api/payments/deposits/adjust', request, true),
  runMonthlySettlement: (year, month) => apiCall('POST', '/api/payments/settlements/monthly', { year, month }, true),
  getSettlements: (userId) => apiCall('GET', `/api/payments/settlements?userId=${userId}`, null, true),
  getSettlementById: (id) => apiCall('GET', `/api/payments/settlements/${id}`, null, true)
};

const settlementApi = {
  runMonthly: (year, month) => apiCall('POST', '/api/payments/settlements/monthly', { year, month }, true),
  getSettlements: (userId) => apiCall('GET', `/api/payments/settlements?userId=${userId}`, null, true),
  getSettlement: (id) => apiCall('GET', `/api/payments/settlements/${id}`, null, true)
};