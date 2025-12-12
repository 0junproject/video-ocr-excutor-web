export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto p-10 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4">User Guide</h1>
      <p className="text-muted-foreground mb-8">
        This is a scrollable page demonstration. Use this layout for documentation, 
        privacy policies, or other informational content.
      </p>
      
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <section key={i} className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Section {i}</h2>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
