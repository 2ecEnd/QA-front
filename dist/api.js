const API_BASE = 'http://localhost:8080';
async function request(method, path, body, isFormData = false) {
    const url = API_BASE + path;
    const options = { method, headers: {} };
    if (body && !isFormData) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    else if (body && isFormData) {
        options.body = body;
    }
    const resp = await fetch(url, options);
    if (!resp.ok) {
        let errMsg = `Ошибка ${resp.status}`;
        try {
            const err = await resp.json();
            errMsg = err.message || err.error || JSON.stringify(err);
        }
        catch { }
        throw new Error(errMsg);
    }
    const text = await resp.text();
    if (!text) {
        throw new Error(`Пустой ответ от сервера (статус ${resp.status})`);
    }
    return JSON.parse(text);
}
// ─── Products ───────────────────────────
export async function fetchProducts(category, cookingNecessity, flags, search, sort) {
    const params = new URLSearchParams();
    if (category)
        params.append('category', category);
    if (cookingNecessity)
        params.append('readinessDegree', cookingNecessity);
    if (flags && flags.length)
        flags.forEach(f => params.append('flags', f));
    if (search)
        params.append('search', search);
    if (sort)
        params.append('sort', sort);
    const qs = params.toString();
    return request('GET', '/products' + (qs ? '?' + qs : ''));
}
export async function getProduct(id) {
    return request('GET', `/products/${id}`);
}
export async function createProduct(data) {
    return request('POST', '/products/create', data);
}
export async function updateProduct(id, data) {
    return request('PATCH', `/products/${id}/update`, data);
}
export async function deleteProduct(id) {
    return request('GET', `/products/${id}/delete`);
}
// ─── Dishes ─────────────────────────────
export async function fetchDishes(category, flags, search) {
    const params = new URLSearchParams();
    if (category)
        params.append('category', category);
    if (flags && flags.length)
        flags.forEach(f => params.append('flags', f));
    if (search)
        params.append('search', search);
    const qs = params.toString();
    return request('GET', '/dishes' + (qs ? '?' + qs : ''));
}
export async function getDish(id) {
    return request('GET', `/dishes/${id}`);
}
export async function createDish(data) {
    return request('POST', '/dishes', data);
}
export async function updateDish(id, data) {
    return request('PUT', `/dishes/${id}/update`, data);
}
export async function deleteDish(id) {
    return request('GET', `/dishes/${id}/delete`);
}
// ─── Upload ─────────────────────────────
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    return request('POST', '/upload/image', formData, true);
}
//# sourceMappingURL=api.js.map