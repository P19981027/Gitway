export function PageTransition({ children }) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}
