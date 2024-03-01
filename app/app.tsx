"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PropsWithChildren } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const App = ({ children }: PropsWithChildren<{}>) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

export default App;
