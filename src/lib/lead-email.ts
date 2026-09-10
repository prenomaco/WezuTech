import { siteUrl } from "@/lib/env";

/**
 * The enquiry notification, addressed to both sides at once.
 *
 * One message goes to the sales inbox with the enquirer in Cc, so the copy can
 * never lean on "you" meaning either party alone: it reports what arrived and
 * what happens next, and lets each reader take the part that is theirs. Every
 * sentence here has to survive being read by a stranger and by the team in the
 * same breath.
 */

export interface LeadMail {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly subject: string | null;
  readonly message: string;
  readonly phone: string | null;
  readonly company: string | null;
  readonly createdAt?: Date;
  /** Set when the enquiry came from a product page's quote button. */
  readonly productName?: string | null;
  readonly productSlug?: string | null;
}

/**
 * The site's tokens, resolved to flat hex.
 *
 * `globals.css` keeps the hairline and the muted label as translucent ice over
 * the panel, which no mail client can be trusted to composite — several strip
 * `rgba()` outright and a few more re-colour anything they read as a
 * transparency. So the blends are done here once, against `ink-raised`, and
 * shipped as the opaque colours they resolve to on screen.
 */
const COLOR = {
  ink: "#02071c",
  panel: "#07122b",
  /* ice at 16% and mist at 60%, both over `panel`. */
  hairline: "#29374b",
  muted: "#8594a7",
  ice: "#dafaf5",
  mist: "#daebfa",
  sky: "#0985cc",
  skyBright: "#23a4ec",
  white: "#ffffff",
} as const;

/**
 * Centauri and Overused Grotesk are webfonts the site loads itself; mail
 * clients will not, so the stacks below name what the design falls back to
 * rather than pretending the real faces are available. Arial Narrow carries
 * the display line because the headline's character is its condensed all-caps
 * setting, and that is the one part of Centauri a system face can keep.
 */
const DISPLAY_FONT = "'Arial Narrow', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const BODY_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const CONTACT = {
  email: "purchase@wezutech.com",
  phone: "+91 9247539016",
  phoneHref: "tel:+919247539016",
} as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Paragraph breaks survive as spacing; single newlines become `<br>`.
 *
 * Each paragraph is emitted with the full style rather than relying on the
 * first one — these are siblings, not children, so an unstyled continuation
 * inherits the client's default body font and the second half of a message
 * arrives in Times.
 */
