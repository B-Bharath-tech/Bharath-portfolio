
import emailjs from '@emailjs/browser';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BarChart3, BrainCircuit,
  Code2, Database, Github, GraduationCap, Mail, Menu, Send,
  Sparkles, Terminal, X
} from 'lucide-react';
import './styles.css';
import { supabase } from './supabase';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './admin/Admin';

// Replace these with your actual EmailJS dashboard values.
const EMAILJS_SERVICE_ID = 'service_hdsjxfg';
const EMAILJS_TEMPLATE_ID = 'template_sb3zp1s';
const EMAILJS_PUBLIC_KEY = 'o3vModQKHNRhymQc6';

const getProjectIcon = (project) => {
  const title = (project.title || '').toLowerCase();
  const category = (project.category || '').toLowerCase();

  if (title.includes('college event')) return Code2;
  if (title.includes('fitcheck')) return BrainCircuit;
  if (title.includes('codetrends')) return BarChart3;
  if (title.includes('loan default')) return Database;
  if (title.includes('customer churn')) return Terminal;
  if (title.includes('sentiment')) return Sparkles;
  if (category.includes('web')) return Code2;
  if (category.includes('analytics')) return BarChart3;
  if (category.includes('machine learning')) return BrainCircuit;
  return Code2;
};

const skillGroups = [
  {
    title: 'Programming',
    icon: Code2,
    items: ['Python', 'C++', 'Java', 'JavaScript', 'SQL', 'HTML5', 'CSS3']
  },
  {
    title: 'Data & Machine Learning',
    icon: BrainCircuit,
    items: ['Pandas', 'NumPy', 'Scikit-learn', 'EDA', 'NLP', 'Predictive Modeling']
  },
  {
    title: 'Frameworks & APIs',
    icon: Terminal,
    items: ['Django', 'Flask', 'FastAPI', 'Streamlit', 'REST APIs', 'Pydantic']
  },
  {
    title: 'Tools & Platforms',
    icon: Database,
    items: ['Git basics', 'GitHub', 'Docker', 'MLflow', 'AWS S3', 'VS Code']
  }
];

