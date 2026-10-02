import { Link } from "react-router-dom";
export default function Learn() {
  return (
    <div className="study-page">
      <p className="eyebrow">Build a connected foundation</p>
      <h1>Your learning paths</h1>
      <p className="study-intro">
        Start with the skills you need, or explore something further along.
      </p>
      <div className="concept-grid">
        {[
          [
            "/foundations",
            "Arithmetic & fractions",
            "A starting check, worked examples, and independent practice.",
          ],
          [
            "/path/algebra",
            "Algebra",
            "Expressions, equations, functions, and more.",
          ],
          [
            "/path/geometry",
            "Geometry",
            "Shapes, measurement, and spatial reasoning.",
          ],
        ].map(([to, title, description]) => (
          <Link key={to} to={to} className="study-card concept-card">
            <h2>{title}</h2>
            <p>{description}</p>
            <span className="study-text-button">Explore this path</span>
          </Link>
        ))}
      </div>
      <section className="study-card">
        <h2>Keep useful methods close</h2>
        <p>
          Revisit your saved examples or check your starting point in geometry.
        </p>
        <div className="study-actions">
          <Link to="/rulebook" className="study-button secondary">
            Personal rulebook
          </Link>
          <Link to="/review" className="study-button secondary">
            Review past work
          </Link>
          <Link to="/diagnostic" className="study-text-button">
            Geometry diagnostic
          </Link>
        </div>
      </section>
    </div>
  );
}
