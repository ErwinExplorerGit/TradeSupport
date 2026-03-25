export function VerifyingCard() {
  return (
    <>
      <div className="verify-spinner">
        <div className="verify-spinner-ring" />
      </div>
      <div className="verify-card-header">
        <h1 className="verify-card-title">Verifying your account</h1>
        <p className="verify-card-subtitle">
          Account being verified, please wait…
        </p>
      </div>
    </>
  );
}
