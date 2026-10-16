import { type ReactNode, useMemo, useState } from "react";

import { PageFooterContext } from "../lib/pageFooterContext";

interface PageFooterProviderProps {
    children: ReactNode;
}

export function PageFooterProvider(props: PageFooterProviderProps) {
    const { children } = props;
    const [slot, setSlot] = useState<HTMLElement | null>(null);
    const value = useMemo(() => ({ slot, setSlot }), [slot]);

    return <PageFooterContext value={value}>{children}</PageFooterContext>;
}
