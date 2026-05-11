// Vercel Edge Middleware (pure Web Standard API)
// Cilj: kad korisnik dođe na cigarshop.rs ili www.cigarshop.rs, sadržaj
// stranice se INTERNI rewrite-uje na /coming-soon.html (URL u browseru
// ostaje cigarshop.rs/...). Dolazak preko bilo kog drugog hostname-a
// (vercel.app preview URL-ovi) ide na pravi sajt.
//
// Vercel runtime: za rewrite koristi se `x-middleware-rewrite` header
// na praznom Response objektu (zvanično dokumentovan put bez external
// dependency-ja kao što je next/server).

export const config = {
  // Sve sem: /assets/*, /coming-soon.html, /favicon*, /robots.txt
  matcher: [
    '/((?!assets/|coming-soon\\.html|favicon|robots\\.txt).*)',
  ],
};

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase();

  if (host === 'cigarshop.rs' || host === 'www.cigarshop.rs') {
    const url = new URL(request.url);
    url.pathname = '/coming-soon.html';
    return new Response(null, {
      headers: { 'x-middleware-rewrite': url.toString() },
    });
  }

  // Pass-through za sve ostalo (vercel.app, preview URL-ovi)
  return undefined;
}
