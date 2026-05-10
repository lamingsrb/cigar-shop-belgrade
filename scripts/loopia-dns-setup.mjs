// =======================================================
// Loopia DNS auto-config za cigarshop.rs → Vercel
// XML-RPC API: https://api.loopia.se/RPCSERV
//
// Šta radi (surgical, ne dira email):
//   1. Briše A @ 23.227.38.65          (stari Shopify)
//   2. Briše AAAA @ 2620:0127:f00f:5:: (stari Loopia IPv6 hosting)
//   3. Briše CNAME www → shops.myshopify.com (stari Shopify www)
//   4. Dodaje A @ → 76.76.21.21        (Vercel apex)
//   5. Dodaje A www → 76.76.21.21      (Vercel www)
//
// Šta NE dira:
//   MX (mailcluster.loopia.se, mail2.loopia.se) — email
//   TXT @ "v=spf1 include:spf.loopia.se -all" — SPF
//   TXT loopiadkim..._domainkey — DKIM
//   SRV _autodiscover._tcp — Outlook autoconfig
//   CNAME autoconfig → autoconfig.loopia.com — mail client autoconfig
//   NS ns1/ns2.loopia.se — name serveri
//
// Idempotentan: sigurno ga je pokrenuti više puta.
// =======================================================
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CRED_PATH = join(ROOT, 'CREDENTIALS.local.md');

const LOOPIA_API = 'https://api.loopia.rs/RPCSERV';
const VERCEL_IP = '76.76.21.21';
const DOMAIN = 'cigarshop.rs';

// Records to delete (matched by type + value) and add.
const TO_DELETE = [
  { subdomain: '@',   type: 'A',     rdata: '23.227.38.65' },
  { subdomain: '@',   type: 'AAAA',  rdata: '2620:0127:f00f:5::' },
  { subdomain: 'www', type: 'CNAME', rdata: 'shops.myshopify.com.' },
];
const TO_ADD = [
  { subdomain: '@',   type: 'A', rdata: VERCEL_IP, ttl: 3600, priority: 0 },
  { subdomain: 'www', type: 'A', rdata: VERCEL_IP, ttl: 3600, priority: 0 },
];

