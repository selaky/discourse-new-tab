export interface RuleSwitches {
  enableTopicNewTab: boolean;
  keepSameTopicInTab: boolean;
  openUserProfileInNewTab: boolean;
  keepNonTopicDefault: boolean;
  skipAttachments: boolean;
  skipPopupLike: boolean;
}

export interface DomainOverride {
  domain: string;
  rules?: Partial<RuleSwitches>;
}

export interface StoredConfig {
  version: number;
  whitelist: string[];
  blacklist: string[];
  rules: RuleSwitches;
  overrides: DomainOverride[];
}

export interface EffectiveConfig extends StoredConfig {}

export interface ConfigSnapshot {
  config: EffectiveConfig;
  domainRules: RuleSwitches;
}