// Floodlight Folklore component reminder: this is a full-screen game stage, not a dashboard.
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import GameCanvas from "@/components/GameCanvas";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><GameCanvas /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;

