import { Link } from "react-router-dom";
import MatchConstellation from "../components/landing/MatchConstellation";

export default function NotFoundPage() {
  return (
    <div className="container-page py-24 flex flex-col items-center text-center">
      <MatchConstellation size="small" />
      <span className="eyebrow mt-8">404</span>
      <h1 className="mt-3 text-3xl font-display font-semibold text-ink">No match found</h1>
      <p className="mt-2 text-ink-muted max-w-sm">
        This page doesn't exist — but we can still help you find a role, or a candidate, that does.
      </p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