// ---- XML-RPC encoder ----
function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function xmlValue(v) {
  if (typeof v === 'string') return `<value><string>${xmlEscape(v)}</string></value>`;
  if (typeof v === 'number') {
    return Number.isInteger(v) ? `<value><int>${v}</int></value>` : `<value><double>${v}</double></value>`;
  }
  if (typeof v === 'boolean') return `<value><boolean>${v ? 1 : 0}</boolean></value>`;
  if (Array.isArray(v)) {
    const items = v.map(it => xmlValue(it)).join('');
    return `<value><array><data>${items}</data></array></value>`;
  }
  if (v && typeof v === 'object') {
    const members = Object.entries(v).map(([k, val]) =>
      `<member><name>${xmlEscape(k)}</name>${xmlValue(val)}</member>`
    ).join('');
    return `<value><struct>${members}</struct></value>`;
  }
  return '<value><nil/></value>';
}
function buildRequest(method, params) {
  const xmlParams = params.map(p => `<param>${xmlValue(p)}</param>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>${method}</methodName>
  <params>${xmlParams}</params>
</methodCall>`;
}

// ---- Tiny XML-RPC response parser (regex-based, sufficient for Loopia) ----
function parseRpcResponse(xml) {
  // Detect fault first
  const faultMatch = /<fault>\s*<value>\s*<struct>([\s\S]*?)<\/struct>\s*<\/value>\s*<\/fault>/.exec(xml);
  if (faultMatch) {
    const code = parseInt((/<name>faultCode<\/name>\s*<value>\s*<int>(-?\d+)/.exec(faultMatch[1]) || [, '0'])[1], 10);
    const msg = (/<name>faultString<\/name>\s*<value>\s*<string>([\s\S]*?)<\/string>/.exec(faultMatch[1]) || [, ''])[1];
    return { fault: { code, message: msg } };
  }
  // Find top-level <param><value>...</value></param>
  const topMatch = /<params>\s*<param>\s*<value>([\s\S]*)<\/value>\s*<\/param>\s*<\/params>/.exec(xml);
  if (!topMatch) return { raw: xml };

  // Walk the inner structure recursively. Use a streaming tokenizer over <tag>…</tag>.
  return { value: parseInner(topMatch[1]) };
}

// Parse inside-of-value content. Looks at the first wrapper: <string>, <int>, <array>, <struct>, etc.
function parseInner(s) {
  s = s.trim();
  // Try matching the top-level wrapper.
  let m;
  if ((m = /^<string>([\s\S]*?)<\/string>/.exec(s))) return decodeXml(m[1]);
  if ((m = /^<(?:int|i4)>(-?\d+)<\/(?:int|i4)>/.exec(s))) return parseInt(m[1], 10);
  if ((m = /^<double>(-?[\d.]+)<\/double>/.exec(s))) return parseFloat(m[1]);
  if ((m = /^<boolean>(\d)<\/boolean>/.exec(s))) return m[1] === '1';
  if (/^<nil\s*\/?>/.test(s)) return null;
  if (/^<array>/.test(s)) {
    const inner = /^<array>\s*<data>([\s\S]*)<\/data>\s*<\/array>/.exec(s);
    if (!inner) return [];
    return splitTopLevel(inner[1], 'value').map(v => parseInner(stripWrapper(v, 'value')));
  }
  if (/^<struct>/.test(s)) {
    const inner = /^<struct>([\s\S]*)<\/struct>/.exec(s);
    if (!inner) return {};
    const obj = {};
    splitTopLevel(inner[1], 'member').forEach(memberRaw => {
      const member = stripWrapper(memberRaw, 'member');
      const nm = /<name>([\s\S]*?)<\/name>/.exec(member);
      const valStart = member.indexOf('<value>');
      if (!nm || valStart < 0) return;
      // Extract value content (find matching </value> at same nesting)
      const valSegment = extractWrapper(member.slice(valStart), 'value');
      obj[decodeXml(nm[1])] = parseInner(stripWrapper(valSegment, 'value'));
    });
    return obj;
  }
  // Fallback
  return s;
}

function decodeXml(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

// Split a string into top-level <tag>…</tag> segments at the same nesting level.
function splitTopLevel(s, tag) {
  const out = [];
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  let i = 0;
  while (i < s.length) {
    const start = s.indexOf(open, i);
    if (start < 0) break;
    // Find matching close at same depth
    let depth = 0;
    let j = start;
    while (j < s.length) {
      if (s.startsWith(open, j)) { depth++; j += open.length; }
      else if (s.startsWith(close, j)) {
        depth--;
        if (depth === 0) {
          j += close.length;
          out.push(s.slice(start, j));
          break;
        } else {
          j += close.length;
        }
      } else {
        j++;
      }
    }
    if (depth !== 0) break;
    i = j;
  }
  return out;
}

// Extract one balanced <tag>…</tag> starting at position 0.
function extractWrapper(s, tag) {
  const segs = splitTopLevel(s, tag);
  return segs[0] || s;
}
function stripWrapper(s, tag) {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  if (s.startsWith(open) && s.endsWith(close)) {
    return s.slice(open.length, -close.length);
  }
  return s;
}

async function rpc(method, ...params) {
  const body = buildRequest(method, params);
  const res = await fetch(LOOPIA_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=UTF-8' },
    body,
  });
  const text = await res.text();
  return parseRpcResponse(text);
}

async function loadCreds() {
  const md = await readFile(CRED_PATH, 'utf8');
  const apiSection = md.split('Loopia API user')[1];
  if (!apiSection) throw new Error('No "Loopia API user" section in CREDENTIALS.local.md');
  const u = /Korisni[čc]ko ime:\*\*\s*`([^`]+)`/.exec(apiSection)?.[1];
  const p = /Lozinka:\*\*\s*`([^`]+)`/.exec(apiSection)?.[1];
  if (!u || !p) throw new Error('Cannot parse Loopia API credentials');
  return { user: u, pass: p };
}

async function listRecords(creds, subdomain) {
  return rpc('getZoneRecords', creds.user, creds.pass, DOMAIN, subdomain);
}

async function removeRecord(creds, subdomain, recordId) {
  return rpc('removeZoneRecord', creds.user, creds.pass, DOMAIN, subdomain, recordId);
}

async function addRecord(creds, subdomain, type, rdata, ttl = 3600, priority = 0) {
  const record = { type, ttl, priority, rdata, record_id: 0 };
  return rpc('addZoneRecord', creds.user, creds.pass, DOMAIN, subdomain, record);
}

function fmt(r) {
  return `${String(r.type).padEnd(6)} ttl=${r.ttl} prio=${r.priority} → ${r.rdata}`;
}

async function main() {
  const creds = await loadCreds();
  console.log(`[loopia] Authenticating as "${creds.user}"…\n`);

  // Sanity check — list current apex records.
  const apexBefore = await listRecords(creds, '@');
  if (apexBefore.fault) {
    console.error(`[FAULT] ${apexBefore.fault.code}: ${apexBefore.fault.message}`);
    process.exit(2);
  }

  console.log('=== BEFORE — apex (@) records ===');
  apexBefore.value.forEach(r => console.log('  ', fmt(r)));

  const wwwBefore = await listRecords(creds, 'www');
  console.log('\n=== BEFORE — www records ===');
  if (wwwBefore.fault) {
    console.log('  (no www subdomain or fault:', wwwBefore.fault.message, ')');
  } else {
    wwwBefore.value.forEach(r => console.log('  ', fmt(r)));
  }

  // ---- Step 1: delete old records that match TO_DELETE ----
  console.log('\n=== STEP 1: Removing obsolete records ===');
  for (const target of TO_DELETE) {
    const cur = target.subdomain === 'www' ? wwwBefore.value : apexBefore.value;
    if (!Array.isArray(cur)) continue;
    const match = cur.find(r =>
      r.type === target.type &&
      String(r.rdata).replace(/\.$/, '') === String(target.rdata).replace(/\.$/, '')
    );
    if (!match) {
      console.log(`  - skip (not found): ${target.subdomain} ${target.type} ${target.rdata}`);
      continue;
    }
    const result = await removeRecord(creds, target.subdomain, match.record_id);
    if (result.fault) {
      console.log(`  ! FAILED ${target.subdomain} ${target.type} ${target.rdata}: ${result.fault.message}`);
    } else {
      console.log(`  ✓ removed ${target.subdomain} ${target.type} ${target.rdata}`);
    }
  }

  // ---- Step 2: add new Vercel A records (skip if already exist) ----
  console.log('\n=== STEP 2: Adding Vercel A records ===');
  const apexAfterDel = await listRecords(creds, '@');
  const wwwAfterDel = await listRecords(creds, 'www');
  const apexExisting = Array.isArray(apexAfterDel.value) ? apexAfterDel.value : [];
  const wwwExisting = Array.isArray(wwwAfterDel.value) ? wwwAfterDel.value : [];

  for (const a of TO_ADD) {
    const cur = a.subdomain === 'www' ? wwwExisting : apexExisting;
    const dup = cur.find(r => r.type === a.type && r.rdata === a.rdata);
    if (dup) {
      console.log(`  - already exists: ${a.subdomain} ${a.type} ${a.rdata}`);
      continue;
    }
    const result = await addRecord(creds, a.subdomain, a.type, a.rdata, a.ttl, a.priority);
    if (result.fault) {
      console.log(`  ! FAILED ${a.subdomain} ${a.type} ${a.rdata}: ${result.fault.message}`);
    } else {
      console.log(`  ✓ added ${a.subdomain} ${a.type} ${a.rdata}`);
    }
  }

  // ---- Step 3: verify ----
  console.log('\n=== AFTER — apex (@) records ===');
  const apexAfter = await listRecords(creds, '@');
  (apexAfter.value || []).forEach(r => console.log('  ', fmt(r)));

  console.log('\n=== AFTER — www records ===');
  const wwwAfter = await listRecords(creds, 'www');
  (wwwAfter.value || []).forEach(r => console.log('  ', fmt(r)));

  // Sanity — check email infra didn't get touched.
  const apexFinal = apexAfter.value || [];
  const hasMx1 = apexFinal.some(r => r.type === 'MX' && /mailcluster\.loopia\.se/.test(r.rdata));
  const hasMx2 = apexFinal.some(r => r.type === 'MX' && /mail2\.loopia\.se/.test(r.rdata));
  const hasSpf = apexFinal.some(r => r.type === 'TXT' && /v=spf1.*spf\.loopia\.se/.test(r.rdata));

  console.log('\n=== EMAIL SAFETY CHECK ===');
  console.log(`  ${hasMx1 ? '✓' : '✗'} MX 10 mailcluster.loopia.se preserved`);
  console.log(`  ${hasMx2 ? '✓' : '✗'} MX 20 mail2.loopia.se preserved`);
  console.log(`  ${hasSpf ? '✓' : '✗'} SPF TXT preserved`);
  if (!hasMx1 || !hasMx2 || !hasSpf) {
    console.error('\n[!!!] Email records may have been damaged. Check DNS-editor in Loopia panel.');
    process.exit(3);
  }

  console.log('\n[loopia] Done. DNS propagacija 5-60 min.');
  console.log('  → Test: nslookup cigarshop.rs (treba 76.76.21.21)');
  console.log('  → Posle: https://cigarshop.rs i https://www.cigarshop.rs.');
}

main().catch(err => {
  console.error('[loopia] FAILED:', err?.message || err);
  process.exit(1);
});
