// Bu servis, proxy route handler üzerinden backend API'ye istek atmak için kullanılır
const apiService = {
    // GET isteği
    get: async <T>(path: string, params?: Record<string, any>): Promise<T> => {
        try {
            // Query string oluştur
            const queryString = params
                ? '?' + new URLSearchParams(params as Record<string, string>).toString()
                : '';

            // Proxy route'a GET isteği at
            const response = await fetch(`/api/proxy/${path}${queryString}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`GET /${path} error:`, error);
            throw error;
        }
    },

    // POST isteği
    post: async <T>(path: string, data?: any): Promise<T> => {
        try {
            // Proxy route'a POST isteği at
            const response = await fetch(`/api/proxy/${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`POST /${path} error:`, error);
            throw error;
        }
    },

    // PUT isteği
    put: async <T>(path: string, data?: any): Promise<T> => {
        try {
            // Proxy route'a PUT isteği at
            const response = await fetch(`/api/proxy/${path}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`PUT /${path} error:`, error);
            throw error;
        }
    },

    // DELETE isteği
    delete: async <T>(path: string): Promise<T> => {
        try {
            // Proxy route'a DELETE isteği at
            const response = await fetch(`/api/proxy/${path}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`DELETE /${path} error:`, error);
            throw error;
        }
    },

    // PATCH isteği
    patch: async <T>(path: string, data?: any): Promise<T> => {
        try {
            // Proxy route'a PATCH isteği at
            const response = await fetch(`/api/proxy/${path}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : undefined,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`PATCH /${path} error:`, error);
            throw error;
        }
    },
};

export default apiService;