// One entry per bubble. `slug` MUST match the slug used in ProjectBubbles.jsx
// so router.push(`/projects/${project.slug}`) lands on the right page.

export const PROJECTS = [
  {
    id: 1,
    slug: "cilicosys",
    title: "Cilicosys",
    badge: "SOFTWARE DEVELOPMENT",
    tagline: "Enterprise workflow automation, simplified.",
    description:
      "Built a scalable business platform focused on automation and efficiency.",
    heroImage: "/projects/cilicosys-hero.png",
    about:
      "Cilicosys was developed to streamline internal operations, replacing manual processes with an automated, easy-to-use system that scales with the business.",
    features: [
      { title: "Workflow Automation", text: "Automated repetitive tasks to save hours every week." },
      { title: "Role-based Access", text: "Granular permissions for teams of any size." },
      { title: "Real-time Dashboards", text: "Live visibility into key operational metrics." },
    ],
  },
  {
    id: 2,
    slug: "magichands-physiotherapy",
    title: "Magichands Physiotherapy",
    badge: "WEB DEVELOPMENT",
    tagline: "Booking and care, made effortless.",
    description:
      "A responsive booking platform for a physiotherapy clinic, focused on ease of scheduling.",
    heroImage: "/projects/magichands-hero.png",
    about:
      "Magichands needed an online presence that let patients book appointments and learn about treatments without calling in. We built a clean, mobile-first site around that.",
    features: [
      { title: "Online Booking", text: "Patients pick a slot and confirm in seconds." },
      { title: "Treatment Catalog", text: "Clear breakdown of services offered." },
      { title: "Reminders", text: "Automated appointment reminders reduce no-shows." },
    ],
  },
  {
    id: 3,
    slug: "inayit",
    title: "Inayit",
    badge: "SOFTWARE DEVELOPMENT",
    tagline: "Care coordination in one place.",
    description: "A platform connecting caregivers and families for coordinated care.",
    heroImage: "/projects/inayit-hero.png",
    about:
      "Inayit centralizes care schedules, notes, and communication between caregivers and families, replacing scattered calls and messages.",
    features: [
      { title: "Shared Care Calendar", text: "Everyone sees the same up-to-date schedule." },
      { title: "Secure Messaging", text: "In-app chat keeps sensitive info off SMS." },
      { title: "Care Notes", text: "Log and track care history over time." },
    ],
  },
  {
    id: 4,
    slug: "epyrocxx",
    title: "Epyrocxx",
    badge: "WEB DEVELOPMENT",
    tagline: "A bold digital presence.",
    description: "A modern marketing site built for speed and conversion.",
    heroImage: "/projects/epyrocxx-hero.png",
    about:
      "Epyrocxx needed a fast, distinctive site to support its go-to-market push. We prioritized load speed and a clear conversion path.",
    features: [
      { title: "Performance-first", text: "Optimized assets for sub-second loads." },
      { title: "Conversion Funnels", text: "Clear CTAs guide visitors to signup." },
      { title: "SEO Ready", text: "Structured for search visibility from day one." },
    ],
  },
  {
    id: 5,
    slug: "cartlane",
    title: "Cartlane",
    badge: "E-COMMERCE",
    tagline: "Shopping, streamlined.",
    description: "A full-featured e-commerce storefront with secure checkout.",
    heroImage: "/projects/cartlane-hero.png",
    about:
      "Cartlane is a storefront built for scale — catalog browsing, cart, and checkout designed to convert on both desktop and mobile.",
    features: [
      { title: "Product Catalog", text: "Fast filtering and search across categories." },
      { title: "Secure Checkout", text: "Integrated trusted payment gateways." },
      { title: "Order Tracking", text: "Customers track orders in real time." },
    ],
  },
  {
    id: 6,
    slug: "3d-tailor-space",
    title: "3D Tailor Space",
    badge: "WEB APPLICATION",
    tagline: "Custom tailoring, visualized in 3D.",
    description: "An interactive 3D configurator for custom garment design.",
    heroImage: "/projects/3d-tailor-space-hero.png",
    about:
      "3D Tailor Space lets customers customize garments and preview them in an interactive 3D view before ordering — reducing returns and boosting confidence.",
    features: [
      { title: "3D Configurator", text: "Live preview as customers adjust options." },
      { title: "Measurement Profiles", text: "Save custom fits for repeat orders." },
      { title: "Instant Quoting", text: "Price updates live as options change." },
    ],
  },
  {
    id: 7,
    slug: "sandtglobal",
    title: "SandTGlobal",
    badge: "WEB DEVELOPMENT",
    tagline: "Global reach, local trust.",
    description: "A corporate site built to establish credibility across markets.",
    heroImage: "/projects/sandtglobal-hero.png",
    about:
      "SandTGlobal needed a professional, multi-region-ready site to support international business development.",
    features: [
      { title: "Multi-region Content", text: "Structured for localized rollout." },
      { title: "Lead Capture", text: "Forms routed directly to the sales team." },
      { title: "Case Studies", text: "Showcase of past work builds trust fast." },
    ],
  },
  {
    id: 8,
    slug: "collins",
    title: "Collins",
    badge: "WEB DEVELOPMENT",
    tagline: "A refined digital storefront.",
    description: "A polished brand site with a focus on visual storytelling.",
    heroImage: "/projects/collins-hero.png",
    about:
      "Collins wanted a site that felt as premium as the brand itself. We built a visually-led experience with careful typography and pacing.",
    features: [
      { title: "Custom Design System", text: "Consistent, premium visual language." },
      { title: "Fast Page Loads", text: "Optimized imagery without sacrificing quality." },
      { title: "CMS-driven", text: "Marketing can update content without a developer." },
    ],
  },
  {
    id: 9,
    slug: "dentalbay",
    title: "DentalBay",
    badge: "HEALTHCARE",
    tagline: "Dental care, one click away.",
    description: "A responsive appointment platform for a dental practice.",
    heroImage: "/projects/dentalbay-hero.png",
    about:
      "DentalBay brings appointment booking, service info, and patient communication into one clean, accessible platform.",
    features: [
      { title: "Online Booking", text: "Book appointments in under a minute." },
      { title: "Service Directory", text: "Clear breakdown of treatments offered." },
      { title: "Patient Reminders", text: "Automated reminders reduce missed visits." },
    ],
  },
  {
    id: 10,
    slug: "amal-al-sham",
    title: "DentalBay",
    badge: "HEALTHCARE",
    tagline: "Dental care, one click away.",
    description: "A responsive appointment platform for a dental practice.",
    heroImage: "/projects/dentalbay-hero.png",
    about:
      "DentalBay brings appointment booking, service info, and patient communication into one clean, accessible platform.",
    features: [
      { title: "Online Booking", text: "Book appointments in under a minute." },
      { title: "Service Directory", text: "Clear breakdown of treatments offered." },
      { title: "Patient Reminders", text: "Automated reminders reduce missed visits." },
    ],
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}
