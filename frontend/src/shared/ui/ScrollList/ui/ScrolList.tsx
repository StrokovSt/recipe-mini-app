import clsx from 'clsx';
import React from 'react';

import { ScrollDirection, ScrollSpeed } from '../lib/types';

import styles from './ScrolList.module.scss'

interface ScrolListProps {
    list: string[]

    className?: string;
    direction?: ScrollDirection
    speed?: ScrollSpeed
}

const ScrolList = (props: ScrolListProps) => {
    const {list, className, direction = 'right', speed = 'fast'} = props;

    return (
        <article className={clsx(className, styles.scroller)} data-direction={direction} data-speed={speed} data-animated={true}>
            <ul className={clsx(styles['tag-list'], styles['scroller-inner'])} >
                {
                    list.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)
                }
            </ul>
        </article>
    );
};

export default ScrolList;