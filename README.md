**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Toolchoice admin: [Hướng dẫn quản trị và cấu hình AI](docs/admin-guide.md).

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

### Marchoice introduction

Public browsing pages show the Marchoice introduction after 1.2 seconds. The popup links to https://marchoice.site in a new tab and can be reopened from the ecosystem section in the sidebar. Closing it pauses reminders for 4 hours; selecting the 24-hour option or visiting Marchoice pauses reminders for 24 hours. Preferences are saved in browser storage when available. Authentication and admin pages do not show the popup.

### Publisher information and AdSense

Public information pages live in `public/about.html`, `public/contact.html`, `public/privacy.html`, and `public/choosing-tools.html`; their shared styles are in `public/publisher-pages.css`. Navigation is provided by `PublisherLinks`, with privacy information next to newsletter forms. Update the privacy disclosure whenever data processing changes. The confirmed public contact is `support@toolchoice.site`.

`public/sitemap.xml` lists the public entry points referenced by `public/robots.txt`. `public/ads.txt` and the AdSense account meta tag must use the same publisher account. Site approval remains Google's decision; publishing these pages does not guarantee approval.

Production `www.toolchoice.site` is served by the existing Vercel project `toolchoice-new` in team `nguyenngockieutran-3710s-projects`. CLI deployments use `npx vercel deploy --prod --yes --scope nguyenngockieutran-3710s-projects` after linking that project. `.vercelignore` excludes local environment files and private workspace metadata. Never commit or upload environment secrets. Verify public pages and `ads.txt` after deployment; use the Vercel deployment history to restore the previous production deployment if needed.

### Catalogue content integrity

Tool profiles render only catalogue descriptions and recorded features through `src/lib/tool-content.js`. Do not infer speed, reliability, strengths or limitations from category or pricing, and do not label catalogue entries as independently tested reviews. Similar-category entries are discovery suggestions, not interchangeable product recommendations. Home must retain guide links and the footer after React mounts. The shared ticker reports catalogue counts only.

Worked examples live with blog data; their optional code, visual preview and sources must render in both `BlogPostPage` and `scripts/prerender.mjs`. Verify with `npm run build` followed by `node --test tests/publisher-content.test.mjs`. Google approval is an external decision.
