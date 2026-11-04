import { useLocation, useNavigate } from "react-router-dom";

// «Назад» внутри приложения. Страницу открыли по ссылке или из закладки — истории в приложении нет,
// и navigate(-1) увёл бы на прошлый сайт или ничего не сделал: тогда ведём на fallback (обычно главную)
export const useGoBack = (fallback: string) => {
    const navigate = useNavigate();
    const { key } = useLocation();

    return () => {
        if (key === "default") navigate(fallback, { replace: true });
        else navigate(-1);
    };
};
