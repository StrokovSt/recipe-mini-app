import { type ReactNode, useMemo, useState } from "react";

import { PageHeaderContext } from "../lib/pageHeaderContext";

interface PageHeaderProviderProps {
    children: ReactNode;
}

export function PageHeaderProvider(props: PageHeaderProviderProps) {
    const { children } = props;
    const [bar, setBar] = useState<HTMLElement | null>(null);
    const value = useMemo(() => ({ bar, setBar }), [bar]);

    return <PageHeaderContext value={value}>{children}</PageHeaderContext>;
}
