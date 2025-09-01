import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Paper, Typography, CircularProgress, Button } from "@mui/material";
import { getMappings, addClick } from "../lib/storage";
import { log } from "../lib/logger";

function getCoarseInfo(timeoutMs = 700) {
  return new Promise((resolve) => {
    const fallback = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
      language: navigator.language || "unknown",
      coords: null,
    };

    if (!navigator.geolocation) {
      return resolve(fallback);
    }

    let done = false;
    const id = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(fallback);
      }
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (done) return;
        done = true;
        clearTimeout(id);
        resolve({
          ...fallback,
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        });
      },
      () => {
        if (done) return;
        done = true;
        clearTimeout(id);
        resolve(fallback);
      },
      { maximumAge: 60_000, timeout: timeoutMs, enableHighAccuracy: false }
    );
  });
}

export default function RedirectHandler() {
  const { code } = useParams();
  const [state, setState] = useState({ status: "checking", message: "" });

  useEffect(() => {
    async function run() {
      const mappings = getMappings();
      const mapping = mappings[code];
      if (!mapping) {
        setState({ status: "error", message: "Short link not found." });
        log("error", "redirect: not found", { code });
        return;
      }
      const now = new Date();
      if (new Date(mapping.expiresAt) <= now) {
        setState({ status: "error", message: "Short link has expired." });
        log("info", "redirect: expired", { code, mapping });
        return;
      }

      setState({ status: "redirecting", message: "Redirecting..." });

      const coarse = await getCoarseInfo(700);
      const click = {
        time: new Date().toISOString(),
        source: document.referrer || "direct",
        timezone: coarse.timezone,
        language: coarse.language,
        coords: coarse.coords,
      };

      try {
        addClick(code, click);
        log("info", "Recorded click", { code, click });
      } catch (err) {
        log("error", "Failed to record click", { code, err });
      }
      try {
        window.location.replace(mapping.longUrl);
      } catch (err) {
        setState({ status: "error", message: "Failed to redirect." });
        log("error", "redirect failed", { code, err });
      }
    }

    run();
  }, [code]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Redirect</Typography>
      {state.status === "checking" && <Typography>Checking link...</Typography>}
      {state.status === "redirecting" && (
        <>
          <Typography>{state.message}</Typography>
          <CircularProgress sx={{ mt: 2 }} />
          <Typography sx={{ mt: 2 }}>
            If redirect does not happen,{" "}
            <Button variant="text" onClick={() => window.location.reload()}>
              retry
            </Button>
          </Typography>
        </>
      )}
      {state.status === "error" && (
        <Typography color="error">{state.message}</Typography>
      )}
    </Paper>
  );
}
