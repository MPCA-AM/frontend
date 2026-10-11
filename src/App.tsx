import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { toast } from "sonner";
import {ModeToggle} from "./components/mode-toggle"
import { AuthProvider } from "@/contexts/AuthContext";

function App() {
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="ml-10">
        <ModeToggle/>
      </div>
        </ThemeProvider>
  )
}

export default App
