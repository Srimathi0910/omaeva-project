import ProjectBubbles from "@/components/ProjectBubbles";

export default function Home() {
  return (
    <main className="projects-page">

      {/* Header */}
      <section className="projects-header">

        <div className="section-pill">
          <span></span>
          Our Work
        </div>

        <h1>
          Projects that make an{" "}
          <span>impact.</span>
        </h1>

        <p>
          Crafted with purpose. Built with precision.
          Each project reflects our passion for design,
          development, and results.
        </p>

      </section>

      {/* 3D Bubble Section */}
      <section className="projects-visual">

        <ProjectBubbles />

        {/* Center text */}
        <div className="center-content">

          <div className="center-circle">
            <span>+</span>
          </div>

          <p>
            Explore our work
          </p>

        </div>

      </section>

      {/* Bottom information */}
      <section className="projects-footer">

        <div>
          <span className="small-label">
            SELECTED WORK
          </span>

          <h2>
            Digital experiences
            <br />
            built to stand out.
          </h2>
        </div>

        <div className="scroll-indicator">
          <span>Scroll to explore</span>

          <div className="line"></div>
        </div>

      </section>

    </main>
  );
}
