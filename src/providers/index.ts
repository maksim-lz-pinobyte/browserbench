import type { ProviderClient } from "../types.js";
import { BrowserbaseProvider } from "./browserbase.js";
import { SteelProvider } from "./steel.js";
import { AnchorBrowserProvider } from "./anchorbrowser.js";
import { HyperbrowserProvider } from "./hyperbrowser.js";
import { KernelProvider } from "./kernel.js";
import { GeonodeProvider } from "./geonode.js";

export function resolveProvider(name: string): ProviderClient {
  const key = name.trim().toLowerCase();

  if (key === "browserbase" || key === "bb") return new BrowserbaseProvider();
  if (key === "steel") return new SteelProvider();
  if (key === "anchorbrowser" || key === "anchor")
    return new AnchorBrowserProvider();
  if (key === "hyperbrowser" || key === "hyper")
    return new HyperbrowserProvider();
  if (key === "kernel") return new KernelProvider();
  if (key === "geonode") return new GeonodeProvider();
  throw new Error(`Unknown provider: ${name}`);
}
