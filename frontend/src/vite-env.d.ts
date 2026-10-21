/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

declare module "*.svg?react" {
    import { FC, SVGProps } from "react";

    const ReactComponent: FC<SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}