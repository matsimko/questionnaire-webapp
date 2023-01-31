import * as React from "react";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Box } from "@mui/material";

export default function HorizontalDragBox({
  children,
  dragHandleProps,
  innerRef,
  ...props
}) {
  const [show, setShow] = React.useState(false);
  return (
    <Box
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      ref={innerRef}
      {...props} //the props can potentially contain destructured draggableProps
    >
      <Box
        sx={{ display: "flex", justifyContent: "center" }}
        height={24}
        {...dragHandleProps}
      >
        {show && (
          <DragIndicatorIcon
            sx={{
              transform: "rotate(90deg)",
            }}
          />
        )}
      </Box>
      {children}
    </Box>
  );
}
