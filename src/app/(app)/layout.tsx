import { Sidebar } from "@/components/sidebar";
import { StockTicker } from "@/components/stock-ticker";
import { Walkthrough } from "@/components/walkthrough";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 h-screen overflow-y-auto bg-background">
        <StockTicker />
        <div className="flex-1 min-h-0">{children}</div>
        <Walkthrough />
      </main>
    </div>
  );
}
