export const baseServer = () => {
    // if (import.meta.env.DEV) {
    //     return '//127.0.0.1:8081';
    // }
    return window.location.protocol + '//' + window.location.host;
}

export const baseUrl = () => {
    // if (import.meta.env.DEV) {
    //     return '//127.0.0.1:8081/api';
    // }
    return window.location.protocol + '//' + window.location.host + '/api';
}

const Token = 'Cyber-Token';

export const getToken = () => {
    return localStorage.getItem(Token) || "";
}

export const setToken = (token: string) => {
    localStorage.setItem(Token, token);
}

export const getHeader = () => {
    return {
        'Cyber-Token': getToken()
    }
}

const handleError = async (error: any, url?: string) => {
    if (error instanceof TypeError) {
        switch (error.message) {
            case 'Failed to fetch':
                // todo
                break;
        }
        return;
    }
    if (error.status === 401) {
        if (!url?.includes('redirect=false')) {
            window.location.href = '/login';
        }
        return;
    }
    let response = error.response;
    let msg = '';
    if (response?.headers.get('Content-Type')?.includes('application/json')) {
        let data = await response?.json();
        msg = data['message'];
    } else {
        msg = error.response?.text();
    }
    let noerr = url?.includes('noerr');
    if (!noerr) {
        // todo
    }
    return Promise.reject({
        status: error.status,
        statusText: error.statusText,
        message: msg
    })
}

const handleResponse = (response: Response) => {
    if (response.ok) {
        if (response.headers.get('Content-Type')?.includes('application/json')) {
            return response.json();
        }
        return response.text();
    } else {
        return Promise.reject({
            status: response.status,
            statusText: response.statusText,
            response: response
        })
    }
}

class request {
    async get(url: string) {
        return fetch(baseUrl() + url, {
            method: "GET",
            headers: getHeader()
        }).then(response => {
            return handleResponse(response);
        }).catch(async error => {
            return await handleError(error, url);
        })
    }

    async post(url: string, body?: any | undefined) {
        return fetch(baseUrl() + url, {
            method: "POST",
            headers: {
                'content-type': 'application/json',
                ...getHeader()
            },
            body: JSON.stringify(body),
        }).then(response => {
            return handleResponse(response);
        }).catch(async error => {
            return await handleError(error);
        })
    }

    async postForm(url: string, headers: any, body?: any | undefined) {
        return fetch(baseUrl() + url, {
            method: "POST",
            headers: {
                ...headers,
                ...getHeader(),
            },
            body: body,
        }).then(response => {
            return handleResponse(response);
        }).catch(async error => {
            return await handleError(error);
        })
    }

    async put(url: string, body?: any | undefined) {
        return fetch(baseUrl() + url, {
            method: "PUT",
            headers: {
                'content-type': 'application/json',
                ...getHeader()
            },
            body: JSON.stringify(body),
        }).then(response => {
            return handleResponse(response);
        }).catch(async error => {
            return await handleError(error);
        })
    }

    async patch(url: string, body?: any | undefined) {
        return fetch(baseUrl() + url, {
            method: "PATCH",
            headers: {
                'content-type': 'application/json',
                ...getHeader()
            },
            body: JSON.stringify(body),
        }).then(response => {
            return handleResponse(response);
        }).catch(async error => {
            return await handleError(error);
        })
    }

    async delete(url: string) {
        return fetch(baseUrl() + url, {
            method: "DELETE",
            headers: getHeader()
        }).then(response => {
            return handleResponse(response);
        }).catch(async error => {
            return await handleError(error);
        })
    }
}

let requests = new request();

export default requests;