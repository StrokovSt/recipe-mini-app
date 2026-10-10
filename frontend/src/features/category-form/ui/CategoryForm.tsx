import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Category } from '@recipe/common';

import {
    CATEGORY_ICON_LIST,
    type CategoryIconName,
    getCategoryIcon,
    useCategories,
    useCreateCategory,
    useUpdateCategory,
} from '@/entities/category';
import { OutlineButton, RegularButton } from '@/shared/ui/Buttons';
import { IconPicker } from '@/shared/ui/IconPicker';
import { Input } from '@/shared/ui/Input';

import styles from './CategoryForm.module.scss';

const DEFAULT_ICON_NAME: CategoryIconName = 'Cutlery';

interface CategoryFormProps {
    category?: Category | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const CategoryForm = (props: CategoryFormProps) => {
    const { category, onSuccess, onCancel } = props;
    const { t } = useTranslation(['sections', 'common']);

    const [name, setName] = useState(category?.name ?? '');
    const [iconName, setIconName] = useState(category?.iconName ?? DEFAULT_ICON_NAME);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const { data: categories = [] } = useCategories();
    const { mutate: create, isPending: isCreating, isError: isCreateError } = useCreateCategory();
    const { mutate: update, isPending: isUpdating, isError: isUpdateError } = useUpdateCategory();

    const trimmedName = name.trim();
    const isDuplicate = categories.some(
        (item) => item.id !== category?.id && item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    const isPending = isCreating || isUpdating;

    const error = isDuplicate
        ? t('categories.form.duplicate')
        : isCreateError || isUpdateError
            ? t('categories.form.saveFailed')
            : undefined;

    const Icon = getCategoryIcon(iconName);
    const iconOptions = CATEGORY_ICON_LIST.map((option) => ({ ...option, label: t(`icons.${option.name}`) }));

    const handleIconChange = (nextIconName: string) => {
        setIconName(nextIconName);
        setIsPickerOpen(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!trimmedName || isDuplicate) return;

        if (category) {
            update({ id: category.id, name: trimmedName, iconName }, { onSuccess });
        } else {
            create({ name: trimmedName, iconName }, { onSuccess });
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
                <button
                    type="button"
                    className={styles.iconTrigger}
                    aria-expanded={isPickerOpen}
                    aria-label={t('categories.form.pickIcon')}
                    onClick={() => setIsPickerOpen((prev) => !prev)}
                >
                    <Icon />
                </button>
                <Input
                    label={t('categories.form.name')}
                    rounded
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    error={error}
                />
            </div>

            <IconPicker
                options={iconOptions}
                value={iconName}
                isOpen={isPickerOpen}
                onChange={handleIconChange}
            />

            <div className={styles.actions}>
                <OutlineButton type="button" label={t('common:cancel')} onClick={onCancel} />
                <RegularButton
                    type="submit"
                    label={t('common:save')}
                    disabled={!trimmedName || isDuplicate || isPending}
                />
            </div>
        </form>
    );
};

export default CategoryForm;
