import type { CampaignBanner, Event, Flyer, Img, Page, Post, SiteSettings, Video } from "../types";
import { h3, li, p } from "../pt";
export { stores } from "./stores";

const img = (src: string, alt: string, width: number, height: number): Img => ({ src, alt, width, height });

/* ------------------------------------------------------------------ */
/* Imagery, every photo below is Fruiticana's own, from the live site */
/* ------------------------------------------------------------------ */
export const photos = {
  firstStore: img("/images/photos/first-store-1994.jpg", "The first Fruiticana store in Surrey, BC, with a “Now Open, Fresh Fruit & Vegetables” banner, 1994", 989, 660),
  flagship: img("/images/photos/flagship-scott-road.jpg", "Fruiticana’s flagship store on Scott Road in Surrey on its opening day", 990, 511),
  produceFloor: img("/images/photos/store-produce-floor.jpg", "Overhead view of a busy Fruiticana produce floor stocked with fresh fruits and vegetables", 800, 534),
  spiceAisle: img("/images/photos/indican-spice-aisle.jpg", "A wall of Indican spice packets on a Fruiticana aisle", 990, 556),
  rajanMangoes: img("/images/photos/rajan-mangoes.jpg", "Boxes of ripe Rajan mangoes, exclusive to Fruiticana", 495, 660),
  mangoCurry: img("/images/photos/mango-curry.jpg", "A brass pot of mango kadhi garnished with curry leaves and chili", 990, 660),
  mangoLassi: img("/images/photos/mango-lassi.jpg", "A glass of mango lassi with fresh-cut mango, yogurt and honey", 990, 660),
  president: img("/images/photos/tony-singh.jpg", "Tony Singh, President and CEO of Fruiticana", 131, 130),
  miracleWeekend: img("/images/photos/bcch-miracle-weekend-2016.jpg", "Nikhita Singh presenting Fruiticana’s donation cheque on the BC Children’s Hospital Miracle Weekend broadcast", 990, 469),
  anesthesiaMonitor: img("/images/photos/anesthesia-monitor.png", "Anesthesia monitor for BC Children’s Hospital", 311, 350),
  refugees: img("/images/photos/welcoming-refugees.jpg", "Fruiticana welcoming refugee families", 325, 150),
  trucks: img("/images/banners/page-commitmenttoquality.jpg", "The Fruiticana delivery fleet beside fresh oranges and berries", 1800, 600),
  checkout: img("/images/banners/page-employment.jpg", "Fruiticana team members serving customers at the checkout", 1800, 600),
  firstAndNow: img("/images/banners/page-company.jpg", "Fruiticana’s first store in 1994 beside today’s Surrey head office", 1800, 600),
};

/* ------------------------------------------------------------------ */
export const settings: SiteSettings = {
  name: "Fruiticana",
  tagline: "Fruiticana Hee Jaana!",
  founded: 1994,
  phone: "604-502-0005",
  email: "info@fruiticana.com",
  jobsEmail: "jobs@fruiticana.com",
  headOffice: { street: "7676 Anvil Way", locality: "Surrey", province: "BC", postalCode: "V3W 4H7" },
  mission:
    "We are committed to bringing the taste of home to our customers by sourcing the best products locally and from around the world, while delivering an outstanding customer experience.",
  companySummary:
    "We offer our customers quality fresh fruits, vegetables and spices, at the best price. Founded in 1994 with a single store, it is now one of the largest grocery retailers in Western Canada with 25 locations in BC and Alberta.",
  presidentQuote:
    "We take pride in what we put in our stores and ensuring our customers receive the very best. We go to great lengths to find the highest quality product and give you the best price.",
  presidentName: "Tony Singh",
  presidentTitle: "President & CEO",
  warehouseSqFt: 150000,
  socials: [
    { label: "Instagram", href: "https://instagram.com/fruiticanaheejaana" },
    { label: "Facebook", href: "https://www.facebook.com/Fruiticana/" },
    { label: "X / Twitter", href: "https://twitter.com/fruiticana" },
    { label: "YouTube", href: "https://www.youtube.com/@fruiticanachannel" },
  ],
};

