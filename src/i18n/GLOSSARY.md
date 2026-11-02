# Punjabi (ਪੰਜਾਬੀ) translation glossary

The rules every Punjabi string on the site follows. Use them when you add or edit Punjabi text in the dictionaries (`src/i18n/dictionaries/pa.ts`), the bundled content (`src/lib/content/seed/pa.ts`) or the Punjabi tab in Sanity.

Script: Gurmukhi only, written in standard modern Punjabi as used by Punjabi media in Canada. Plain, warm and conversational, the way a family grocer talks to customers. Use ਤੁਸੀਂ/ਤੁਹਾਡਾ (respectful), never ਤੂੰ.

## What stays in English (Latin script)

| Kept as is | Why |
|---|---|
| Brand names: Fruiticana, Indican, Rajan, India SaY, Global News | Trademarks, exactly as on packaging and signage |
| The logo and its tagline | Brand artwork, never translated |
| Store names (Cedar Hills, Newton (72nd Ave), …), street addresses, postal codes | Must match signage, maps and GPS search |
| Phone numbers, emails, web addresses, social handles (@diljitdosanjh) | They have to work when typed |
| Contact form topic values sent to staff | Staff read submissions in English; the visitor sees Punjabi labels, and each submission is tagged "language: Punjabi" |
| Official legal titles (Fighting Against Forced Labour and Child Labour in Supply Chains Act) | Legal name; given in brackets after the Punjabi description |
| Quoted English text in photos (the "Now Open, Fresh Fruit & Vegetables" banner) | It is what the photo shows |

## People and places in running text: Gurmukhi

ਸਰੀ (Surrey), ਬੀ.ਸੀ. (BC), ਅਲਬਰਟਾ (Alberta), ਕੈਲਗਰੀ (Calgary), ਐਡਮਿੰਟਨ (Edmonton), ਚੈਸਟਰਮੀਅਰ (Chestermere), ਗ੍ਰੇਟਰ ਵੈਨਕੂਵਰ (Greater Vancouver), ਲੋਅਰ ਮੇਨਲੈਂਡ (Lower Mainland), ਕੈਨੇਡਾ, ਭਾਰਤ, ਪੰਜਾਬ.
ਟੋਨੀ ਸਿੰਘ (Tony Singh), ਦਿਲਜੀਤ ਦੋਸਾਂਝ (Diljit Dosanjh), ਨਿਖਿਤਾ ਸਿੰਘ (Nikhita Singh).

## Fixed terms

| English | Punjabi |
|---|---|
| Weekly Specials | ਹਫ਼ਤਾਵਾਰੀ ਸਪੈਸ਼ਲ |
| this week's specials | ਇਸ ਹਫ਼ਤੇ ਦੇ ਸਪੈਸ਼ਲ |
| flyer | ਫਲਾਇਰ |
| store / stores | ਸਟੋਰ / ਸਟੋਰਾਂ |
| Store Locator / Find a store | ਸਟੋਰ ਲੱਭੋ |
| Head Office | ਮੁੱਖ ਦਫ਼ਤਰ |
| grocery | ਗਰੋਸਰੀ |
| fresh fruits and vegetables | ਤਾਜ਼ੇ ਫਲ ਅਤੇ ਸਬਜ਼ੀਆਂ (short form: ਤਾਜ਼ੇ ਫਲ-ਸਬਜ਼ੀਆਂ) |
| spices | ਮਸਾਲੇ |
| quality | ਗੁਣਵੱਤਾ |
| Our Company | ਸਾਡੀ ਕੰਪਨੀ |
| Our Story | ਸਾਡੀ ਕਹਾਣੀ |
| Commitment to Quality | ਗੁਣਵੱਤਾ ਪ੍ਰਤੀ ਵਚਨਬੱਧਤਾ |
| Farm to Table | ਖੇਤ ਤੋਂ ਮੇਜ਼ ਤੱਕ |
| Employment / Careers | ਨੌਕਰੀਆਂ |
| Community | ਭਾਈਚਾਰਾ (In the community: ਭਾਈਚਾਰੇ ਵਿੱਚ) |
| Community stories | ਭਾਈਚਾਰਕ ਕਹਾਣੀਆਂ |
| Events | ਸਮਾਗਮ |
| Mangoes | ਅੰਬ |
| Contact | ਸੰਪਰਕ |
| Home (page) | ਮੁੱਖ ਪੰਨਾ |
| email | ਈਮੇਲ |
| Fruiticana Hee Jaana! | Fruiticana ਹੀ ਜਾਣਾ! |

## Numbers, dates and time

- Digits stay Western (0-9), as Punjabi speakers in Canada read prices, phone numbers and addresses. Large round numbers use ਲੱਖ where space is tight (150,000 → 1.5 ਲੱਖ).
- Dates use `Intl` with `pa-IN` (Punjabi month names, Western digits), see `src/i18n/format.ts`.
- Times say the part of the day instead of AM/PM, with ਵਜੇ: ਸਵੇਰੇ 9 ਵਜੇ (9 AM), ਦੁਪਹਿਰ 1 ਵਜੇ, ਸ਼ਾਮ 5 ਵਜੇ, ਰਾਤ 9 ਵਜੇ. Ranges: "ਸਵੇਰੇ 9 ਵਜੇ ਤੋਂ ਰਾਤ 9 ਵਜੇ ਤੱਕ". See `src/lib/hours.ts`.

## Punctuation and typography

- End sentences with the danda ।. Commas, colons, question marks and quotation marks “ ” are the same as English.
- No em dash or en dash anywhere (site-wide rule). Use a comma, colon or hyphen.
- Never italicise Gurmukhi and never add letter-spacing to it: both break the headline (ਸ਼ਿਰੋਰੇਖਾ) line. The CSS already handles this for Punjabi pages.
- Nukta letters are written properly: ਸ਼ ਖ਼ ਗ਼ ਜ਼ ਫ਼ ਲ਼ (ਹਫ਼ਤਾ, ਤਾਜ਼ਾ, ਦਫ਼ਤਰ, ਖ਼ਾਸ).

## Checks

- `node scripts/qa-i18n.mjs`: loads every /pa page and lists any English left over (allowed words above are skipped).
- `npm run i18n:review`: writes `docs/punjabi-review.csv`, every English line next to its Punjabi line, for native-speaker sign-off.
- `npm run og:pa`: redraws the Punjabi share images after a build.
