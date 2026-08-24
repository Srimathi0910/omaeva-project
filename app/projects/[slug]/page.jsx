// app/projects/[slug]/page.jsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PROJECTS, getProjectBySlug } from "../../../data/projectsData";

// Pre-renders /projects/cilicosys, /projects/inayit, etc. at build time
export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} | Omaeva`,
    description: project.description,
  };
}

const STEPS = [
  { title: "Requirement Analysis", text: "Understood business goals, user needs, and market requirements." },
  { title: "UI/UX Design", text: "Designed intuitive and engaging interfaces for web and mobile." },
  { title: "Development", text: "Built scalable and secure web and mobile applications with modern technologies." },
  { title: "Testing", text: "Performed functional, performance, and security testing." },
  { title: "Deployment", text: "Deployed on cloud with monitoring and continuous support." },
];

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main>
      {/* Hero */}
      <section className="bg-black text-white rounded-b-[64px] px-6 md:px-16 lg:px-24 pt-12 pb-24 md:pb-32">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
        >
          ← Back to Projects
        </Link>

        <span className="inline-block mt-10 px-4 py-1.5 text-xs tracking-wide border border-lime-400 text-lime-400 rounded-full">
          {project.badge}
        </span>

        <div className="mt-12 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif leading-tight">
              {project.title}
            </h1>
            <p className="mt-8 italic text-lg text-white/80 leading-relaxed">
              {project.tagline}
            </p>
            <p className="mt-6 text-white/70 leading-relaxed max-w-md">
              {project.description}
            </p>
          </div>

          {project.heroImage && (
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/5">
              <Image
                src={project.heroImage}
                alt={project.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="bg-gray-50 px-6 md:px-16 lg:px-24 py-24 md:py-28 text-center">
        <h2 className="text-3xl md:text-4xl font-serif mb-8">About the Project</h2>
        <p className="max-w-3xl mx-auto text-gray-600 leading-loose">
          {project.about}
        </p>
      </section>

      {/* Key Features */}
      <section className="px-6 md:px-16 lg:px-24 py-24 md:py-28">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-16">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {project.features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-8 flex flex-col gap-3"
            >
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Did */}
      <section className="px-6 md:px-16 lg:px-24 pb-32 pt-8">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-20">
          What We Did
        </h2>
        <div className="grid md:grid-cols-5 gap-10 md:gap-8 max-w-6xl mx-auto text-center">
          {STEPS.map((s) => (
            <div key={s.title} className="flex flex-col items-center">
              <div className="mb-6 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">•</span>
              </div>
              <h3 className="font-semibold mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[180px]">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
