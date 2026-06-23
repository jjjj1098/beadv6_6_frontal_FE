const ORDER_SERVICE = 'http://localhost:8083';

const orderApi = {
    // [OrderController - 주문 관리]
    create: (request) => apiCall('POST', '/order/create', request, true, ORDER_SERVICE),
    getList: () => apiCall('GET', '/order/list', null, true, ORDER_SERVICE),
    getInfo: (orderId) => apiCall('GET', `/order/info?orderId=${orderId}`, null, true, ORDER_SERVICE),
    changeStatus: (orderId, status) => apiCall('PUT', `/order/statusChange?orderId=${orderId}&status=${status}`, null, true, ORDER_SERVICE),
    cancel: (orderId) => apiCall('PUT', `/order/cancel?orderId=${orderId}`, null, true, ORDER_SERVICE),
    complete: (orderId) => apiCall('PUT', `/order/complete?orderId=${orderId}`, null, true, ORDER_SERVICE),

    // [OrderPaymentController - 주문 결제 프로세스]
    getPaymentInfo: (orderId) => apiCall('GET', `/api/orders/${orderId}/payment-info`, null, true, ORDER_SERVICE),
    startPaymentProcessing: (orderId) => apiCall('PATCH', `/api/orders/${orderId}/payment-processing`, null, true, ORDER_SERVICE),

    // [CartController - 장바구니 관리]
    addItem: (productId) => apiCall('POST', '/cart/item', { productId }, true, ORDER_SERVICE),
    getCartList: () => apiCall('GET', '/cart/list', null, true, ORDER_SERVICE),
    deleteItem: (cartId) => apiCall('DELETE', `/cart/delete?cartId=${cartId}`, null, true, ORDER_SERVICE),
    cleanCart: () => apiCall('DELETE', '/cart/clean', null, true, ORDER_SERVICE)
};