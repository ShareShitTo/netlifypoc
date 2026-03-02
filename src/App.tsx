import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { HomePage } from "@/pages/home";
import { PageOne } from "@/pages/page1";
import { PageTwo } from "@/pages/page2";
import { PageThree } from "@/pages/page3";
import { PageFour } from "@/pages/page4";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/page1" element={<PageOne />} />
          <Route path="/page2" element={<PageTwo />} />
          <Route path="/page3" element={<PageThree />} />
          <Route path="/page4" element={<PageFour />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
