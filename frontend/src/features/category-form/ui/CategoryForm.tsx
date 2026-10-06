import { type FormEvent, useState } from 'react';

import { Category } from '@recipe/common';

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
        ? 'Такая категория уже есть'
        : isCreateError || isUpdateError
            ? 'Не удалось сохранить категорию'
            : undefined;

    const Icon = getCategoryIcon(iconName);

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
                    aria-label="Выбрать иконку"
                    onClick={() => setIsPickerOpen((prev) => !prev)}
                >
                    <Icon />
                </button>
                <Input
                    label="Название категории"
                    rounded
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    error={error}
                />
            </div>

            <IconPicker
                options={CATEGORY_ICON_LIST}
                value={iconName}
                isOpen={isPickerOpen}
                onChange={handleIconChange}
            />

            <div className={styles.actions}>
                <OutlineButton type="button" label="Отмена" onClick={onCancel} />
                <RegularButton
                    type="submit"
                    label="Сохранить"
                    disabled={!trimmedName || isDuplicate || isPending}
                />
            </div>
        </form>
    );
};

export default CategoryForm;
