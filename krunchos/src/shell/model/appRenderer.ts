import type { ReactNode } from "react";
import type { AppId } from "../../apps";

export type AppRenderer = (id: AppId) => ReactNode;
