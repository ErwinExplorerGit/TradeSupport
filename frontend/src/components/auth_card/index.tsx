interface AuthCardProps {
  children: React.ReactNode;
  /** Controls max-width of the card; defaults to '420px' */
  maxWidth?: string;
}

/**
 * Shared full-page wrapper used by every public (unauthenticated) page.
 * Renders the gradient background, centred body and white card.
 */
export function AuthCard({ children, maxWidth = "420px" }: AuthCardProps) {
  return (
    <div className="auth-page">
      <main className="auth-body">
        <div className="auth-card" style={{ maxWidth }}>
          {children}
        </div>
      </main>
    </div>
  );
}
