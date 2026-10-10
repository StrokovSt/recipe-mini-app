import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { Recipe } from '@recipe/common';

import { getCategoryIcon } from '@/entities/category';
import ClockIcon from '@/shared/assets/icons/icon-clock.svg?react';
import UserIcon from '@/shared/assets/icons/icon-user.svg?react';
import { IconLabel } from '@/shared/ui/IconLabel';
import { TagList } from '@/shared/ui/Tag';

import styles from './RecipeItem.module.scss';

const MAX_VISIBLE_TAGS = 5;

interface RecipeItemProps {
    recipe: Recipe;
}

const RecipeItem = (props: RecipeItemProps) => {
    const { recipe } = props;
    const { t } = useTranslation('home');
    const { id, title, steps, time, servings, source, media, tags, category } = recipe;

    const cover = media.find((item) => item.type === 'image');
    const PlaceholderIcon = getCategoryIcon(category?.iconName);
    const description = steps[0];

    return (
        <Link to={`/recipe/${id}`} className={styles.card}>
            <div className={styles.media}>
                {cover ? (
                    <img src={cover.url} alt={title} loading="lazy" className={styles.image} />
                ) : (
                    <PlaceholderIcon className={styles.placeholder} aria-hidden />
                )}
                {source === 'telegram' && (
                    <span className={styles.badge}>TG</span>
                )}
            </div>

            <div className={styles.body}>
                <h3 className={styles.title}>{title}</h3>
                {description && (
                    <p className={styles.description}>{description}</p>
                )}

                {(time || servings) && (
                    <div className={styles.meta}>
                        {time && (
                            <IconLabel icon={<ClockIcon />}>{time}</IconLabel>
                        )}
                        {servings && (
                            <IconLabel icon={<UserIcon />}>{t('servings', { count: servings })}</IconLabel>
                        )}
                    </div>
                )}

                <TagList
                    tags={tags.map(({ tag }) => tag)}
                    maxVisible={MAX_VISIBLE_TAGS}
                />
            </div>
        </Link>
    );
};

export default memo(RecipeItem);
