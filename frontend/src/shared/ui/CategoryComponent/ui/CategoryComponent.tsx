import React from 'react';

interface CategoryComponentProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

const CategoryComponent = (props: CategoryComponentProps) => {
    const { label } = props;
    return (
        <article>
            {label}
        </article>
    );
};

export default CategoryComponent;