import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl text-brass/60 mb-4">404</p>
      <h1 className="font-display text-2xl mb-2">Page not found</h1>
      <p className="text-ink-text/50 mb-8 max-w-sm">
        Whatever you were looking for doesn't have an entry here.
      </p>
      <Link to="/" className="stamp-btn-brass">Back to home</Link>
    </div>
  );
}
