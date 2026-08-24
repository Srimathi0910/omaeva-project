// One entry per bubble. `slug` MUST match the slug used in ProjectBubbles.jsx
// so router.push(`/projects/${project.slug}`) lands on the right page.
//
// `image`     -> small thumbnail used in the 3D bubble texture atlas (ProjectBubbles.jsx)
// `heroImage` -> large hero banner used on the project detail page (page.jsx)
//
// NOTE: heroImage now points to the same file as `image` for every project,
// since the separate "-hero.png" files don't exist in /public/projects yet.
// Once you have dedicated hero banners, just update heroImage per project.

import {
  Workflow,
  Lock,
  BarChart3,
  Calendar,
  ClipboardList,
  Bell,
  CalendarCheck,
  MessageSquare,
  FileText,
  Zap,
  TrendingUp,
  Search,
  ShieldCheck,
  Truck,
  Box,
  Ruler,
  Calculator,
  Globe,
  Inbox,
  Palette,
  Settings,
  ShoppingBag,
  MapPin,
} from "lucide-react";

export const PROJECTS = [
  {
    id: 1,
    slug: "cilicosys",
    title: "Cilicosys",
    category: "Software Development",
    badge: "SOFTWARE DEVELOPMENT",
    tagline: "Enterprise workflow automation, simplified.",
    description:
      "Built a scalable business platform focused on automation and efficiency.",
    image: "/projects/cilicosys.png",
    heroImage: "/projects/cilicosys.png",
    liveUrl: "https://www.cilicosys.com/",
    about:
      "Cilicosys was developed to streamline internal operations, replacing manual processes with an automated, easy-to-use system that scales with the business. Before Cilicosys, teams relied on spreadsheets and email chains to move work forward, which made it hard to see where things stood or hold anyone accountable. We designed a central platform where every task, approval, and handoff is tracked automatically, so managers get real-time visibility without chasing status updates. The result is a system that grows with the organization, cutting down on repetitive admin work while giving leadership the data they need to make faster decisions.",
    features: [
      {
        title: "Workflow Automation",
        text: "Automated repetitive tasks to save hours every week.",
        icon: Workflow,
      },
      {
        title: "Role-based Access",
        text: "Granular permissions for teams of any size.",
        icon: Lock,
      },
      {
        title: "Real-time Dashboards",
        text: "Live visibility into key operational metrics.",
        icon: BarChart3,
      },
    ],
  },
  {
    id: 2,
    slug: "magichands-physiotherapy",
    title: "Magichands Physiotherapy",
    category: "Web Development",
    badge: "WEB DEVELOPMENT",
    tagline: "Booking and care, made effortless.",
    description:
      "A responsive booking platform for a physiotherapy clinic, focused on ease of scheduling.",
    image: "/projects/magichands.jpg",
    heroImage: "/projects/magichands.jpg",
    liveUrl: "https://magichandsphysiotherapylimited.co.uk/",
    about:
      "Magichands needed an online presence that let patients book appointments and learn about treatments without calling in. We built a clean, mobile-first site around that goal, designed for people who are often searching for relief from pain and want answers quickly. The platform walks patients through available treatments, matches them with the right practitioner, and confirms a slot in just a few taps. On the clinic side, staff get a simplified calendar view that cuts down on double-bookings and phone-based scheduling, freeing up time to focus on patient care instead of admin.",
    features: [
      {
        title: "Online Booking",
        text: "Patients pick a slot and confirm in seconds.",
        icon: Calendar,
      },
      {
        title: "Treatment Catalog",
        text: "Clear breakdown of services offered.",
        icon: ClipboardList,
      },
      {
        title: "Reminders",
        text: "Automated appointment reminders reduce no-shows.",
        icon: Bell,
      },
    ],
  },
  {
    id: 3,
    slug: "inayit",
    title: "Inayit",
    category: "Software Development",
    badge: "SOFTWARE DEVELOPMENT",
    tagline: "Care coordination in one place.",
    description:
      "A platform connecting caregivers and families for coordinated care.",
    image: "/projects/inayit.png",
    heroImage: "/projects/inayit.png",
    liveUrl: "https://www.inayit.com/",
    about:
      "Inayit centralizes care schedules, notes, and communication between caregivers and families, replacing scattered calls and messages. Coordinating care for a loved one often means juggling multiple caregivers, appointments, and updates spread across texts and phone calls, which can lead to missed details at critical moments. We built Inayit to bring all of that into a single shared space, so families always know who's on duty, what's been done, and what still needs attention. Caregivers log visits and notes in real time, giving families peace of mind and a clear history they can look back on whenever they need it.",
    features: [
      {
        title: "Shared Care Calendar",
        text: "Everyone sees the same up-to-date schedule.",
        icon: CalendarCheck,
      },
      {
        title: "Secure Messaging",
        text: "In-app chat keeps sensitive info off SMS.",
        icon: MessageSquare,
      },
      {
        title: "Care Notes",
        text: "Log and track care history over time.",
        icon: FileText,
      },
    ],
  },
  {
    id: 4,
    slug: "epyrocxx",
    title: "Epyrocxx",
    category: "Web Development",
    badge: "WEB DEVELOPMENT",
    tagline: "A bold digital presence.",
    description: "A modern marketing site built for speed and conversion.",
    image: "/projects/epyrocxx.jpg",
    heroImage: "/projects/epyrocxx.jpg",
    liveUrl: "https://www.epyrocxx.com/",
    about:
      "Epyrocxx needed a fast, distinctive site to support its go-to-market push, and speed was non-negotiable given how quickly visitors bounce from slow-loading pages. We prioritized load speed and a clear conversion path from the very first wireframe, stripping out anything that didn't directly support the visitor's journey toward signing up. Every section was built to load instantly and guide the eye toward a single, obvious next step. The final site pairs a bold, modern visual identity with the kind of technical performance that keeps visitors engaged instead of clicking away.",
    features: [
      {
        title: "Performance-first",
        text: "Optimized assets for sub-second loads.",
        icon: Zap,
      },
      {
        title: "Conversion Funnels",
        text: "Clear CTAs guide visitors to signup.",
        icon: TrendingUp,
      },
      {
        title: "SEO Ready",
        text: "Structured for search visibility from day one.",
        icon: Search,
      },
    ],
  },
  {
    id: 5,
    slug: "cartlane",
    title: "Cartlane",
    category: "E-Commerce",
    badge: "E-COMMERCE",
    tagline: "Shopping, streamlined.",
    description: "A full-featured e-commerce storefront with secure checkout.",
    image: "/projects/cartlane.png",
    heroImage: "/projects/cartlane.png",
    liveUrl: "https://cartlane.vercel.app/",
    about:
      "Cartlane is a storefront built for scale — catalog browsing, cart, and checkout designed to convert on both desktop and mobile. From day one, the goal was to remove every point of friction between a shopper discovering a product and completing a purchase, whether they're browsing on a laptop at home or scrolling on their phone during a commute. We built fast, filterable product listings, a persistent cart experience across devices, and a checkout flow that keeps steps to a minimum. The platform is built to handle growing product catalogs and traffic spikes without slowing down.",
    features: [
      {
        title: "Product Catalog",
        text: "Fast filtering and search across categories.",
        icon: Search,
      },
      {
        title: "Secure Checkout",
        text: "Integrated trusted payment gateways.",
        icon: ShieldCheck,
      },
      {
        title: "Order Tracking",
        text: "Customers track orders in real time.",
        icon: Truck,
      },
    ],
  },
  {
    id: 6,
    slug: "3d-tailor-space",
    title: "3D Tailor Space",
    category: "3D / Web App",
    badge: "WEB APPLICATION",
    tagline: "Custom tailoring, visualized in 3D.",
    description: "An interactive 3D configurator for custom garment design.",
    image: "/projects/3d-tailor-space.png",
    heroImage: "/projects/3d-tailor-space.png",
    liveUrl: "https://3dtailorspace.vercel.app/",
    about:
      "3D Tailor Space lets customers customize garments and preview them in an interactive 3D view before ordering — reducing returns and boosting confidence. Buying custom-fit clothing online is traditionally a leap of faith, since customers have to imagine how their choices will actually look on a finished garment. We solved that by building a real-time 3D configurator, so every fabric, cut, and detail a customer selects is reflected instantly on a rotatable, true-to-scale model. Paired with saved measurement profiles for repeat orders and live quoting as options change, the experience turns a traditionally uncertain purchase into one customers can make with confidence.",
    features: [
      {
        title: "3D Configurator",
        text: "Live preview as customers adjust options.",
        icon: Box,
      },
      {
        title: "Measurement Profiles",
        text: "Save custom fits for repeat orders.",
        icon: Ruler,
      },
      {
        title: "Instant Quoting",
        text: "Price updates live as options change.",
        icon: Calculator,
      },
    ],
  },
  {
    id: 7,
    slug: "sandtglobal",
    title: "SandTGlobal",
    category: "Web Development",
    badge: "WEB DEVELOPMENT",
    tagline: "Global reach, local trust.",
    description:
      "A corporate site built to establish credibility across markets.",
    image: "/projects/sandtglobal.jpg",
    heroImage: "/projects/sandtglobal.jpg",
    liveUrl: "https://sandtglobal.co/",
    about:
      "SandTGlobal needed a professional, multi-region-ready site to support international business development, built to reassure partners and clients across very different markets. We structured the site so content, case studies, and contact paths could be tailored by region without duplicating the entire codebase for every rollout, keeping future expansion fast and manageable. Lead capture forms route directly to the sales team so no inquiry sits unanswered, and a dedicated case studies section lets prospective clients see proof of past results before they ever pick up the phone. The result is a site that reads as credible and established in every market it serves.",
    features: [
      {
        title: "Multi-region Content",
        text: "Structured for localized rollout.",
        icon: Globe,
      },
      {
        title: "Lead Capture",
        text: "Forms routed directly to the sales team.",
        icon: Inbox,
      },
      {
        title: "Case Studies",
        text: "Showcase of past work builds trust fast.",
        icon: FileText,
      },
    ],
  },
  {
    id: 8,
    slug: "collins",
    title: "Collins",
    category: "Web Development",
    badge: "WEB DEVELOPMENT",
    tagline: "A refined digital storefront.",
    description: "A polished brand site with a focus on visual storytelling.",
    image: "/projects/collins.jpg",
    heroImage: "/projects/collins.jpg",
    liveUrl: "https://colllins.webflow.io/",
    about:
      "Collins wanted a site that felt as premium as the brand itself, and that meant treating every detail — spacing, type, imagery — as part of the story rather than an afterthought. We built a visually-led experience with careful typography and pacing, letting large-format photography and generous whitespace do the heavy lifting instead of leaning on heavy copy or clutter. A custom design system kept every page consistent as new sections were added, while a CMS-driven backend means the marketing team can update content, swap imagery, and launch new pages without waiting on a developer. Fast, optimized image delivery ensures none of that visual polish comes at the cost of speed.",
    features: [
      {
        title: "Custom Design System",
        text: "Consistent, premium visual language.",
        icon: Palette,
      },
      {
        title: "Fast Page Loads",
        text: "Optimized imagery without sacrificing quality.",
        icon: Zap,
      },
      {
        title: "CMS-driven",
        text: "Marketing can update content without a developer.",
        icon: Settings,
      },
    ],
  },
  {
    id: 9,
    slug: "dentalbay",
    title: "DentalBay",
    category: "Healthcare",
    badge: "HEALTHCARE",
    tagline: "Dental care, one click away.",
    description: "A responsive appointment platform for a dental practice.",
    image: "/projects/dentalbay.jpg",
    heroImage: "/projects/dentalbay.jpg",
    liveUrl: "https://dentalbay.webflow.io/",
    about:
      "DentalBay brings appointment booking, service info, and patient communication into one clean, accessible platform, replacing a booking process that used to run entirely through phone calls during office hours. Patients can now browse the full range of treatments offered, pick a provider, and lock in an appointment in under a minute, any time of day. Automated reminders sent ahead of each visit have measurably cut down on missed appointments, saving the practice valuable chair time. The whole experience was built mobile-first, since most patients start their search for a dentist from their phone.",
    features: [
      {
        title: "Online Booking",
        text: "Book appointments in under a minute.",
        icon: Calendar,
      },
      {
        title: "Service Directory",
        text: "Clear breakdown of treatments offered.",
        icon: ClipboardList,
      },
      {
        title: "Patient Reminders",
        text: "Automated reminders reduce missed visits.",
        icon: Bell,
      },
    ],
  },
  {
    id: 10,
    slug: "amal-al-sham",
    title: "Amal Al-Sham",
    category: "Food",
    badge: "SOFTWARE DEVELOPMENT",
    tagline: "Authentic Syrian Cuisine & Dining Experience.",
    description:
      "Built a responsive halal meat platform focused on quality products and convenient ordering. Authentic Middle Eastern cuisine with a rich traditional taste.",
    image: "/projects/amal.jpg",
    heroImage: "/projects/amal.jpg",
    liveUrl: "https://amalal-sham.co.uk/",
    about:
      "Amal Al-Sham was developed to bring authentic Syrian flavors directly to customers through a seamless digital experience. The platform combines easy online ordering for high-quality halal meats and traditional dishes, with an engaging interface that reflects the rich culinary heritage of the Middle East, making dining convenient and impactful. Every product listing was written and photographed to highlight the freshness and provenance of the meat, since trust is everything when it comes to halal sourcing. Customers can track their order from confirmation to delivery in real time, and repeat customers can reorder their usual selections in just a couple of taps. The end result is a platform that feels as warm and personal as the cuisine it delivers, while running on the same modern, secure infrastructure customers expect from any online store.",
    features: [
      {
        title: "Online Ordering",
        text: "Streamlined menu and checkout process for a seamless user experience.",
        icon: ShoppingBag,
      },
      {
        title: "Real-time Tracking",
        text: "Live status updates for delivery and pickup to keep customers informed.",
        icon: MapPin,
      },
      {
        title: "Secure Payments",
        text: "Integrated trusted payment gateways ensuring safe and fast transactions.",
        icon: ShieldCheck,
      },
    ],
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}