function formatMessage(message: string) {
  const style = `margin:0;font:400 15px/25px ${BODY_FONT};color:${COLOR.ice};`;
  return escapeHtml(message.trim())
    .split(/\n{2,}/)
    .map((block, index) => {
      const spacing = index === 0 ? style : style.replace("margin:0;", "margin:14px 0 0;");
      return `<p style="${spacing}">${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date) + " IST";
}

/**
 * Only the rows that carry something.
 *
 * The contact form asks for a name, an email, a subject and a message, so
 * phone and company — which the `Lead` model does hold, for a lead entered by
 * hand or a form that grows a field later — are empty on everything the site
 * sends today. Printing them anyway would put two placeholder dashes in every
 * email, which reads as a template with holes in it rather than a record.
 */
function detailRows(lead: LeadMail) {
  const rows: { label: string; value: string | null; href?: string }[] = [
    { label: "Name", value: lead.name },
    { label: "Email", value: lead.email, href: `mailto:${lead.email}` },
    { label: "Phone", value: lead.phone, href: lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : undefined },
    { label: "Company", value: lead.company },
    {
      label: "Product",
      value: lead.productName ?? null,
      href: lead.productSlug ? `${siteUrl}/products/${lead.productSlug}` : undefined,
    },
    { label: "Subject", value: lead.subject },
    { label: "Received", value: formatDate(lead.createdAt ?? new Date()) },
  ];
  return rows.filter((row): row is { label: string; value: string; href?: string } => Boolean(row.value?.trim()));
}

function renderDetailRows(lead: LeadMail) {
  return detailRows(lead)
    .map(({ label, value, href }, index) => {
      /* The first row's rule would double the panel's own top border. */
      const border = index === 0 ? "" : `border-top:1px solid ${COLOR.hairline};`;
      const cell = `padding:11px 0;${border}`;
      const shown = escapeHtml(value);
      const content = href
        ? `<a href="${escapeHtml(href)}" style="color:${COLOR.skyBright};text-decoration:none;">${shown}</a>`
        : shown;
      return `
              <tr>
                <td style="${cell}font:400 12px/18px ${BODY_FONT};letter-spacing:0.08em;text-transform:uppercase;color:${COLOR.muted};white-space:nowrap;vertical-align:top;width:120px;">${escapeHtml(label)}</td>
                <td style="${cell}font:400 15px/22px ${BODY_FONT};color:${COLOR.ice};vertical-align:top;">${content}</td>
              </tr>`;
    })
    .join("");
}

export function leadEmailSubject(lead: LeadMail) {
  const detail = lead.productName ?? lead.subject ?? "New website enquiry";
  return `Enquiry received — ${detail}`;
}

export function leadEmailText(lead: LeadMail) {
  const lines = detailRows(lead).map(({ label, value }) => `${label}: ${value}`);
  return [
    "WEZU TECHNOLOGIES — ENQUIRY RECEIVED",
    "",
    "This enquiry has reached the Wezu Technologies team. Everyone involved is on this email, so the sender and our team are working from the same record.",
    "",
    ...lines,
    "",
    "MESSAGE",
    lead.message.trim(),
    "",
    `Wezu Technologies · ${siteUrl}`,
    `Reference: ${lead.id}`,
  ].join("\n");
}

export function leadEmailHtml(lead: LeadMail) {
  const preheader = `${lead.name} sent an enquiry through wezutech.com — the details are inside.`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <!-- The design is dark by construction; without these two, Gmail and
         Outlook invert the palette and the blue glow turns to mud. -->
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${escapeHtml(leadEmailSubject(lead))}</title>
    <style>
      /* Only progressive enhancement lives here — clients that drop the block
         still get the inline styles, which carry the whole layout. */
      body { margin: 0; padding: 0; width: 100% !important; }
      a { text-decoration: none; }
      @media only screen and (max-width: 620px) {
        .frame { width: 100% !important; }
        .pad { padding-left: 22px !important; padding-right: 22px !important; }
        .display { font-size: 34px !important; line-height: 36px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${COLOR.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${COLOR.ink};">
      <tr>
        <td align="center" style="padding:32px 12px 40px;">
          <table role="presentation" class="frame" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

            <!-- Masthead -->
            <tr>
              <td class="pad" style="padding:0 8px 22px;">
                <a href="${siteUrl}" style="text-decoration:none;">
                  <!-- The alt text is styled, not just written: a client with remote
                       images off falls back to it, and unstyled it renders in the
                       client's default near-black — invisible on this background. -->
                  <img src="${siteUrl}/brand/wordmark-lockup.png" width="132" height="68" alt="Wezu Technologies" style="display:block;border:0;width:132px;height:68px;font:400 13px/68px ${BODY_FONT};color:${COLOR.ice};" />
                </a>
              </td>
            </tr>

            <!-- The card. The rule above it stands in for the light the site
                 casts behind this section; a gradient here is a coin flip. -->
            <tr>
              <td style="background-color:${COLOR.sky};background-image:linear-gradient(90deg,${COLOR.sky} 0%,${COLOR.skyBright} 55%,${COLOR.sky} 100%);border-radius:20px 20px 0 0;font-size:0;line-height:0;height:4px;">&nbsp;</td>
            </tr>
            <tr>
              <td class="pad" style="background-color:${COLOR.panel};border:1px solid ${COLOR.hairline};border-top:0;border-radius:0 0 20px 20px;padding:34px 38px 38px;">

                <p style="margin:0 0 10px;font:400 12px/16px ${BODY_FONT};letter-spacing:0.22em;text-transform:uppercase;color:${COLOR.skyBright};">New enquiry</p>
                <h1 class="display" style="margin:0 0 18px;font:400 40px/42px ${DISPLAY_FONT};letter-spacing:0.02em;text-transform:uppercase;color:${COLOR.white};">Enquiry received</h1>
                <p style="margin:0;font:400 16px/26px ${BODY_FONT};color:${COLOR.mist};">This enquiry has reached the Wezu Technologies team through wezutech.com. Everyone involved is copied on this email, so the sender and our team are working from the same record.</p>

                <!-- Details -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-top:26px;border-collapse:collapse;">
                  ${renderDetailRows(lead)}
                </table>

                <!-- The message, in its own well -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-top:26px;border-collapse:separate;">
                  <tr>
                    <td style="background-color:${COLOR.ink};border:1px solid ${COLOR.hairline};border-left:3px solid ${COLOR.sky};border-radius:14px;padding:20px 22px;">
                      <p style="margin:0 0 12px;font:400 12px/16px ${BODY_FONT};letter-spacing:0.16em;text-transform:uppercase;color:${COLOR.muted};">Message</p>
                      ${formatMessage(lead.message)}
                    </td>
                  </tr>
                </table>

                <!-- Bulletproof button: the outer table paints the fill, so a
                     client that strips the anchor's background still shows a
                     button rather than a bare blue word. -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
                  <tr>
                    <td align="center" bgcolor="${COLOR.sky}" style="background-color:${COLOR.sky};border-radius:14px;">
                      <a href="${escapeHtml(lead.productSlug ? `${siteUrl}/products/${lead.productSlug}` : `${siteUrl}/#products`)}" style="display:inline-block;padding:12px 24px;font:400 17px/24px ${BODY_FONT};color:${COLOR.white};text-decoration:none;border-radius:14px;">${lead.productName ? "View the product" : "Explore our products"}</a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="pad" style="padding:24px 8px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
                  <tr>
                    <td style="font:400 13px/22px ${BODY_FONT};color:${COLOR.muted};">
                      <a href="mailto:${CONTACT.email}" style="color:${COLOR.muted};text-decoration:none;">${CONTACT.email}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${CONTACT.phoneHref}" style="color:${COLOR.muted};text-decoration:none;">${CONTACT.phone}</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${siteUrl}" style="color:${COLOR.muted};text-decoration:none;">wezutech.com</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:10px;font:400 12px/18px ${BODY_FONT};color:${COLOR.muted};">
                      Wezu Technologies — engineering the next movement.<br />
                      Reference ${escapeHtml(lead.id)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
