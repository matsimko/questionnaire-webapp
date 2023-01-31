import React, { useEffect } from "react";
import {
  Grid,
  IconButton,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from "@mui/material";
import { EditableText } from "../basic/EditableText";
import { ChoiceIcon } from "../basic/ChoiceIcon";
import ClearIcon from "@mui/icons-material/Clear";
import { useChoiceController } from "../../controllers/useChoiceController";
import ScrollableSelect from "../basic/ScrollableSelect";

export default function Choice({
  id,
  editable,
  checkbox,
  textFieldProps,
}) {
  const { text, skip_to_section, sections, update, destroy, error } =
    useChoiceController(id);

  return (
    <Grid container alignItems="center">
      <Grid item xs="auto">
        <ChoiceIcon checkbox={checkbox} />
      </Grid>
      <Grid item xs>
        <EditableText
          value={text}
          error={error.text}
          editable={editable}
          selectOnFocus={true}
          onChange={(text) => update({ text })}
          textFieldProps={{ ...textFieldProps }}
        />
      </Grid>
      {editable && !checkbox && (
        <Grid item xs={3} sx={{ mb: "auto" }}>
          <FormControl fullWidth size="small" variant="standard">
            <InputLabel id="skip-to-section-label">Přeskočit na</InputLabel>
            <ScrollableSelect
              label="Přeskočit na"
              id="skip-to-section-select"
              labelId="skip-to-section-label"
              value={skip_to_section ? skip_to_section.toString() : ""}
              onChange={(e) =>
                update({
                  skip_to_section: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
            >
              <MenuItem value="">&#8212;</MenuItem>
              {sections.map((section) => (
                <MenuItem value={section.id} key={section.id}>
                  {section.name}
                </MenuItem>
              ))}
            </ScrollableSelect>
          </FormControl>
        </Grid>
      )}
      {editable && (
        <Grid item xs="auto">
          <IconButton onClick={destroy}>
            <ClearIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
}

Choice.defaultProps = {
  value: "",
  editable: true,
  checkbox: false,
  textFieldProps: {
    //I specify the label text so that the TextField aligns with the Select, but I hide the label
    label: "Text",
    InputLabelProps: { sx: { display: "none" } },
    variant: "standard",
    size: "small",
    fullWidth: true,
    required: true,
  },
};
