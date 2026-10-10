import { useContext } from "react";

import { PageHeaderContext } from "../lib/pageHeaderContext";

import styles from "./PageHeader.module.scss";

// Общая полоса шапки в App: стоит на месте при переходах, как footer.
// Содержимое приходит из страниц через PageHeader
export function PageHeaderBar() {
    const { setBar } = useContext(PageHeaderContext);

    return <header ref={setBar} className={styles.bar} />;
}