function App() {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError('');

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('number, category, title, description, tags, github, published, created_at')
        .eq('published', true)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Supabase project loading error:', fetchError);
        setProjectsError('Projects could not be loaded right now. Please try again later.');
        setProjects([]);
      } else {
        const orderedProjects = (data || []).map((project, index) => ({
          ...project,
          number: project.number || String(index + 1).padStart(2, '0'),
          tags: project.tags || [],
          icon: getProjectIcon(project)
        }));
        setProjects(orderedProjects);
      }

      setProjectsLoading(false);
    };

    loadProjects();
  }, []);

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setSent(false);
    setError('');
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    setSending(true);
    setSent(false);
    setError('');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          message: form.message
        },
        {
          publicKey: EMAILJS_PUBLIC_KEY
        }
      );

      setSent(true);
      setForm({
        name: '',
        email: '',
        message: ''
      });
    } catch (err) {
      console.error('EmailJS send error:', err);
      setError(
        'Your message could not be sent. Please try again or email me directly.'
      );
    } finally {
      setSending(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
          aria-label="B Bharath home"
        >
          <span className="brand-mark">BB</span>
          <span>
            B Bharath<span className="brand-dot">.</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          {[
            ['About', '#about'],
            ['Skills', '#skills'],
            ['Projects', '#projects'],
            ['Contact', '#contact']
          ].map(([label, href]) => (
            <a key={label} href={href} onClick={closeMenu}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#contact" onClick={closeMenu}>
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-grid" aria-hidden="true" />

          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              OPEN TO LEARNING & OPPORTUNITIES
            </div>

            <p className="hero-intro">Hello, I’m</p>
            <h1>B Bharath<span className="blue-period">.</span></h1>
            <h2>Data Science Student <span>·</span> Developer</h2>

            <p className="hero-description">
              I’m a Computer Science and Engineering (Data Science) student
              who enjoys turning data into useful insights and building
              practical applications with Python and machine learning.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#projects">
                Explore my work <ArrowRight size={17} />
              </a>

              <a className="button button-secondary" href="#contact">
                Get in touch <Mail size={16} />
              </a>

              <a
                className="button button-secondary"
                href="/documents/Bharath_Resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                View Resume <ArrowUpRight size={16} />
              </a>

              <a
                className="button button-secondary"
                href="/documents/Bharath_Resume.pdf"
                download="Bharath_Resume.pdf"
              >
                Download Resume <ArrowDown size={16} />
              </a>
            </div>

            <div className="hero-meta">
              <span><GraduationCap size={17} /> B.E. CSE (Data Science)</span>
              <span className="meta-separator" />
              <span><Sparkles size={16} /> Curious by design</span>
            </div>
          </div>

          <div className="hero-art" aria-label="Decorative code illustration">
            <div className="orb orb-one" />
            <div className="orb orb-two" />

            <div className="code-window">
              <div className="window-top">
                <i /><i /><i />
                <span>bharath.py</span>
              </div>
              <div className="code-lines">
                <p><b>01</b> <span className="code-purple">def</span> <span className="code-blue">build_ideas</span>():</p>
                <p><b>02</b> &nbsp;&nbsp;skills = [</p>
                <p><b>03</b> &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">"data"</span>, <span className="code-green">"code"</span>,</p>
                <p><b>04</b> &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-green">"curiosity"</span></p>
                <p><b>05</b> &nbsp;&nbsp;]</p>
                <p><b>06</b> &nbsp;&nbsp;<span className="code-purple">return</span> <span className="code-blue">solutions</span></p>
                <p><b>07</b> <span className="cursor">▍</span></p>
              </div>
            </div>

            <div className="floating-card card-data">
              <span className="float-icon"><BarChart3 size={18} /></span>
              <span><b>Data-driven</b><small>Think in insights</small></span>
            </div>

            <div className="floating-card card-code">
              <span className="float-icon"><Code2 size={18} /></span>
              <span><b>Build & learn</b><small>One step at a time</small></span>
            </div>

            <div className="hero-decoration deco-cross">✳</div>
            <div className="hero-decoration deco-plus">+</div>
          </div>

          <a href="#about" className="scroll-hint">
            <span>SCROLL TO EXPLORE</span><ArrowDown size={15} />
          </a>
        </section>

        <section className="section about-section" id="about">
          <div className="section-heading">
            <p className="section-kicker">A LITTLE ABOUT ME</p>
            <h2>Building skills.<br /><span>Creating useful things.</span></h2>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p className="lead">
                I’m a student who likes understanding how things work — from
                patterns in data to the software people use every day.
              </p>
              <p>
                Currently pursuing a B.E. in Computer Science and Engineering
                (Data Science) at Alva’s Institute of Engineering and
                Technology, affiliated with VTU. I’m developing my skills
                through hands-on projects in data analysis, machine learning,
                and web development.
              </p>
              <p>
                I value clear thinking, steady learning, and building projects
                that solve practical problems. I’m excited to keep improving
                and collaborate with people who enjoy making things better.
              </p>
              <a className="text-link" href="#projects">
                See what I’ve been building <ArrowRight size={16} />
              </a>
            </div>

            <div className="about-facts">
              <div className="fact-card">
                <span className="fact-icon"><GraduationCap size={20} /></span>
                <div>
                  <small>EDUCATION</small>
                  <b>B.E. · CSE (Data Science)</b>
                  <p>Alva’s Institute of Engineering and Technology</p>
                  <p className="fact-muted">2023 – 2027 · VTU</p>
                </div>
              </div>

              <div className="fact-card">
                <span className="fact-icon"><BrainCircuit size={20} /></span>
                <div>
                  <small>AREAS I’M EXPLORING</small>
                  <b>Data Science & Development</b>
                  <p>Machine learning, analytics, Python applications</p>
                </div>
              </div>

              <div className="fact-card">
                <span className="fact-icon"><Sparkles size={20} /></span>
                <div>
                  <small>MY APPROACH</small>
                  <b>Learn by building</b>
                  <p>Practice, experiment, improve, repeat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section skills-section" id="skills">
          <div className="section-heading centered">
            <p className="section-kicker">MY TOOLKIT</p>
            <h2>Skills I’m growing<span>.</span></h2>
            <p className="section-subtitle">
              Tools and technologies I’ve used or explored through coursework and projects.
            </p>
          </div>

          <div className="skills-grid">
            {skillGroups.map((group, index) => {
              const Icon = group.icon;
              return (
                <article className="skill-card" key={group.title}>
                  <div className="skill-card-top">
                    <span className="skill-icon"><Icon size={21} /></span>
                    <span className="skill-index">0{index + 1}</span>
                  </div>
                  <h3>{group.title}</h3>
                  <div className="skill-tags">
                    {group.items.map(item => <span key={item}>{item}</span>)}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="skills-note">
            <span className="note-dot" />
            Skill levels vary by tool; I’m continuing to build depth through practical work.
          </p>
        </section>

        <section className="section projects-section" id="projects">
          <div className="projects-heading">
            <div className="section-heading">
              <p className="section-kicker">SELECTED WORK</p>
              <h2>Projects with a purpose<span>.</span></h2>
              <p className="section-subtitle">
                A few things I’ve worked on while exploring data, machine learning, and software development.
              </p>
            </div>
            <span className="project-count">{projects.length.toString().padStart(2, '0')} PROJECTS <span>↘</span></span>
          </div>

          <div className="projects-grid">
            {projectsLoading && (
              <p className="project-note" role="status">Loading projects…</p>
            )}
            {!projectsLoading && projectsError && (
              <p className="project-note" role="alert">{projectsError}</p>
            )}
            {!projectsLoading && !projectsError && projects.length === 0 && (
              <p className="project-note">No published projects are available yet.</p>
            )}
            {!projectsLoading && !projectsError && projects.map((project) => {
              const Icon = project.icon;
              return (
                <article className="project-card" key={project.number}>
                  <div className="project-card-head">
                    <span className="project-icon"><Icon size={22} /></span>
                    <span className="project-number">/{project.number}</span>
                  </div>
                  <p className="project-category">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tags">
                    {project.tags.map(tag => <span key={tag}>{tag}</span>)}
                  </div>

                  {project.github ? (
                    <a
                      className="project-link"
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Explore project <ArrowUpRight size={16} />
                    </a>
                  ) : (
                    <span className="project-link project-link-disabled">
                      Project details coming soon
                    </span>
                  )}
                </article>
              );
            })}
          </div>
          <p className="project-note">
            Projects are loaded directly from the portfolio database.
          </p>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-background" />

          <div className="contact-inner">
            <div className="contact-copy">
              <p className="section-kicker">HAVE A PROJECT IN MIND?</p>
              <h2>Let’s make something<br /><span>meaningful.</span></h2>
              <p>
                I’m always interested in learning, connecting with fellow
                developers, and exploring internship opportunities. Send me a note.
              </p>

              <div className="contact-direct">
                <span className="contact-icon"><Mail size={19} /></span>
                <div>
                  <small>EMAIL</small>
                  <b>bbharath0369@gmail.com</b>
                </div>
              </div>

              <div className="contact-direct">
                <span className="contact-icon"><Github size={19} /></span>
                <div>
                  <small>GITHUB</small>
                  <a href="https://github.com/B-Bharath-tech" target="_blank" rel="noreferrer">
                    github.com/B-Bharath-tech <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={sendMessage}>
              <div className="form-heading">
                <span>01 / SAY HELLO</span>
                <span className="form-spark">✳</span>
              </div>

              <label htmlFor="name">Your name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={update}
                placeholder="Jane Smith"
                required
              />

              <label htmlFor="email">Your email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                placeholder="jane@example.com"
                required
              />

              <label htmlFor="message">What’s on your mind?</label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={update}
                placeholder="Tell me a little about it..."
                rows="4"
                required
              />

              <button
                className="button button-primary submit-button"
                type="submit"
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send message'} <Send size={16} />
              </button>

              {sent && (
                <p className="form-hint" role="status">
                  Thanks! Your message was sent successfully.
                </p>
              )}

              {error && (
                <p className="form-hint" role="alert">{error}</p>
              )}

              <p className="form-hint">
                Your message is sent through EmailJS. Please do not include sensitive information.
              </p>
            </form>
          </div>

          <footer className="footer">
            <a className="brand footer-brand" href="#home">
              <span className="brand-mark">BB</span>
              <span>B Bharath<span className="brand-dot">.</span></span>
            </a>
            <p>Designed with curiosity and a lot of coffee-free code.</p>
            <a href="#home" className="back-top">BACK TO TOP ↑</a>
            <span className="copyright">© {new Date().getFullYear()} B Bharath</span>
          </footer>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
