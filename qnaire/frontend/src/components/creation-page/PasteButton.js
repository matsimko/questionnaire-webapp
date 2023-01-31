import * as React from "react";
import { IconButton, Tooltip } from "@mui/material";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useQnaireContext } from "../../providers/QnaireProvider";

export default function PasteButton({ disabled }) {
  const { paste } = useQnaireContext();

  return (
    <Tooltip title="Vložit">
      <span>
        <IconButton onClick={paste} disabled={disabled}>
          <ContentPasteIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
