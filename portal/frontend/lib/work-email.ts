/**
 * Documents are sent only to an institutional (work) address. Personal
 * mailbox providers are refused.
 * shortcut: a fixed list of consumer domains, not a DNS/MX or registry check;
 * the team still verifies the institution before replying.
 */
const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com',
  'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'pm.me', 'gmx.com',
  'gmx.net', 'gmx.de', 'web.de', 'mail.com', 'zoho.com', 'yandex.com',
  'yandex.ru', 'ya.ru', 'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru', 'rambler.ru',
  'tutanota.com', 'tuta.io', 'qq.com', '163.com', '126.com', 'hey.com',
  'fastmail.com', 'yahoo.co.uk', 'hotmail.co.uk', 'live.co.uk', 'outlook.de',
]);

const EMAIL_RE = /^[^\s@]+@([a-z0-9-]+\.)+[a-z]{2,}$/i;

export type WorkEmailCheck = 'ok' | 'invalid' | 'personal';

export function checkWorkEmail(raw: string): WorkEmailCheck {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return 'invalid';
  const domain = email.slice(email.lastIndexOf('@') + 1);
  return FREE_MAIL.has(domain) ? 'personal' : 'ok';
}
