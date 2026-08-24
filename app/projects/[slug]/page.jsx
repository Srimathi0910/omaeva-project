// app/projects/[slug]/page.jsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ClipboardCheck,
  Monitor,
  Code2,
  FlaskConical,
  Cloud,
  ArrowLeft,
} from "lucide-react";
import { PROJECTS, getProjectBySlug } from "../../../data/projectsData";
import styles from "./ProjectDetail.module.css";

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
  {
    title: "Requirement Analysis",
    text: "Understood business goals, user needs, and market requirements.",
    icon: ClipboardCheck,
  },
  {
    title: "UI/UX Design",
    text: "Designed intuitive and engaging interfaces for web and mobile.",
    icon: Monitor,
  },
  {
    title: "Development",
    text: "Built scalable and secure web and mobile applications with modern technologies.",
    icon: Code2,
  },
  {
    title: "Testing",
    text: "Performed functional, performance, and security testing.",
    icon: FlaskConical,
  },
  {
    title: "Deployment",
    text: "Deployed on cloud with monitoring and continuous support.",
    icon: Cloud,
  },
];

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Projects
        </Link>

        <span className={styles.badge}>
          <Code2 size={14} />
          {project.badge}
        </span>

        <div className={styles.heroGrid}>
          {/* Text column */}
          <div>
            <h1 className={styles.heroTitle}>{project.title}</h1>
            <p className={styles.heroTagline}>{project.tagline}</p>
            <p className={styles.heroDescription}>{project.description}</p>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.liveButton}
              >
                Visit Live Site
              </a>
            )}
          </div>

          {/* Image column */}
          {project.heroImage ? (
            <div className={styles.heroImageWrap}>
              <Image
                src={project.heroImage}
                alt={project.title}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div className={styles.heroImagePlaceholder}>Image coming soon</div>
          )}
        </div>
      </section>

      {/* About */}
      <section className={styles.about}>
        <h2 className={styles.sectionTitle}>About the Project</h2>
        <p className={styles.aboutText}>{project.about}</p>
      </section>

      {/* Key Features */}
      <section className={styles.features}>
        <h2 className={`${styles.sectionTitle} ${styles.featuresTitle}`}>
          Key Features
        </h2>
        <div className={styles.featuresGrid}>
          {project.features.map((f) => {
            const FeatureIcon = f.icon;
            return (
              <div key={f.title} className={styles.featureCard}>
                {FeatureIcon && (
                  <div className={styles.featureIcon}>
                    <FeatureIcon size={20} />
                  </div>
                )}
                <h3 className={styles.featureCardTitle}>{f.title}</h3>
                <p className={styles.featureCardText}>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What We Did */}
      <section className={styles.steps}>
        <h2 className={`${styles.sectionTitle} ${styles.stepsTitle}`}>
          What We Did
        </h2>
        <div className={styles.stepsInner}>
          <div className={styles.connectorLine} />
          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.title} className={styles.stepItem}>
                <div className={styles.stepIconCircle}>
                  <s.icon size={22} />
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
