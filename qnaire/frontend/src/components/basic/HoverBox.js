import * as React from "react";
import { Box } from "@mui/material";

export default function HoverBox({ children, ...props }) {
  const [show, setShow] = React.useState(false);
  return (
    <Box
      onMouseOver={() => setShow(true)}
      onMouseOut={() => setShow(false)}
      {...props}
    >
      {show && children}
    </Box>
  );
}
