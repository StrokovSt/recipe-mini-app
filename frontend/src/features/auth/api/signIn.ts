import type { AuthProvider } from "@recipe/common";

import { api } from "@/shared/api";

// Better Auth отдаёт адрес страницы входа сервиса. После входа он вернёт на эту же страницу,
// при ошибке — тоже на неё, с ?error=<код> в адресе
const goToProvider = async (path: string, provider: AuthProvider) => {
    const { url } = await api.post<{ url: string }>(path, {
        provider,
        callbackURL: location.href,
        errorCallbackURL: location.href,
    });
    location.assign(url);
};

// Вход на сайте через Google и т. п.
export const signIn = (provider: AuthProvider) => goToProvider("/api/auth/sign-in/social", provider);

// Привязать ещё один способ входа к аккаунту, в который уже вошли
export const linkProvider = (provider: AuthProvider) => goToProvider("/api/auth/link-social", provider);
