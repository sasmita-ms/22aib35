import React from "react";
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import ShortenPage from "./pages/ShortenPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import RedirectHandler from "./pages/RedirectHandler.jsx";
import LogsPanel from "./components/LogsPanel";

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">
            Shortly — Client-only URL Shortener
          </Typography>
          <div>
            <Button color="inherit" component={Link} to="/">
              Shorten
            </Button>
            <Button color="inherit" component={Link} to="/stats">
              Statistics
            </Button>
            <Button color="inherit" component={Link} to="/logs">
              Logs
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<ShortenPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/r/:code" element={<RedirectHandler />} />
          <Route path="/logs" element={<LogsPanel />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Container>
    </>
  );
}
