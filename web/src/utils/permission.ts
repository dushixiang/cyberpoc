import strings from "../utils/strings";

export function isAdmin() {
    let user = getCurrentUser();
    return user['type'] === 'admin';
}

export function clearCurrentUser() {
    localStorage.removeItem('user');
}

export function setCurrentUser(user: any) {
    if (!user) {
        return
    }
    localStorage.setItem('user', JSON.stringify(user));
}

export function getCurrentUser() {
    let jsonStr = localStorage.getItem('user') as string;
    if (!strings.hasText(jsonStr) || jsonStr === 'undefined') {
        return {};
    }

    return JSON.parse(jsonStr);
}

export function hasMenu(...items: string[]) {
    let menus = getCurrentUser()['menus'] || [];
    for (const item of items) {
        if (menus.includes(item)) {
            return true;
        }
    }
    return false;
}