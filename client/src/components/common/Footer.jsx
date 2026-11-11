import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, ArrowUpRight, HeartPulse, Stethoscope, Bone, Baby, Brain, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-top max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="footer-brand-column">
          <Link to="/" className="site-brand footer-brand">
            <span className="site-brand-icon"><Activity className="w-5 h-5" /></span>
            <span className="site-brand-name">Medi<span>Slot</span><small>CARE, CONNECTED</small></span>
          </Link>
          <p>Thoughtful healthcare coordination, from finding the right specialist to following your clinic queue.</p>
          <div className="footer-privacy-note"><ShieldCheck className="w-4 h-4" /> Designed around organized, private patient experiences</div>
        </div>

        <div className="footer-link-column">
          <h4>Explore</h4>
          <Link to="/">Home <ArrowUpRight className="w-3 h-3" /></Link>
          <Link to="/doctors">Find doctors <ArrowUpRight className="w-3 h-3" /></Link>
          <Link to="/queue-display">Live queue display <ArrowUpRight className="w-3 h-3" /></Link>
        </div>

        <div className="footer-link-column">
          <h4>Your account</h4>
          <Link to="/login">Sign in <ArrowUpRight className="w-3 h-3" /></Link>
          <Link to="/register">Create account <ArrowUpRight className="w-3 h-3" /></Link>
        </div>

        <div className="footer-specialty-column">
          <h4>Care categories</h4>
          <div className="footer-specialty-grid">
            <span><HeartPulse className="w-3.5 h-3.5" /> Cardiology</span>
            <span><Sparkles className="w-3.5 h-3.5" /> Dermatology</span>
            <span><Baby className="w-3.5 h-3.5" /> Pediatrics</span>
            <span><Bone className="w-3.5 h-3.5" /> Orthopedics</span>
            <span><Brain className="w-3.5 h-3.5" /> Neurology</span>
            <span><Stethoscope className="w-3.5 h-3.5" /> General care</span>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} MediSlot. All rights reserved.</span>
          <span>Built to make every visit feel more organized.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
