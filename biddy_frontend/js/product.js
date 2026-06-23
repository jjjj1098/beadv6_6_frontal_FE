const PRODUCT_SERVICE = 'http://localhost:8082'; 

const productApi = {
    create: (data) => apiCall('POST', '/products', data, true, PRODUCT_SERVICE),
    update: (id, data) => apiCall('PUT', `/products/${id}`, data, true, PRODUCT_SERVICE),
    delete: (id) => apiCall('DELETE', `/products/${id}`, null, true, PRODUCT_SERVICE),
    getList: (saleType = null) => {
        const path = saleType ? `/products?saleType=${saleType}` : '/products';
        return apiCall('GET', path, null, true, PRODUCT_SERVICE);
    },
    getById: (id) => apiCall('GET', `/products/${id}`, null, true, PRODUCT_SERVICE)
};