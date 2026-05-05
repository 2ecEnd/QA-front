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
        let errorData = {};
        try {
            errorData = await resp.json();
        }
        catch { }
        const message = errorData.message || `Ошибка ${resp.status}`;
        const err = new Error(message);
        err.status = resp.status;
        err.data = errorData;
        throw err;
    }
    const text = await resp.text();
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
    const url = API_BASE + `/products/${id}/delete`;
    const resp = await fetch(url, { method: 'GET' });
    const text = await resp.text();
    const data = text ? JSON.parse(text) : null;
    // Если успех (200) и Acknowledge === true – всё хорошо
    if (resp.ok && data?.Acknowledge) {
        return data;
    }
    // Если сервер вернул 409 Conflict с информацией о блюдах
    if (resp.status === 409 && data) {
        return data; // Acknowledge будет false, Dishes – перечень блюд
    }
    // Если ответ 200, но Acknowledge === false (на всякий случай)
    if (resp.ok && data && !data.Acknowledge) {
        return data;
    }
    // Все остальные ошибки
    throw new Error(`Ошибка ${resp.status}: ${data ? JSON.stringify(data) : text}`);
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