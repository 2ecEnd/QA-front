const API_BASE = 'http://localhost:8080';
async function request(url, options) {
    const response = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}
function buildQueryString(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'boolean') {
                searchParams.append(key, value ? 'true' : 'false');
            }
            else {
                searchParams.append(key, String(value));
            }
        }
    });
    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
}
export const api = {
    // Продукты
    getProducts: (filter = {}) => request(`/products${buildQueryString(filter)}`),
    getProduct: (id) => request(`/products/${id}`),
    createProduct: (dto) => {
        console.log(dto);
        return request('/products/create', { method: 'POST', body: JSON.stringify(dto) });
    },
    updateProduct: (id, dto) => request(`/products/${id}/update`, { method: 'PUT', body: JSON.stringify(dto) }),
    deleteProduct: (id) => request(`/products/${id}/delete`, { method: 'DELETE' }),
    // Блюда
    getDishes: (filter = {}) => request(`/dishes${buildQueryString(filter)}`),
    getDish: (id) => request(`/dishes/${id}`),
    createDish: (dto) => request('/dishes/create', { method: 'POST', body: JSON.stringify(dto) }),
    updateDish: (id, dto) => request(`/dishes/${id}/update`, { method: 'PUT', body: JSON.stringify(dto) }),
    deleteDish: (id) => request(`/dishes/${id}/delete`, { method: 'DELETE' }),
    // Загрузка изображений
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE}/upload/image`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP ${response.status}`);
        }
        return response.json();
    }
};
