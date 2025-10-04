import { clearConfig, readConfig, writeConfig } from '../utils/storage';
import type { ConfigSnapshot, DomainOverride, EffectiveConfig, RuleSwitches, StoredConfig } from '../types/config';

const CONFIG_VERSION = 1;

const DEFAULT_RULES: RuleSwitches = {
  enableTopicNewTab: true,
  keepSameTopicInTab: true,
  keepNonTopicDefault: true,
  skipAttachments: true,
  skipPopupLike: true
};

const DEFAULT_CONFIG: StoredConfig = {
  version: CONFIG_VERSION,
  whitelist: [],
  blacklist: [],
  rules: DEFAULT_RULES,
  overrides: []
};

function cloneRules(rules: RuleSwitches): RuleSwitches {
  return { ...rules };
}

function normaliseDomain(value: string): string {
  return value.trim().toLowerCase();
}

function createEffectiveFromStored(config: StoredConfig): EffectiveConfig {
  return {
    version: CONFIG_VERSION,
    whitelist: config.whitelist.map(normaliseDomain),
    blacklist: config.blacklist.map(normaliseDomain),
    rules: cloneRules(config.rules),
    overrides: config.overrides.map((item) => ({
      domain: normaliseDomain(item.domain),
      rules: item.rules ? { ...item.rules } : undefined
    }))
  };
}

function toStored(config: EffectiveConfig): StoredConfig {
  return {
    version: CONFIG_VERSION,
    whitelist: [...config.whitelist],
    blacklist: [...config.blacklist],
    rules: cloneRules(config.rules),
    overrides: config.overrides.map((item) => ({
      domain: item.domain,
      rules: item.rules ? { ...item.rules } : undefined
    }))
  };
}

function mergeRules(base: RuleSwitches, patch?: Partial<RuleSwitches>): RuleSwitches {
  return patch ? { ...base, ...patch } : base;
}

function matchDomain(host: string, candidate: string): boolean {
  if (!candidate) return false;
  if (host === candidate) return true;
  return host.endsWith(`.${candidate}`);
}

export class ConfigManager {
  private effective: EffectiveConfig;

  constructor() {
    this.effective = this.load();
  }

  private load(): EffectiveConfig {
    const stored = readConfig<StoredConfig>(DEFAULT_CONFIG);
    if (!stored || stored.version !== CONFIG_VERSION) {
      writeConfig(DEFAULT_CONFIG);
      return createEffectiveFromStored(DEFAULT_CONFIG);
    }
    return createEffectiveFromStored(stored);
  }

  private persist(): void {
    writeConfig(toStored(this.effective));
  }

  getSnapshot(hostname: string): ConfigSnapshot {
    return {
      config: this.effective,
      domainRules: this.resolveRules(hostname)
    };
  }

  getConfig(): EffectiveConfig {
    return this.effective;
  }

  setConfig(next: StoredConfig): void {
    this.effective = createEffectiveFromStored(next);
    this.persist();
  }

  reset(): void {
    this.effective = createEffectiveFromStored(DEFAULT_CONFIG);
    clearConfig();
    writeConfig(DEFAULT_CONFIG);
  }

  isWhitelisted(hostname: string): boolean {
    const host = normaliseDomain(hostname);
    return this.effective.whitelist.some((item) => matchDomain(host, item));
  }

  isBlacklisted(hostname: string): boolean {
    const host = normaliseDomain(hostname);
    return this.effective.blacklist.some((item) => matchDomain(host, item));
  }

  addToWhitelist(domain: string): void {
    const value = normaliseDomain(domain);
    if (!value) return;
    if (!this.effective.whitelist.includes(value)) {
      this.effective.whitelist.push(value);
      this.persist();
    }
  }

  removeFromWhitelist(domain: string): void {
    const value = normaliseDomain(domain);
    this.effective.whitelist = this.effective.whitelist.filter((item) => item !== value);
    this.persist();
  }

  addToBlacklist(domain: string): void {
    const value = normaliseDomain(domain);
    if (!value) return;
    if (!this.effective.blacklist.includes(value)) {
      this.effective.blacklist.push(value);
      this.persist();
    }
  }

  removeFromBlacklist(domain: string): void {
    const value = normaliseDomain(domain);
    this.effective.blacklist = this.effective.blacklist.filter((item) => item !== value);
    this.persist();
  }

  replaceRules(rules: RuleSwitches): void {
    this.effective.rules = cloneRules(rules);
    this.persist();
  }

  upsertOverride(entry: DomainOverride): void {
    const domain = normaliseDomain(entry.domain);
    const existing = this.effective.overrides.find((item) => item.domain === domain);
    if (existing) {
      existing.rules = entry.rules ? { ...existing.rules, ...entry.rules } : existing.rules;
    } else {
      this.effective.overrides.push({
        domain,
        rules: entry.rules ? { ...entry.rules } : undefined
      });
    }
    this.persist();
  }

  removeOverride(domain: string): void {
    const value = normaliseDomain(domain);
    this.effective.overrides = this.effective.overrides.filter((item) => item.domain !== value);
    this.persist();
  }

  private resolveRules(hostname: string): RuleSwitches {
    const host = normaliseDomain(hostname);
    let resolved = cloneRules(this.effective.rules);
    for (const override of this.effective.overrides) {
      if (matchDomain(host, override.domain)) {
        resolved = mergeRules(resolved, override.rules);
      }
    }
    return resolved;
  }
}

export const configManager = new ConfigManager();