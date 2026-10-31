# GitHub Pages + Cloudflare DNS deployment

## Stage 1 — Public preview (no DNS changes)

1. Create `krunchyMonkey/krunchymonkey-site` public with the included bootstrap script.
2. In GitHub **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**.
3. Trigger `.github/workflows/pages.yml` (or push to `main`) and wait for successful deployment.
4. Test `https://krunchymonkey.github.io/krunchymonkey-site/` on desktop and mobile. Check all routes, favicon and internal links.
5. Review `docs/reference/` for pixel parity. The site is static and independent of the private research service.

## Stage 2 — Owner-approved custom apex domain

1. Verify control of `krunchymonkey.dev` and follow [GitHub Pages custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
2. In **Settings → Pages → Custom domain**, set `krunchymonkey.dev`; this is a setting, **not** a CNAME file for Pages Actions. GitHub's Actions-based Pages ignores CNAME files.
3. In Cloudflare DNS for `krunchymonkey.dev`, create the GitHub-recommended **apex A records** for the public website. The commonly documented GitHub Pages IPv4 addresses are:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
   **Confirm current values on GitHub's docs before editing.** Set Cloudflare proxy to **DNS only** initially to avoid TLS/proxy troubleshooting while issuing the certificate.
4. Optionally configure `www` as a CNAME to `krunchymonkey.github.io` (confirm recommended target and redirect behavior in GitHub docs). This is a separate decision.
5. Wait for GitHub Pages domain validation and TLS certificate provisioning, then enable **Enforce HTTPS** and verify the correct certificate from an external network.
6. Confirm apex/root resolves publicly and site renders; confirm private app still cannot be reached from an external network.

## Deliberate safety boundaries

- **Never** create a public A/AAAA/CNAME for `tg.krunchymonkey.dev` pointing to the LAN, a home IP or a tunnel.
- **Never** use this repository to expose a Caddy listener, router port forward, private SQLite database, researcher accounts, or Cloudflare API token.
- Do not overwrite unrelated DNS records for MX/TXT, email verification or internal ACME DNS-01.
- Subdomains do not imply all sites share the same security boundary: keep `tg` application host-only cookies and separate authorization inside the private application.
- The public landing page can be online even while `tg.krunchymonkey.dev` is private, stopped, or under development.

## Rollback

If DNS cutover is incorrect, remove/revert **only the public apex GitHub Pages DNS records** and reverse the Pages custom-domain setting. Do not delete Cloudflare nameservers, the domain registration, or private ACME TXT automation. Preserve previously existing DNS records.

## References

- [GitHub Pages: custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages: custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)