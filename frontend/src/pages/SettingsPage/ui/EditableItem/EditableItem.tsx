import clsx from "clsx";
import { useState } from "react";

import styles from "./EditableItem.module.scss";

interface EditableItemProps {
    name: string;
    count?: number;
    onRename: (newName: string) => void;
    onDelete: () => void;
}

export function EditableItem(props: EditableItemProps) {
    const { name, count, onRename, onDelete } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(name);

    const handleConfirm = () => {
        const trimmed = value.trim();
        if (trimmed && trimmed !== name) onRename(trimmed);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleConfirm();
        if (e.key === "Escape") { setValue(name); setIsEditing(false); }
    };

    return (
        <div className={clsx(styles.item, isEditing && styles.itemEditing)}>
            {isEditing ? (
                <input
                    className={styles.input}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleConfirm}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
            ) : (
                <div className={styles.info} onClick={() => setIsEditing(true)}>
                    <span className={styles.name}>{name}</span>
                    {count !== undefined && (
                        <span className={styles.count}>{count}</span>
                    )}
                </div>
            )}

            <div className={styles.actions}>
                {isEditing ? (
                    <button className={styles.confirmBtn} onClick={handleConfirm}>✓</button>
                ) : (
                    <>
                        <button className={styles.editBtn} onClick={() => setIsEditing(true)}>✎</button>
                        <button className={styles.deleteBtn} onClick={onDelete}>✕</button>
                    </>
                )}
            </div>
        </div>
    );
}