import {
  ChartNoAxesCombined,
  CloudCog,
  Menu,
  Play,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Experience from "../components/Experience";

const services = [
  ["Search Opportunity Analysis", "We map demand, competitors, and ranking gaps to focus effort where it can create measurable business value."],
  ["Content Optimization", "We improve information architecture, intent coverage, and on-page signals without flattening your brand voice."],
  ["Keyword Research", "Search themes are grouped by intent and customer journey, then prioritized by relevance, difficulty, and opportunity."],
  ["Continuous Testing", "Every release is measured against a clear baseline so technical and content decisions improve with evidence."],
  ["E-Commerce SEO", "Category, product, and faceted navigation strategies help shoppers find the right products from organic search."],
  ["Website Migrations", "Redirect mapping, crawl validation, and launch monitoring protect organic visibility during platform changes."],
];

const questions = [
  [
    "Q. What is SEO and does my business need SEO?",
    "Search Engine Optimization is the practice of ranking a website. Yes, your business should be investing in SEO. It offers a way to increase traffic without paying for every click.",
  ],
  ["Q. What are Google's most important ranking factors?", "Helpful content, technical quality, links, intent match, and strong user experience all contribute."],
  ["Q. What is the difference between On-Page SEO and technical SEO?", "On-page SEO improves content and page meaning; technical SEO improves crawlability, speed, and structure."],
  ["Q. Does social media help to increase my website's rank?", "Social media does not replace SEO, but it can broaden reach and attract qualified organic signals."],
  ["Q. How do I create SEO-friendly content?", "Start from search intent, use clear structure, answer the topic fully, and keep pages fast and accessible."],
  ["Q. Why has my organic traffic dropped?", "Algorithm shifts, technical errors, lost links, seasonality, or stronger competition can all reduce traffic."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Sark",
  description: "Technical SEO, content strategy, and continuous experimentation for durable organic growth.",
  serviceType: ["Technical SEO", "Content strategy", "SEO audits", "Website migrations"],
};

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" />
      Sark
    </span>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Experience />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="site-header">
        <a href="#main-content" aria-label="Sark home"><Brand /></a>
        <button className="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false">
          <Menu aria-hidden="true" />
        </button>
        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#team">Team</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <a className="button button-dark" href="#contact">Request an audit</a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero section-beige">
          <div className="hero-copy">
            <h1>The right SEO to<br />boost <mark>your rankings</mark></h1>
            <p>Search engine optimization is an ever-changing practice dictated by updates in algorithms &amp; technological innovation. Get discovered by the right SEO agency.</p>
            <a className="button button-green" href="#contact">Get Started Free</a>
            <div className="hero-proof" aria-label="Customer ratings">
              <div className="avatars">
                <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" alt="Sark customer" width={45} height={45} />
                <span /><span />
              </div>
              <div><strong>38,482</strong><span>Happy Customers</span></div>
              <div><strong>4.8/5</strong><span className="stars">Rating</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="robot-anchor robot-anchor--hero" data-robot-anchor="hero"><span className="robot-loader" /></div>
          </div>
        </section>

        <section className="trust-band" aria-labelledby="trusted-heading">
          <p id="trusted-heading">Trusted by 1,000+ growing brands</p>
          <ul aria-label="Trusted brands">
            <li><span className="logo-square microsoft" />Microsoft</li>
            <li><span className="logo-airbnb" />airbnb</li>
            <li><span className="logo-dot" />OLA</li>
            <li>Walmart<span className="spark">*</span></li>
            <li><span className="google-blue">G</span><span className="google-red">o</span><span className="google-yellow">o</span><span className="google-blue">g</span><span className="google-green">l</span><span className="google-red">e</span></li>
          </ul>
        </section>

        <section className="features section-white" id="features">
          <div className="robot-anchor robot-anchor--features" data-robot-anchor="features" aria-hidden="true" />
          <div className="section-heading"><h2><mark>Awesome features</mark><br />optimizing your website</h2></div>
          <div className="feature-grid">
            <article><ChartNoAxesCombined aria-hidden="true" /><h3>Technical foundation</h3><p>Crawlability, performance, structured data, and internal linking are reviewed as one connected system.</p></article>
            <article><CloudCog aria-hidden="true" /><h3>Evidence-led strategy</h3><p>Search demand and business goals shape a focused roadmap with clear priorities and measurable outcomes.</p></article>
            <article><Settings aria-hidden="true" /><h3>Continuous improvement</h3><p>We monitor releases, rankings, and conversions so each iteration is informed by real customer behavior.</p></article>
          </div>
        </section>

        <section className="video-split section-beige" id="about">
          <div className="video-arch" data-robot-anchor="about">
            <button className="play-button" type="button" aria-label="Play overview video"><Play aria-hidden="true" /></button>
          </div>
          <div className="split-copy">
            <h2>We favor increasing the <mark>visibility of the website</mark></h2>
            <p>At its core, search engine optimization is increasing your website&apos;s visibility in the results of major search engines and giving users what they need.</p>
            <div className="stats">
              <div><strong>70k+</strong><span>SEO Projects completed</span></div>
              <div><strong>156+</strong><span>Satisfied Customers</span></div>
            </div>
          </div>
        </section>

        <section className="services section-white" id="services">
          <div className="section-heading"><h2>Qualities &amp; customizable<br /><mark className="squiggle">ideal SEO services</mark></h2></div>
          <div className="service-grid">
            {services.map(([title, description]) => (
              <article key={title}>
                <h3>{title}</h3><p>{description}</p><a href="#contact">Discover More <span>+</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="team section-beige" id="team">
          <div className="team-intro">
            <h2><mark>Meet our amazing SEO</mark><br />team for your business</h2>
            <p>Our SEO team will take the time to truly understand your business, your goals, and your mission. We recognize that your needs are unique.</p>
          </div>
          <div className="team-grid">
            <article><Image src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=360&h=360&q=80" alt="Esther Howard, Senior SEO Manager" width={282} height={282} sizes="(max-width: 680px) 282px, (max-width: 980px) 40vw, 282px" /><h3>Esther Howard</h3><p>Senior SEO Manager</p></article>
            <article className="team-empty" data-robot-anchor="team" aria-label="Open team position" />
            <article><Image src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=360&h=360&q=80" alt="Savannah Nguyen, Account Manager" width={282} height={282} sizes="(max-width: 680px) 282px, (max-width: 980px) 40vw, 282px" /><h3>Savannah Nguyen</h3><p>Account Manager</p></article>
          </div>
        </section>

        <section className="faq section-white" id="faq">
          <div className="section-heading"><h2><mark>Frequently asked</mark><br />questions</h2></div>
          <div className="accordion">
            {questions.map(([question, answer], index) => (
              <details key={question} open={index === 0}><summary>{question}</summary><p>{answer}</p></details>
            ))}
          </div>
        </section>

        <section className="cta" id="contact">
          <h2>Are you interested in<br />boosting your SEO ranking?</h2>
          <p>If you want to evolve your digital performance and learn more about how our SEO services can help, get in touch with the team today.</p>
          <a className="button button-dark" href="mailto:hello@sark.example">Contact With Us</a>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <a href="#main-content"><Brand /></a>
            <p>Search strategy grounded in technical quality, useful content, and measurable business outcomes.</p>
            <a className="footer-email" href="mailto:hello@sark.example">hello@sark.example</a>
          </div>
          <div><h3>Services</h3><a href="#services">Technical SEO</a><a href="#services">Content strategy</a><a href="#services">E-commerce SEO</a><a href="#services">Site migrations</a></div>
          <div><h3>Company</h3><a href="#about">Our approach</a><a href="#team">Team</a><a href="#faq">FAQ</a><a href="#contact">Contact</a></div>
          <div><h3>Contact Info</h3><p>455 West Orchard Street<br />Kings Mountain, NC 280867</p><a href="tel:+0882466422710">+088 (246) 642-27-10</a><a href="mailto:example@gmail.com">example@gmail.com</a></div>
        </div>
        <p className="copyright">© 2026 Sark. All rights reserved.</p>
      </footer>
    </>
  );
}
