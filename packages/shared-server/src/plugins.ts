import { PluginManager } from "@karakeep/shared/plugins";
import serverConfig from "@karakeep/shared/config";

let pluginsLoaded = false;
const importPluginRuntime = (specifier: string) =>
  new Function("specifier", "return import(specifier)")(
    specifier,
  ) as Promise<unknown>;

export async function loadAllPlugins() {
  if (pluginsLoaded) {
    return;
  }
  // Load plugins here. Order of plugin loading matter.
  // Queue provider(s)
  if (serverConfig.database.driver === "postgres") {
    await import("@karakeep/plugins/queue-postgres");
  } else {
    await importPluginRuntime("@karakeep/plugins/queue-liteque");
  }
  await import("@karakeep/plugins/queue-restate");
  await import("@karakeep/plugins/search-meilisearch");
  // Rate limiters (order matters - last one wins)
  await import("@karakeep/plugins/ratelimit-memory");
  await import("@karakeep/plugins/ratelimit-redis");
  PluginManager.logAllPlugins();
  pluginsLoaded = true;
}