/* ------------------------------------------------------------------ */
export const flyers: Flyer[] = [
  { region: "greater-vancouver", label: "Greater Vancouver", image: img("/images/flyers/greater-vancouver.jpg", "Fruiticana weekly specials flyer for Greater Vancouver & BC", 1230, 1594) },
  { region: "calgary", label: "Calgary", image: img("/images/flyers/calgary.jpg", "Fruiticana weekly specials flyer for Calgary", 1230, 1710) },
  { region: "chestermere", label: "Chestermere", image: img("/images/flyers/chestermere.jpg", "Fruiticana weekly specials flyer for Chestermere", 1230, 1710) },
  { region: "edmonton", label: "Edmonton", image: img("/images/flyers/edmonton.jpg", "Fruiticana weekly specials flyer for Edmonton", 1230, 1710) },
];

/* The rotating banners from the legacy homepage, kept as a campaign rail. */
export const campaigns: CampaignBanner[] = [
  { id: "indican", label: "Indican, available exclusively at Fruiticana", href: "/indican", image: img("/images/banners/indican.jpg", "Indican, available exclusively at Fruiticana: Mango juice, Kheer rice and brown cane sugar", 1800, 517) },
  { id: "weekly", label: "Weekly Specials", href: "/flyers", image: img("/images/banners/weekly-specials.jpg", "Fruiticana Weekly Specials", 1800, 600) },
  { id: "quality", label: "Highest quality at lowest prices", href: "/commitment-to-quality", image: img("/images/banners/quality-lowest-prices.jpg", "Highest quality at lowest prices: apples, pomegranate, oranges, grapes and berries", 1800, 517) },
  { id: "farm", label: "Farm to Table", href: "/farm-to-table", image: img("/images/banners/farm-to-table.jpg", "Fruiticana Hee Jaana: Farm to Table", 1800, 517) },
  { id: "spices", label: "India SaY organic spices", href: "/flyers", image: img("/images/banners/spices.png", "India SaY organic spices, in store at Fruiticana", 1800, 517) },
  { id: "lentils", label: "India SaY organic lentils", href: "/flyers", image: img("/images/banners/lentils.png", "India SaY organic lentils and dals, in store at Fruiticana", 1800, 517) },
  { id: "locations", label: "Find a location", href: "/storefinder", image: img("/images/banners/locations.jpg", "Fruiticana locations across BC and Alberta", 1800, 517) },
  { id: "company", label: "Our company", href: "/our-company", image: img("/images/banners/our-company.jpg", "Fruiticana offers its customers the highest quality of fresh fruits, vegetables and spices, at the best price", 1800, 517) },
];

export const videos: Video[] = [
  {
    youtubeId: "_DLaXnY2sGY",
    title: "Fruiticana Hee Jaana | Diljit Dosanjh",
    caption: "@diljitdosanjh says, Fruiticana samjda aye sannu te sadiya addata nu, ese krke ta sadde ghar da store aye. Fruiticana Hee Jaana!",
    poster: img("/images/campaign/yt-_DLaXnY2sGY.jpg", "Diljit Dosanjh holding a Fruiticana bag", 990, 411),
  },
  {
    youtubeId: "oQ5fHG3SdMU",
    title: "Fresh Hai Na: Kehnda Ae Zamaana Fruiticana Hee Jaana",
    caption: "Diljit Dosanjh",
    poster: img("/images/campaign/yt-oQ5fHG3SdMU.jpg", "Diljit Dosanjh in a Fruiticana apron in the produce section", 480, 360),
  },
  {
    youtubeId: "lhDf7fSrhyw",
    title: "Kehnda Ae Zamaana Fruiticana Hee Jaana",
    caption: "Diljit Dosanjh",
    poster: img("/images/campaign/yt-lhDf7fSrhyw.jpg", "Diljit Dosanjh at a Fruiticana checkout", 1280, 720),
  },
];

