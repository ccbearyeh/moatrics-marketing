/**
 * Lightweight i18n helper for the marketing site.
 *
 * Phase A is English-only — we re-export a `t("path.to.key")` getter that
 * resolves dotted paths against `en.json`. When we add ZH (Phase B+) we'll
 * route through a getStaticPaths-driven `[lang]` segment and pass the dict
 * into this helper.
 */
import en from './en.json';
import zh from './zh.json';

export type Lang = 'en' | 'zh';

const DICTS: Record<Lang, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  zh: zh as Record<string, unknown>,
};

export function getDict(lang: Lang = 'en'): Record<string, unknown> {
  return DICTS[lang] ?? DICTS.en;
}

export function t(path: string, lang: Lang = 'en'): string {
  const parts = path.split('.');
  let cursor: unknown = getDict(lang);
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return path; // fallback: show the key path so missing keys are visible
    }
  }
  return typeof cursor === 'string' ? cursor : path;
}

export function getNode(path: string, lang: Lang = 'en'): unknown {
  const parts = path.split('.');
  let cursor: unknown = getDict(lang);
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }
  return cursor;
}
