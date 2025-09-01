import React from "react";
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getMappings } from "../lib/storage";
import { getClicks } from "../lib/storage";
import { log } from "../lib/logger";

export default function StatsPage() {
  const mappings = Object.values(getMappings()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  React.useEffect(() => {
    log("info", "Viewed statistics page", { count: mappings.length });
  }, []);

  if (mappings.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>No short links yet.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Shortened URLs & Analytics
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Short URL</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Clicks</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map((m) => (
              <Row key={m.code} mapping={m} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function Row({ mapping }) {
  const [open, setOpen] = React.useState(false);
  const clicks = getClicks(mapping.code);
  return (
    <>
      <TableRow>
        <TableCell>
          <a href={`/r/${mapping.code}`} target="_blank" rel="noreferrer">
            {window.location.origin}/r/{mapping.code}
          </a>
        </TableCell>
        <TableCell
          style={{
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {mapping.longUrl}
        </TableCell>
        <TableCell>{new Date(mapping.createdAt).toLocaleString()}</TableCell>
        <TableCell>{new Date(mapping.expiresAt).toLocaleString()}</TableCell>
        <TableCell>{clicks.length}</TableCell>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen((s) => !s)}
            aria-label="expand"
          >
            <ExpandMoreIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div style={{ padding: 8 }}>
              <Typography variant="subtitle2">
                Click details ({clicks.length})
              </Typography>
              {clicks.length === 0 && (
                <Typography variant="body2">No clicks yet.</Typography>
              )}
              {clicks.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    marginTop: 8,
                    borderBottom: "1px solid #eee",
                    paddingBottom: 6,
                  }}
                >
                  <Typography variant="body2">
                    {new Date(c.time).toLocaleString()}
                  </Typography>
                  <Typography variant="caption">Source: {c.source}</Typography>
                  <br />
                  <Typography variant="caption">
                    Timezone: {c.timezone}, Language: {c.language}
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    Coords:{" "}
                    {c.coords
                      ? `${c.coords.lat.toFixed(3)}, ${c.coords.lon.toFixed(3)}`
                      : "n/a"}
                  </Typography>
                </div>
              ))}
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
