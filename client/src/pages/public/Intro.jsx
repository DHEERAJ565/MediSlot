import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Check,
  Clock3,
  HeartPulse,
  Menu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Tv,
  X,
} from 'lucide-react';
import './Intro.css';

const VIDEO_URL =
  'https://videos.pexels.com/video-files/5453583/5453583-uhd_3840_2160_25fps.mp4';

const Intro = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="intro-page">
      {/* CINEMATIC OPENING */}
      <section className="intro-hero" aria-label="Welcome to MediSlot">
        <div className="intro-video-frame" aria-hidden="true">
          {!videoFailed && (
            <video
              className="intro-background-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
            >
              <source src={VIDEO_URL} type="video/mp4" />
              <source src="/videos/medical-hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="intro-video-fallback" />
          <div className="intro-video-grain" />
        </div>

        <header className="intro-header">
          <Link to="/" className="intro-brand" aria-label="MediSlot home" onClick={closeMenu}>
            <span className="intro-brand-mark"><Activity size={20} strokeWidth={2.5} /></span>
            <span className="intro-brand-word">medi<span>slot</span><small>CARE, IN MOTION</small></span>
          </Link>

          <button
            className="intro-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav className={`intro-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Introduction navigation">
            <a href="#the-idea" onClick={closeMenu}>The idea</a>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <Link to="/home" onClick={closeMenu}>Platform overview</Link>
            <Link to="/queue-display" onClick={closeMenu}>Queue display</Link>
          </nav>

          <div className="intro-header-actions">
            <Link to="/login" className="intro-sign-in">Sign in</Link>
            <Link to="/doctors" className="intro-header-cta">Find your doctor <ArrowUpRight size={15} /></Link>
          </div>
        </header>

        <div className="intro-hero-content">
          <div className="intro-overline"><span /> A MORE HUMAN WAY TO MANAGE CARE <Sparkles size={14} /></div>

          <h1>
            Healthcare<br />
            should move<br />
            <em>with you.</em>
          </h1>

          <div className="intro-hero-bottom-row">
            <p className="intro-hero-copy">
              Finding the right specialist, booking a visit and knowing when it is your turn
              should feel like one connected journey — not a maze of separate steps.
            </p>
            <div className="intro-hero-actions">
              <Link to="/doctors" className="intro-primary-cta">
                Start your care journey <ArrowUpRight size={18} />
              </Link>
              <a href="#the-idea" className="intro-secondary-cta">
                Discover MediSlot <ArrowDownRight size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="intro-hero-index"><span>01</span><i /> A BETTER WAY THROUGH CARE</div>
        <div className="intro-hero-bottomline">
          <span>FIND. BOOK. FOLLOW.</span>
          <span className="intro-scroll-cue"><span /> SCROLL TO EXPLORE</span>
          <span>BUILT AROUND YOUR TIME</span>
        </div>
      </section>

      {/* THE IDEA */}
      <section className="intro-manifesto" id="the-idea">
        <div className="intro-section-label"><span>02 / THE IDEA</span><i /> LESS FRICTION. MORE FOCUS.</div>

        <div className="intro-manifesto-grid">
          <div className="intro-manifesto-title">
            <p className="intro-kicker">CARE IS A JOURNEY.</p>
            <h2>Make every<br /><span>step feel</span><br />simpler.</h2>
          </div>

          <div className="intro-manifesto-copy">
            <div className="intro-quote-mark">“</div>
            <p>
              Your time matters before you reach the clinic, while you are there,
              and long after the appointment ends. MediSlot brings the essential
              parts of that experience into one clear place.
            </p>
            <div className="intro-manifesto-signature"><span className="intro-signature-line" /> THE MEDISLOT APPROACH</div>
          </div>
        </div>

        <div className="intro-marquee" aria-label="Find care, book with clarity, follow your visit">
          <div className="intro-marquee-track">
            {[0, 1].map((copy) => (
              <span className="intro-marquee-group" key={copy} aria-hidden={copy === 1}>
                FIND YOUR SPECIALIST <b>✳</b> BOOK WITH CLARITY <b>✳</b> FOLLOW YOUR VISIT <b>✳</b> KEEP CARE CONNECTED <b>✳</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="intro-journey" id="how-it-works">
        <div className="intro-section-label intro-section-label-light"><span>03 / THE JOURNEY</span><i /> THREE STEPS. ONE CONNECTED EXPERIENCE.</div>

        <div className="intro-journey-heading">
          <div>
            <p className="intro-kicker intro-kicker-light">FROM SEARCH TO CHECK-IN</p>
            <h2>Less chasing.<br /><em>More knowing.</em></h2>
          </div>
          <p className="intro-journey-intro">
            A clearer path through the everyday details of a clinic visit.
            Everything starts with the next step, not another complicated process.
          </p>
        </div>

        <div className="intro-steps">
          <article className="intro-step-card intro-step-one">
            <div className="intro-step-top"><span>01</span><Stethoscope size={22} /></div>
            <div className="intro-step-art intro-art-search">
              <div className="intro-art-orbit" />
              <div className="intro-art-circle"><Stethoscope size={36} /></div>
              <span className="intro-art-tag">SPECIALIST FOUND</span>
            </div>
            <div className="intro-step-copy">
              <p>DISCOVER</p>
              <h3>Meet the right<br />care team.</h3>
              <span>Explore doctors by specialty and find a professional who fits your needs.</span>
              <Link to="/doctors">Explore doctors <ArrowUpRight size={15} /></Link>
            </div>
          </article>

          <article className="intro-step-card intro-step-two">
            <div className="intro-step-top"><span>02</span><CalendarCheck size={22} /></div>
            <div className="intro-step-art intro-art-calendar">
              <div className="intro-calendar-sheet">
                <div className="intro-calendar-head"><span /> <span /> <span /></div>
                <div className="intro-calendar-month">YOUR VISIT, YOUR TIME</div>
                <div className="intro-calendar-dates"><b>08</b><b>09</b><b className="selected">10</b><b>11</b><b>12</b></div>
                <div className="intro-calendar-confirm"><Check size={13} /> SLOT SELECTED</div>
              </div>
            </div>
            <div className="intro-step-copy">
              <p>BOOK</p>
              <h3>Make time<br />for your health.</h3>
              <span>Choose an available appointment slot and keep the details together.</span>
              <Link to="/doctors">Choose a doctor <ArrowUpRight size={15} /></Link>
            </div>
          </article>

          <article className="intro-step-card intro-step-three">
            <div className="intro-step-top"><span>03</span><Clock3 size={22} /></div>
            <div className="intro-step-art intro-art-queue">
              <div className="intro-queue-ticket">
                <small>YOUR QUEUE STATUS</small>
                <strong>A-024</strong>
                <span><i /> LIVE QUEUE CONCEPT</span>
              </div>
              <div className="intro-queue-ring"><Activity size={23} /></div>
            </div>
            <div className="intro-step-copy">
              <p>FOLLOW</p>
              <h3>Know what<br />comes next.</h3>
              <span>Follow token progress with the clinic queue display and feel more prepared.</span>
              <Link to="/queue-display">View queue display <ArrowUpRight size={15} /></Link>
            </div>
          </article>
        </div>
      </section>

      {/* PLATFORM HIGHLIGHTS */}
      <section className="intro-features" id="features">
        <div className="intro-section-label"><span>04 / MADE TO CONNECT</span><i /> THE DETAILS THAT MAKE A DIFFERENCE.</div>

        <div className="intro-features-heading">
          <h2>One place for<br /><span>the moving parts.</span></h2>
          <p>From patient access to clinic coordination, MediSlot helps the people involved stay on the same page.</p>
        </div>

        <div className="intro-feature-grid">
          <article className="intro-feature intro-feature-large">
            <div className="intro-feature-icon"><HeartPulse size={24} /></div>
            <span className="intro-feature-number">A / PATIENT EXPERIENCE</span>
            <h3>Your care details,<br />within reach.</h3>
            <p>Keep your appointment information, visit history and medical reports organised in your patient space.</p>
            <div className="intro-feature-art intro-patient-art"><div className="intro-art-pulse"><HeartPulse size={37} /></div><span>YOUR CARE SPACE</span></div>
          </article>

          <article className="intro-feature intro-feature-orange">
            <div className="intro-feature-icon"><Clock3 size={24} /></div>
            <span className="intro-feature-number">B / CLINIC FLOW</span>
            <h3>Waiting, with<br />more visibility.</h3>
            <p>Queue updates help patients and clinic teams follow token progress more clearly.</p>
            <div className="intro-feature-art intro-flow-art"><div className="intro-flow-line"><i /><i /><i /><i /></div><span>QUEUE IN MOTION</span></div>
          </article>

          <article className="intro-feature intro-feature-dark">
            <div className="intro-feature-icon"><ShieldCheck size={24} /></div>
            <span className="intro-feature-number">C / CONNECTED WORKSPACE</span>
            <h3>One workflow.<br />Clearer handoffs.</h3>
            <p>Dedicated spaces help patients, doctors and administrators manage the work relevant to their role.</p>
            <div className="intro-feature-art intro-workspace-art"><div /><div /><div /></div>
          </article>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="intro-final-cta">
        <div className="intro-final-orbit intro-final-orbit-one" />
        <div className="intro-final-orbit intro-final-orbit-two" />
        <div className="intro-final-content">
          <p className="intro-kicker intro-kicker-light">YOUR NEXT STEP STARTS HERE</p>
          <h2>Take the clearer<br /><em>way to care.</em></h2>
          <p>Find a specialist. Plan your visit. Stay in the know.</p>
          <div className="intro-final-actions">
            <Link to="/doctors" className="intro-primary-cta">Find a doctor <ArrowUpRight size={17} /></Link>
            <Link to="/register" className="intro-final-secondary">Create your account <ArrowRight size={16} /></Link>
          </div>
        </div>
        <div className="intro-final-side-note"><span>MEDISLOT</span><i /> CARE, IN MOTION</div>
      </section>

      <footer className="intro-footer">
        <Link to="/" className="intro-brand intro-footer-brand">
          <span className="intro-brand-mark"><Activity size={18} /></span>
          <span className="intro-brand-word">medi<span>slot</span><small>CARE, IN MOTION</small></span>
        </Link>
        <p>Thoughtful healthcare coordination, from the first search to the next step.</p>
        <div className="intro-footer-links">
          <Link to="/home">Platform overview</Link>
          <Link to="/doctors">Find doctors</Link>
          <Link to="/login">Sign in</Link>
        </div>
        <span className="intro-copyright">© {new Date().getFullYear()} MediSlot</span>
      </footer>
    </main>
  );
};

export default Intro;
