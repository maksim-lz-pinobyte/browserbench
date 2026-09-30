import type { ProviderClient, ProviderSession } from "../types.js";
import { requireEnv } from "../utils/env.js";

// Geonode Stealth Browser: a headful Chrome on a residential exit, one container
// per session. The create call returns once the exit has been verified, so
// `session_creation_ms` here is the time to a browser that already has a working
// residential IP, not the time to a container that may still fail to reach one.
//
// Environment: GEONODE_STEALTH_API_KEY (required), GEONODE_STEALTH_BASE
// (default https://stealth.geonode.io), GEONODE_COUNTRY (exit country, default us).
export class GeonodeProvider implements ProviderClient {
  readonly name = "GEONODE";

  private base(): string {
    return (process.env.GEONODE_STEALTH_BASE || "https://stealth.geonode.io").replace(/\/$/, "");
  }

  async create(): Promise<ProviderSession> {
    const apiKey = requireEnv("GEONODE_STEALTH_API_KEY");
    const res = await fetch(`${this.base()}/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({
        country: process.env.GEONODE_COUNTRY || "us",
        ttl_seconds: 300,
      }),
    });
    if (!res.ok) {
      throw new Error(`Geonode create failed: ${res.status} ${await res.text()}`);
    }
    const session = (await res.json()) as { id?: string; connect_url?: string };
    const id = session.id;
    const cdpUrl = session.connect_url;
    if (!id || !cdpUrl) throw new Error("Invalid Geonode session response");
    return { id, cdpUrl };
  }

  async release(id: string): Promise<void> {
    const apiKey = requireEnv("GEONODE_STEALTH_API_KEY");
    const res = await fetch(`${this.base()}/v1/sessions/${id}`, {
      method: "DELETE",
      headers: { "X-API-Key": apiKey },
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Geonode release failed: ${res.status}`);
    }
  }
}