/* Global News segment about Tony Singh offering free groceries to Syrian refugees (Jan 2016). */
export const newsClip = {
  title: "Surrey businessman offers free groceries to refugees",
  source: "Global News",
  duration: "2:22",
  embedUrl: "https://globalnews.ca/video/embed/2470244/",
  pageUrl: "https://globalnews.ca/video/2470244/surrey-businessman-offers-free-groceries-to-refugees/",
  // Set to a licensed MP4 (e.g. uploaded to Sanity) to play it muted on a loop.
  loopSrc: undefined as string | undefined,
  poster: "/images/photos/welcoming-refugees.jpg",
};

/* YouTube refuses embeds for this id, link out instead of showing a broken player. */
export const nonEmbeddableVideos = new Set(["_DLaXnY2sGY"]);

/* ------------------------------------------------------------------ */
export const posts: Post[] = [
  {
    slug: "bc-children-s-hospital-campaign",
    title: "BC Children’s Hospital Campaign",
    date: "2017-03-01",
    category: "Philanthropic Initiatives",
    excerpt: "Fruiticana begins campaign to purchase much-needed equipment for BC Children’s Hospital.",
    image: photos.anesthesiaMonitor,
    body: [
      h3("Fruiticana begins campaign to purchase much-needed equipment for BC Children’s Hospital"),
      p("During the month of March, all Fruiticana locations in BC will be collecting donations to help BC Children’s Hospital purchase a much-needed Anesthesia Monitor. Anesthesia monitors, which are attached to anesthesia machines, help to control and manage the delivery of drugs and ventilation to ensure a patient breathes properly."),
      p("“For our campaign this year, we wanted to help BC Children’s Hospital address a specific need”, says ", { text: "Tony Singh", marks: ["strong"] }, ", President and CEO of Fruiticana. “So, when the Hospital Foundation approached us and I learned how this Anesthesia Monitor will help such young children, we were fully committed.”"),
      p("“We are profoundly grateful for Fruiticana’s commitment to the health of children across BC,” says ", { text: "Teri Nicholas", marks: ["strong"] }, ", President and CEO of BC Children’s Hospital Foundation. “By displaying vital information during surgery, the new Anesthesia monitor will ensure we continue to deliver the best possible care.”"),
      p("The new Anesthesia Monitor will enhance patient safety during surgeries at BC Children’s Hospital, as children’s vital signs will be better monitored and managed. Furthermore, the new monitors will result in fewer complications and better surgical outcomes for children as surgical teams can respond more quickly to any change in the child’s condition."),
      p("BC Children’s Hospital sees over 86,000 patients of which over 12,000 are from the Surrey and Abbotsford areas. Also, over 9,000 surgeries were performed on children with potentially life-threatening illnesses or injuries."),
      p("The goal for this month’s campaign is to raise $50,000 for the new Anesthesia Monitor. Anyone visiting a Fruiticana location this month can donate to this very important cause. Last year, Fruiticana customers and staff raised over $40,000 for BC Children’s Hospital."),
    ],
  },
  {
    slug: "fruiticana-staff-and-customers-raise-over-40-000-for-bc-children-s-hospital",
    title: "Fruiticana staff and customers raise over $40,000 for BC Children’s Hospital",
    date: "2016-06-05",
    category: "Philanthropic Initiatives",
    excerpt: "During the month of May, Fruiticana staff and customers participated in a fundraising campaign for the BC Children’s Hospital Foundation Miracle Weekend.",
    image: photos.miracleWeekend,
    body: [
      p("Fruiticana is an active member of the local community, committed to being a goodwill partner. In the month of May, Fruiticana staff and customers raised over $40,000 as part of Miracle Weekend, benefiting BC Children’s Hospital."),
      p("Nikhita Singh, daughter of Fruiticana President Tony Singh, delivered the donation on behalf of staff and customers to the BC Children’s Hospital Foundation on the Miracle Weekend broadcast on Global BC."),
      p("We sincerely thank everyone for their generous donations and for helping BC kids."),
    ],
  },
];

