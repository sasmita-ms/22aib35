import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { log } from "../lib/logger";
import { existsCode, saveMapping, getMappings } from "../lib/storage";

const DEFAULT_VALID_MIN = 30;
const MAX_BATCH = 5;

function makeRandomCode(len = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function generateUniqueCode() {
  for (let i = 0; i < 8; i++) {
    const c = makeRandomCode(6);
    if (!existsCode(c)) return c;
  }
  let c;
  do {
    c = makeRandomCode(8);
  } while (existsCode(c));
  return c;
}

function isValidShortcode(s) {
  if (!s) return false;
  return /^[A-Za-z0-9\-_]{3,30}$/.test(s);
}

function isValidUrl(s) {
  try {
    const url = new URL(s);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ShortenPage() {
  const [rows, setRows] = useState([
    { longUrl: "", minutes: "", shortcode: "" },
  ]);
  const [message, setMessage] = useState(null);

  function addRow() {
    if (rows.length >= MAX_BATCH) return;
    setRows([...rows, { longUrl: "", minutes: "", shortcode: "" }]);
  }

  function removeRow(index) {
    const r = rows.slice();
    r.splice(index, 1);
    setRows(r);
  }

  function updateRow(index, key, value) {
    const r = rows.slice();
    r[index][key] = value;
    setRows(r);
  }

  function validateAll() {
    const errors = [];
    rows.forEach((r, idx) => {
      if (!r.longUrl.trim()) errors.push(`Row ${idx + 1}: URL required`);
      else if (!isValidUrl(r.longUrl.trim()))
        errors.push(`Row ${idx + 1}: malformed URL`);
      if (
        r.minutes &&
        (!/^\d+$/.test(r.minutes) || parseInt(r.minutes, 10) <= 0)
      ) {
        errors.push(
          `Row ${idx + 1}: validity must be a positive integer (minutes)`
        );
      }
      if (r.shortcode && !isValidShortcode(r.shortcode)) {
        errors.push(
          `Row ${
            idx + 1
          }: shortcode invalid (3-30 chars; letters, numbers, - or _)`
        );
      }
    });
    return errors;
  }

  function handleCreate() {
    const errors = validateAll();
    if (errors.length) {
      setMessage({ type: "error", text: errors.join(" • ") });
      log("error", "Validation failed on create", { errors });
      return;
    }

    const created = [];
    for (const r of rows) {
      let code = r.shortcode.trim() || "";

      // default validity 30 minutes
      const minutes = r.minutes.trim()
        ? parseInt(r.minutes.trim(), 10)
        : DEFAULT_VALID_MIN;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + minutes * 60000);

      if (code) {
        if (!isValidShortcode(code)) {
          setMessage({
            type: "error",
            text: `Shortcode "${code}" invalid format.`,
          });
          log("error", "Shortcode invalid", { code });
          return;
        }
        if (existsCode(code)) {
          setMessage({
            type: "error",
            text: `Shortcode "${code}" already in use.`,
          });
          log("error", "Shortcode collision", { code });
          return;
        }
      } else {
        code = generateUniqueCode();
      }

      const mapping = {
        longUrl: r.longUrl.trim(),
        code,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      saveMapping(code, mapping);
      created.push(mapping);
      log("info", "Created short link", { code, mapping });
    }

    setMessage({
      type: "success",
      text: `Created ${created.length} short link(s).`,
    });

    setRows([{ longUrl: "", minutes: "", shortcode: "" }]);
  }

  const mappings = getMappings();
  const recent = Object.values(mappings)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shorten URLs (up to 5 at once)
      </Typography>

      <Grid container spacing={2}>
        {rows.map((r, idx) => (
          <Grid item xs={12} key={idx}>
            <Box display="flex" gap={2} alignItems="flex-start">
              <TextField
                label={`Original URL #${idx + 1}`}
                fullWidth
                value={r.longUrl}
                onChange={(e) => updateRow(idx, "longUrl", e.target.value)}
                placeholder="https://example.com/path"
              />
              <TextField
                label="Validity (minutes)"
                value={r.minutes}
                onChange={(e) => updateRow(idx, "minutes", e.target.value)}
                sx={{ width: 180 }}
                placeholder="defaults to 30"
              />
              <TextField
                label="Custom shortcode (optional)"
                value={r.shortcode}
                onChange={(e) => updateRow(idx, "shortcode", e.target.value)}
                sx={{ width: 220 }}
                placeholder="my-code"
              />
              <Box>
                {rows.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeRow(idx)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleCreate}>
          Create Short Links
        </Button>
        <Button onClick={addRow} disabled={rows.length >= MAX_BATCH}>
          Add another
        </Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Recently created</Typography>
        {recent.length === 0 && (
          <Typography variant="body2">No links created yet.</Typography>
        )}
        {recent.map((m) => (
          <Box key={m.code} sx={{ my: 1 }}>
            <a href={`/r/${m.code}`} target="_blank" rel="noreferrer">
              {window.location.origin}/r/{m.code}
            </a>
            <Typography variant="caption" sx={{ display: "block" }}>
              Expires: {new Date(m.expiresAt).toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ display: "block" }}>
              Original: {m.longUrl}
            </Typography>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        {message && (
          <Alert
            onClose={() => setMessage(null)}
            severity={message.type}
            sx={{ width: "100%" }}
          >
            {message.text}
          </Alert>
        )}
      </Snackbar>
    </Paper>
  );
}
