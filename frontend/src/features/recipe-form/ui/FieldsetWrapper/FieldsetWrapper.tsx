import React, { ReactNode } from 'react';

import styles from './FieldsetWrapper.module.scss'

interface FieldsetWrapperProps {
    children: ReactNode;
    legend?: string;
}

const FieldsetWrapper = (props: FieldsetWrapperProps) => {
    const { children, legend } = props;
    return (
        <fieldset className={styles.wrapper}>
            {legend && <legend className={styles.legend}>{legend}</legend>}
            {children}
        </fieldset>
    );
};

export default FieldsetWrapper;