export const events: Event[] = [];

/* ------------------------------------------------------------------ */
/* Long-form pages, copy carried over verbatim from the legacy site   */
/* ------------------------------------------------------------------ */
export const pages: Record<string, Page> = {
  "our-company": {
    slug: "our-company",
    title: "Our Story",
    eyebrow: "Our Company",
    intro: "Fruiticana has become a household name in the South Asian community, where customers have come to expect fresh fruits, vegetables, and spices of the highest quality at the best price.",
    heroImage: photos.firstAndNow,
    seoTitle: "Fruiticana Fresh Produce | South Asian Community",
    seoDescription: "Since 1994 Fruiticana has brought the South Asian community the freshest fruits, vegetables and spices at the best price. Now 25 stores in BC and Alberta.",
    body: [
      p("The grocery chain has come a long way since its humble beginnings. In the early 1990s, as the South Asian Community in the Lower Mainland continued to grow, families struggled with a limited selection of produce and cultural grocery items. Unique items such as okra, guava and sugarcane were incredibly difficult to find."),
      p("In 1994 the first Fruiticana store opened in Surrey B.C., to fill this gap. By combining fresh locally grown fruits and vegetables with culturally specific produce and grocery items, a recipe for success had been created. People from across the Lower Mainland began shopping at Fruiticana knowing they could find fresh produce alongside unique items that connected them to the flavors of India."),
      p("Within six months of opening the first store, Fruiticana expanded by opening a second location in Richmond. As demand from the community grew, so did Fruiticana. In 1996, Fruiticana expanded into other parts of Greater Vancouver, opening stores in Burnaby, Port Coquitlam, as well as a second location in Surrey. In 1997, Fruiticana opened its flagship store on Scott Road in Surrey."),
      p("Today, Fruiticana is one of Western Canada’s largest grocery chains with 25 locations across BC and Alberta. Products are distributed from a 150,000 sq. ft warehouse facility in Surrey B.C."),
    ],
  },
  "commitment-to-quality": {
    slug: "commitment-to-quality",
    title: "Commitment to Quality",
    eyebrow: "Our Company",
    intro: "Fruiticana is committed to ensuring the highest quality of the products carried in each store.",
    heroImage: photos.trucks,
    seoTitle: "Commitment to Quality | Fruiticana",
    seoDescription: "Fruiticana deals directly with growers, packers and manufacturers, and runs its own packing facilities in India, so only the freshest products reach you.",
    body: [
      p("As such, in 1997, Fruiticana established the Indican brand, delivering premium quality spices, lentils, and juices from India."),
      p("Regardless of where the product is sourced, we attempt to deal directly with growers, packers and manufacturers. We have taken a number of steps to ensure that only the freshest and pure quality products are available to our customers. For example, Fruiticana has established its own procuring and packing facilities in India."),
    ],
  },
  "farm-to-table": {
    slug: "farm-to-table",
    title: "Farm to Table",
    eyebrow: "Our Company",
    intro: "Fruiticana is committed to providing fresh produce daily in all of its stores.",
    heroImage: img("/images/banners/page-farmtotable.jpg", "A crate of fresh fruit moving from farm field to kitchen table", 1800, 600),
    seoTitle: "Farm to Table: Fresh Local Produce Daily | Fruiticana",
    seoDescription: "Fruiticana supports local farms: fruits and vegetables picked are delivered into every Fruiticana location within 12-24 hours.",
    body: [
      p("Fruiticana is a large supporter of local farms, carrying fresh seasonal produce on a daily basis. Fruits and vegetables picked at these farms are delivered into all Fruiticana locations within 12-24 hours, for you to enjoy at your kitchen table."),
      p("Furthermore, any produce coming from any farm outside Canada is delivered as quickly as possible to its stores."),
    ],
  },
  employment: {
    slug: "employment",
    title: "Careers at Fruiticana",
    eyebrow: "Employment",
    intro: "Fruiticana is more than just a retailer of fruits, vegetables and spices. It is a place where people connect with “home”.",
    heroImage: photos.checkout,
    seoTitle: "Careers & Employment | Fruiticana",
    seoDescription: "Join the Fruiticana team. We are always seeking positive, energetic people passionate about serving customers across our BC and Alberta stores.",
    body: [
      p("We are always seeking individuals passionate in serving customers. If you are a positive and energetic person who enjoys working in a fast-paced environment with a focus on meeting a customer’s needs, email us at ", { text: "jobs@fruiticana.com", href: "mailto:jobs@fruiticana.com" }, "."),
    ],
  },
  indican: {
    slug: "indican",
    title: "Indican",
    eyebrow: "Our own brand · Since 1997",
    intro: "Indican brings to you the best ingredients from around the world right to your kitchen.",
    heroImage: img("/images/banners/page-indican.jpg", "Indican, available exclusively at Fruiticana", 1800, 600),
    seoTitle: "Indican Spices | Fruiticana",
    seoDescription: "Indican is Fruiticana’s own brand of aromatic, all-natural spices, lentils and juices, handpicked by our experts and available exclusively at Fruiticana.",
    body: [
      p("With a wide variety of authentic regional grocery and spice products, we strive to reconnect people with their familiar flavours. Indican products capture the rich heritage of authentic Indian cuisines and translate them into a mouth-watering household experience."),
      p("The culinary diversity of various regions and cuisines is tied together by a common thread; no meal would be complete without the intense flavor of aromatic, all-natural and exotic Indican spices which are handpicked by our experts."),
      p("High quality, delicious tasting, healthy ingredients are packed in a sustainable and nature-respecting environment. We take great pride in ensuring our products reach you in perfect condition. Relish each flavour from the complete range available, and let the fine side of your taste settle on nothing less."),
      p("Indican focuses on customer needs and serves them with quality products at affordable prices. The products are scientifically tested and hygienically wrapped in safe and attractive packaging that is pure and conforms to international standards."),
      p("We are committed to sourcing new and adventurous products that are available and reflective of changing market trends. These diverse food products are perfectly in line with contemporary lifestyles, while retaining the traditional taste and values which are so close to our hearts."),
    ],
  },
  mangoes: {
    slug: "mangoes",
    title: "Fruiticana’s Signature Mangoes",
    eyebrow: "In season · March through summer",
    intro: "Fruiticana’s Signature Mangoes have arrived in stores and are available for you and your family to enjoy.",
    heroImage: photos.rajanMangoes,
    seoTitle: "Rajan Mangoes, Exclusively at Fruiticana",
    seoDescription: "Rajan mangoes are carried exclusively at Fruiticana. Harvested in Mexico on farms built to Fruiticana’s standard, plus five health benefits of eating mangoes.",
    body: [
      p("Rajan mangoes are exclusively carried in Fruiticana stores. These mangoes are harvested in Mexico on farms specifically designed to meet Fruiticana’s standard for quality and care. Every detail, from farming to processing, is designed to meet Canadian standards. It is with this commitment and care that Rajan mangoes have become a signature seasonal item for our customers."),
      p("Mango season begins in March and carries through the summer. There is no better fruit to enjoy during the spring and summer than a fresh juicy mango. Most importantly, mangoes carry incredible benefits that can improve your overall health."),
    ],
  },
  "forced-and-child-labour-report-2024-25": {
    slug: "forced-and-child-labour-report-2024-25",
    title: "Forced and Child Labour Report 2024-25",
    eyebrow: "In The Community",
    intro: "Report of Fiscal Year 2024-25 under the Fighting Against Forced Labour and Child Labour in Supply Chains Act, for Fruiticana Produce Ltd.",
    seoTitle: "Forced and Child Labour Report 2024-25 | Fruiticana",
    seoDescription: "Fruiticana Produce Ltd.’s report for fiscal year 2024-25 under Canada’s Fighting Against Forced Labour and Child Labour in Supply Chains Act.",
    body: [p("Please read the full report below.")],
  },
  blog: {
    slug: "blog",
    title: "In The Community",
    eyebrow: "In The Community",
    intro: "Fruiticana is an active member of the local community, committed to being a goodwill partner.",
    seoTitle: "In The Community | Fruiticana",
    seoDescription: "Philanthropic initiatives, community events and contests. Stay up to date with the latest community initiatives from Fruiticana.",
    body: [
      p("Whether it is through philanthropic initiatives, sponsoring community events, or running amazing contests, Fruiticana aims to be more than just your neighbourhood supermarket. Stay up to date here with the latest community initiatives from Fruiticana."),
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact Us",
    eyebrow: "Say hello",
    intro: "We are always interested in hearing from our customers.",
    seoTitle: "Fruiticana Contact Information",
    seoDescription: "Contact Fruiticana head office at 7676 Anvil Way, Surrey, BC. Call 604-502-0005, email info@fruiticana.com or send us a message.",
    body: [
      p("Feel free to contact us by reaching out to our head office. Or simply fill out the form on this page to leave any comments, questions or suggestions. We will be happy to get back to you."),
    ],
  },
};

/** The five benefits, kept structured so the mangoes page can lay them out as cards. */
export const mangoBenefits = [
  { title: "Potassium", stat: "156mg", unit: "per 100g", body: "Potassium in a diet allows organs, tissues and cells to function optimally and helps to control heart rate and blood pressure. Potassium becomes more important as the body ages." },
  { title: "Antioxidants", stat: "Packed", unit: "in every serving", body: "Antioxidants are natural substances found in food that may help lower risks of chronic diseases, like cancer and cardiovascular disease. Luckily there are a number of antioxidants packed in each serving of a mango." },
  { title: "Vitamin A", stat: "~25%", unit: "daily intake", body: "Vitamin A is important for bone growth, vision and reproduction. Poor vitamin A intake can also lead to decreased ability to fight infections. One mango serving contains nearly 25% of the daily required intake." },
  { title: "Vitamin C", stat: "75%", unit: "daily intake", body: "Vitamin C helps lower the risk of chronic diseases, and is needed for growth and development and to make collagen, a protein found in skin, tendons and ligaments. One serving can give you up to 75% of the daily suggested intake." },
  { title: "Fiber", stat: "12%", unit: "daily intake", body: "Mangoes are a great source of fiber which helps foster proper digestion. A high fiber diet can also lower the risk of developing heart disease, diverticular disease and Type 2 diabetes." },
];

export const mangoOutro = [
  li("They taste delicious alone, on a salad, in a smoothie or as a salsa."),
  li("So next time you make that mango chutney or mango lassi, feel good about it, because you will be enjoying one of the tastiest and most nutritious fruits on the planet!"),
];

/** Milestones drawn from “Our Story”. */
export const milestones = [
  { year: "1994", title: "The first store", body: "Fruiticana opens in Surrey, BC. Finally, okra, guava and sugarcane beside fresh local produce.", image: photos.firstStore },
  { year: "1994", title: "Richmond, six months later", body: "Demand from across the Lower Mainland brings a second location in Richmond within six months." },
  { year: "1996", title: "Across Greater Vancouver", body: "New stores in Burnaby, Port Coquitlam and a second Surrey location." },
  { year: "1997", title: "Flagship on Scott Road · Indican", body: "The flagship store opens on Scott Road in Surrey, and Fruiticana establishes its own Indican brand.", image: photos.flagship },
  { year: "Today", title: "25 stores, BC & Alberta", body: "One of Western Canada’s largest grocery chains, supplied from a 150,000 sq. ft warehouse in Surrey." },
];
