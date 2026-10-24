import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type FormEvent, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import type { ParsedRecipe } from "@recipe/common";

import { AppRoute } from "@/app/router";
import { buildRoute } from "@/app/router/routes";
import { DRAFT_KEYS, draftApi } from "@/entities/draft";
import { useParseRecipe, useParseRecipeFromImage } from "@/entities/recipe";
import { parsedToFormValues, type RecipeDraftData, type RecipeDraftState } from "@/features/recipe-form";
import { ApiError } from "@/shared/api";
import { getErrorMessage } from "@/shared/lib/errors";
import { IconButton, RegularButton } from "@/shared/ui/Buttons";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { useLoader } from "@/shared/ui/GlobalLoader";
import { Input } from "@/shared/ui/Input";
import { PageFooter } from "@/shared/ui/PageFooter";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageWrapper } from "@/shared/ui/PageWrapper";

import PhotoZone, { type Photo } from "./PhotoZone/PhotoZone";

import styles from "./ImportRecipePage.module.scss";

const URL_REGEX = /^https?:\/\/\S+\.\S+$/i;

// Распознавание по ссылке или фото. Запускается только кнопкой, чтобы не тратить запрос на случайный файл.
// Черновик открывается в обычной форме создания
const ImportRecipePage = () => {
    const { t } = useTranslation(["recipeForm", "common"]);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [url, setUrl] = useState("");
    // Кнопка «Распознать» в футере, вне формы: связана с ней через атрибут form
    const formId = useId();
    const [urlError, setUrlError] = useState("");
    const [photo, setPhoto] = useState<Photo | null>(null);
    // Распознанный рецепт сохраняется в черновик, пока это идёт, лоадер не убираем
    const [isOpening, setIsOpening] = useState(false);

    const { mutate: parseUrl, isPending: isParsingUrl, error: urlParseError, reset: resetUrl } = useParseRecipe();
    const {
        mutate: parseImage,
        isPending: isParsingImage,
        error: imageParseError,
        reset: resetImage,
    } = useParseRecipeFromImage();

    const isParsing = isParsingUrl || isParsingImage || isOpening;
    // Котик не уходит при переходе в форму: его погасит форма, когда отрисуется
    useLoader(isParsing, { label: t("import.loading"), delay: 0, handOff: true, loader: "catMagnifier" });
    const error = urlParseError ?? imageParseError;
    const errorMessage = error
        ? getErrorMessage(error instanceof ApiError ? error.code : undefined, error.message)
        : null;

    // Ошибка относится к прошлой попытке: при новой ссылке или фото её убираем
    const resetErrors = () => {
        resetUrl();
        resetImage();
    };

    // Сразу сохраняем в черновик, чтобы распознанное не пропало. Если не вышло, открываем форму без черновика
    const openDraft = async (parsed: ParsedRecipe) => {
        setIsOpening(true);

        try {
            const data: RecipeDraftData = { values: parsedToFormValues(parsed), sourceUrl: parsed.sourceUrl };
            const draft = await draftApi.create({ title: parsed.title, origin: "ai", source: parsed.source, data });
            // Иначе на /add остаётся старый список, и новый черновик видно только после следующего автосохранения
            queryClient.invalidateQueries({ queryKey: DRAFT_KEYS.lists() });
            const state: RecipeDraftState = { isImported: true };
            navigate(buildRoute.draft(draft.id), { state, replace: true });
        }
        catch {
            const state: RecipeDraftState = { parsed };
            navigate(AppRoute.CreateRecipe, { state, replace: true });
        }
    };

    // Фото важнее ссылки: пока оно выбрано, поле ссылки неактивно
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        resetErrors();

        if (photo) {
            parseImage(photo.file, { onSuccess: openDraft });
            return;
        }

        const trimmed = url.trim();
        if (!URL_REGEX.test(trimmed)) {
            setUrlError(t("common:imageInput.invalidUrl"));
            return;
        }

        parseUrl(trimmed, { onSuccess: openDraft });
    };

    return (
        <PageWrapper
            header={
                <PageHeader className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t("import.title")}</h1>
                        <p className={styles.subtitle}>{t("import.subtitle")}</p>
                    </div>
                    <IconButton
                        icon="back"
                        round
                        className={styles.back}
                        type="button"
                        aria-label={t("common:back")}
                        onClick={() => navigate(-1)}
                    />
                </PageHeader>
            }
        >
            <form id={formId} className={clsx(styles.form, isParsing && styles.parsing)} onSubmit={handleSubmit}>
                <div className={styles.card}>
                    <Input
                        label={t("import.link")}
                        type="url"
                        inputMode="url"
                        value={url}
                        error={urlError}
                        disabled={!!photo || isParsing}
                        onChange={(event) => {
                            setUrl(event.target.value);
                            setUrlError("");
                            resetErrors();
                        }}
                    />
                </div>

                <p className={styles.or}>{t("import.or")}</p>

                <PhotoZone
                    value={photo}
                    disabled={isParsing}
                    onChange={(next) => {
                        setPhoto(next);
                        resetErrors();
                    }}
                />

                {errorMessage && <ErrorMessage message={errorMessage} />}

                <p className={styles.note}>{t("import.note")}</p>
            </form>

            <PageFooter>
                <RegularButton
                    className={styles.submit}
                    type="submit"
                    form={formId}
                    label={t("import.submit")}
                    disabled={isParsing || (!photo && !url.trim())}
                />
            </PageFooter>
        </PageWrapper>
    );
};

export default ImportRecipePage;
