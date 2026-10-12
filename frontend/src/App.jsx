
import {
  Code2,
  Mail,
  Monitor,
  Database,
  ArrowRight,
  ArrowDown,
  ExternalLink,
  Globe,
  User,
  Briefcase,
  GraduationCap,
  Menu,
  X,
  MapPin,
  Terminal,
} from "lucide-react";

import { useState } from "react";
import { useEffect } from "react";
import { testSupabaseConnection } from "./lib/testSupabase";


const skills = [
  { name: "HTML & CSS", level: "Frontend" },
  { name: "JavaScript", level: "Frontend" },
  { name: "React", level: "Frontend" },
  { name: "Node.js & Express", level: "Backend" },
  { name: "MySQL", level: "Database" },
  { name: "Supabase", level: "Database" },
  { name: "Git & GitHub", level: "Tools" },
  { name: "Tailwind CSS", level: "Frontend" },
];

const projects = [
  {
    number: "01",
    title: "JandaWatch",
    description:
      "A concept for monitoring forex trading sessions and helping traders stay informed about market activity.",
    technologies: ["React", "JavaScript", "Supabase"],
    icon: Monitor,
    color: "from-blue-500/20 to-cyan-500/5",
    status: "In development",
  },
  {
    number: "02",
    title: "Portfolio Website",
    description:
      "A personal portfolio designed to showcase my skills, projects, education, and software development journey.",
    technologies: ["React", "Tailwind CSS", "Node.js"],
    icon: Code2,
    color: "from-violet-500/20 to-blue-500/5",
    status: "In development",
  },
  {
    number: "03",
    title: "Full-Stack Web App",
    description:
      "A web application concept focused on authentication, database management, and responsive user interfaces.",
    technologies: ["React", "Express", "MySQL"],
    icon: Database,
    color: "from-emerald-500/20 to-teal-500/5",
    status: "Practice project",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];
  useEffect(() => {
  testSupabaseConnection();
}, []);lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-0 top-[35%] h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a
            href="#home"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-bold text-white shadow-lg shadow-blue-500/20">
              IJ
            </div>
            <div>
              <p className="font-bold tracking-tight">Impano Janvier</p>
              <p className="text-xs text-slate-400">Software Developer</p>
            </div>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 transition hover:text-blue-400"
              >
                {link.label}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="hidden rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 md:inline-flex"
          >
            Let's Talk
          </a>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-700 p-2 text-slate-200 md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-full border-b border-white/10 bg-slate-950 p-6 shadow-2xl md:hidden">
              <div className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMenu}
                    className="text-slate-300 transition hover:text-blue-400"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section
          id="home"
          className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8"
        >
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Software Development Student
            </div>

            <p className="mb-4 text-lg font-medium text-blue-400">
              Hello, welcome to my portfolio.
            </p>

            <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              I'm Impano
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Janvier.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
              I am passionate about building modern web applications,
              solving problems with code, and turning ideas into useful
              digital experiences.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-600"
              >
                Explore My Work <ArrowRight size={18} />
              </a>

              <a
                href="#about"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                About Me <ArrowDown size={18} />
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" />
                Rwanda
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              <span className="inline-flex items-center gap-2">
                <Terminal size={16} className="text-blue-400" />
                Full-Stack Development
              </span>
            </div>

            <div className="mt-8 flex gap-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="rounded-xl border border-slate-800 p-3 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
              >
                <Code2 size={20} />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="rounded-xl border border-slate-800 p-3 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
              >
                <Globe size={20} />
              </a>
              <a
                href="mailto:your-email@example.com"
                aria-label="Email"
                className="rounded-xl border border-slate-800 p-3 text-slate-400 transition hover:border-blue-500 hover:text-blue-400"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Developer card */}
          <div className="mx-auto w-full max-w-lg">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-cyan-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    developer.js
                  </span>
                </div>

                <div className="space-y-4 p-6 font-mono text-sm sm:p-8">
                  <p className="text-slate-500">// A little about me</p>
                  <p>
                    <span className="text-violet-400">const</span>{" "}
                    <span className="text-blue-300">developer</span>{" "}
                    <span className="text-slate-400">= {"{"}</span>
                  </p>

                  <div className="space-y-3 pl-5">
                    <p>
                      <span className="text-cyan-300">name</span>:{" "}
                      <span className="text-emerald-300">
                        "Impano Janvier"
                      </span>
                      ,
                    </p>
                    <p>
                      <span className="text-cyan-300">focus</span>:{" "}
                      <span className="text-emerald-300">
                        "Web Development"
                      </span>
                      ,
                    </p>
                    <p>
                      <span className="text-cyan-300">frontend</span>:{" "}
                      <span className="text-emerald-300">"React"</span>,
                    </p>
                    <p>
                      <span className="text-cyan-300">backend</span>:{" "}
                      <span className="text-emerald-300">"Node.js"</span>,
                    </p>
                    <p>
                      <span className="text-cyan-300">database</span>:{" "}
                      <span className="text-emerald-300">"SQL"</span>,
                    </p>
                    <p>
                      <span className="text-cyan-300">mindset</span>:{" "}
                      <span className="text-emerald-300">
                        "Always learning"
                      </span>
                    </p>
                  </div>

                  <p className="text-slate-400">{"};"}</p>

                  <div className="mt-7 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-blue-300">
                      <Code2 size={17} />
                      <span className="font-sans font-semibold">
                        Current mission
                      </span>
                    </div>
                    <p className="font-sans leading-6 text-slate-400">
                      Learn, build, improve, and create software that solves
                      real-world problems.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 text-xs text-slate-500">
                  <span>Made with curiosity</span>
                  <span className="text-emerald-400">● Ready to build</span>
                </div>
              </div>

              <div className="absolute -right-3 top-12 hidden rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl sm:block">
                <Code2 className="text-blue-400" size={25} />
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 border-y border-white/5 bg-slate-900/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                About Me
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Building my future,{" "}
                <span className="text-slate-400">one project at a time.</span>
              </h2>
            </div>

            <div className="space-y-5 text-base leading-8 text-slate-400">
              <p>
                My name is Impano Janvier. I studied Software Development
                and am continuing my learning journey in Computer Science.
                I enjoy creating websites and exploring how software works
                behind the scenes.
              </p>
              <p>
                I am developing my skills in frontend interfaces, backend
                APIs, databases, and software problem-solving. My goal is
                to keep learning by building practical projects and improving
                with every challenge.
              </p>
              <a
                href="#skills"
                className="inline-flex items-center gap-2 font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Discover my skills <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="scroll-mt-24 mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              My Toolkit
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Skills I'm developing
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              Technologies I use or am learning as I build full-stack
              applications. My experience with each technology continues
              to grow through practice.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500 group-hover:text-white">
                  <Code2 size={22} />
                </div>
                <h3 className="font-semibold text-slate-100">{skill.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{skill.level}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          className="scroll-mt-24 border-y border-white/5 bg-slate-900/40"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Selected Work
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Projects & experiments
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                  A look at the applications I am building and the ideas
                  I am exploring.
                </p>
              </div>
              <span className="text-sm text-slate-500">
                Learning through building
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {projects.map((project) => {
                const ProjectIcon = project.icon;

                return (
                  <article
                    key={project.number}
                    className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 transition hover:-translate-y-1 hover:border-slate-700"
                  >
                    <div
                      className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${project.color}`}
                    >
                      <span className="absolute left-5 top-5 font-mono text-sm text-slate-400">
                        / {project.number}
                      </span>
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 text-blue-400 shadow-2xl transition group-hover:scale-110">
                        <ProjectIcon size={36} />
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400">
                          {project.status}
                        </span>
                      </div>

                      <p className="min-h-20 leading-7 text-slate-400">
                        {project.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <span
                            key={technology}
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-blue-300"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-5 text-sm text-slate-500">
                        <Code2 size={16} />
                        <span>Project details coming soon</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-24 mx-auto max-w-5xl px-6 py-24 text-center lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-500/10 via-slate-900 to-violet-500/10 px-6 py-14 sm:px-12">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Mail size={27} />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Get In Touch
            </p>
            <h2 className="text-3xl font-bold sm:text-5xl">
              Have an idea in mind?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-400">
              I'm interested in learning, collaborating on projects, and
              exploring opportunities to grow as a software developer.
              Let's connect.
            </p>

            <a
              href="mailto:your-email@example.com"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-600"
            >
              Send Me an Email <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} Impano Janvier. All rights reserved.
          </p>
          <a
            href="#home"
            className="inline-flex items-center gap-2 transition hover:text-blue-400"
          >
            Back to top <ArrowDown className="rotate-180" size={16} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
