import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Tag } from '@recipe/common';

import { useCreateTag, useRenameTag, useTags } from '@/entities/tag';
import { OutlineButton, RegularButton } from '@/shared/ui/Buttons';
import { Input } from '@/shared/ui/Input';

import styles from './TagForm.module.scss';

interface TagFormProps {
    tag?: Tag | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const TagForm = (props: TagFormProps) => {
    const { tag, onSuccess, onCancel } = props;
    const { t } = useTranslation(['sections', 'common']);

    const [name, setName] = useState(tag?.name ?? '');

    const { data: tags = [] } = useTags();
    const { mutate: create, isPending: isCreating, isError: isCreateError } = useCreateTag();
    const { mutate: rename, isPending: isRenaming, isError: isRenameError } = useRenameTag();

    const trimmedName = name.trim().replace(/^#+/, '');
    const isDuplicate = tags.some(
        (item) => item.id !== tag?.id && item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    const isPending = isCreating || isRenaming;

    const error = isDuplicate
        ? t('tags.form.duplicate')
        : isCreateError || isRenameError
            ? t('tags.form.saveFailed')
            : undefined;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!trimmedName || isDuplicate) return;

        if (tag) {
            rename({ id: tag.id, name: trimmedName }, { onSuccess });
        } else {
            create(trimmedName, { onSuccess });
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <Input
                label={t('tags.form.name')}
                rounded
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={error}
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

export default TagForm;
