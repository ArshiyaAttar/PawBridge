export default function About() {
  return <main className="container paw-section">
    <span className="eyebrow">OUR STORY</span>
    <h1 className="section-title">Building a bridge between <span>pets and people.</span></h1>
    <p className="section-description">PawBridge is a pet adoption and rescue management platform designed to connect adopters, shelters, rescuers and communities.</p>
    <div className="row g-4 mt-4">
      <div className="col-md-4"><div className="feature-card"><h4>Our mission</h4><p>Help animals find safe, loving homes.</p></div></div>
      <div className="col-md-4"><div className="feature-card"><h4>Our vision</h4><p>A community where every animal receives care and dignity.</p></div></div>
      <div className="col-md-4"><div className="feature-card"><h4>Our values</h4><p>Compassion, responsibility, transparency and kindness.</p></div></div>
    </div>
  </main>;
}
