import React from "react";
import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";
import { getLogs } from "../lib/logger";

export default function LogsPanel() {
  const logs = getLogs();
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Application Logs (latest)</Typography>
      <List>
        {logs.length === 0 && (
          <Typography variant="body2">No logs yet.</Typography>
        )}
        {logs.map((l, i) => (
          <ListItem key={i} divider>
            <ListItemText
              primary={`${new Date(l.time).toLocaleString()} [${l.level}] ${
                l.message
              }`}
              secondary={JSON.stringify(l.meta)}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
