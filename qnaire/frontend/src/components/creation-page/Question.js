import {
  Grid,
  Select,
  MenuItem,
  Switch,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import * as React from "react";
import { EditableText } from "../basic/EditableText";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Draggable } from "react-beautiful-dnd";
import {
  useQnaireContext,
  useQuestionSelect,
} from "../../providers/QnaireProvider";
import { getSelectedStyle } from "../../style";
import ConfirmDialogIconButton from "../basic/ConfirmDialogIconButton";
import PasteButton from "./PasteButton";
import { QuestionTypes } from "../../QuestionTypes";
import HorizontalDragBox from "../basic/HorizontalDragBox";
import ErrorList from "../basic/ErrorList";
import { useScrollWhenSelected } from "../../hooks";
import ESelect from "../fields/ESelect";

function Question({
  options: QuestionOptions,
  menu: QuestionMenu,
  index,
  id,
  text,
  mandatory,
  //order_num,
  resourcetype,
  error,
  update,
  destroy,
  isPublished,
  ...data
}) {
  const { isSelected, select } = useQuestionSelect(id);
  const { copy, setError } = useQnaireContext();
  const scrollRef = React.useRef(null);
  useScrollWhenSelected(isSelected, scrollRef);

  return (
    <Draggable draggableId={id.toString()} index={index}>
      {(provided) => (
        <Card
          sx={{ px: 2, pb: 2, ...getSelectedStyle(isSelected) }}
          className="clickable"
          onClick={
            !isPublished
              ? select
              : () =>
                  setError({
                    detail:
                      "Nelze měnit obsah otázek, když je dotazník publikovaný.",
                  })
          }
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <HorizontalDragBox dragHandleProps={provided.dragHandleProps}>
            {/* <CardContent> */}
            <Grid container spacing={2} alignItems="top" ref={scrollRef}>
              <Grid item xs /* xs={12} sm={8} */>
                <EditableText
                  onChange={(text) => update({ text })}
                  editable={isSelected}
                  value={text}
                  error={error.text}
                  selectOnFocus={true}
                  typographyProps={{ variant: "h5" }}
                  textFieldProps={{
                    fullWidth: true,
                    id: "question-text",
                    label: "Otázka",
                    required: true,
                  }}
                />
              </Grid>
              <Grid item /* sm="auto" */ xs={12} sm={4}>
                {isSelected ? (
                  <ESelect
                    value={resourcetype}
                    error={error.type}
                    label="Typ otázky"
                    onChange={(e) => update({ resourcetype: e.target.value })}
                    required
                  >
                    {Object.keys(QuestionTypes).map((type) => (
                      <MenuItem value={type} key={type}>
                        {QuestionTypes[type].desc}
                      </MenuItem>
                    ))}
                  </ESelect>
                ) : (
                  <Typography color="text.secondary" textAlign="right">
                    {QuestionTypes[resourcetype].desc}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <QuestionOptions
                  id={id}
                  {...data}
                  update={update}
                  error={error}
                  isSelected={isSelected}
                />
              </Grid>

              {isSelected && (
                <Grid item container xs={12}>
                  <Grid item xs={12}>
                    <Divider light />
                  </Grid>
                  <Grid
                    item
                    container
                    xs={12}
                    justifyContent="flex-end"
                    sx={{ pt: 1 }}
                  >
                    <Grid item xs="auto">
                      <Tooltip title="Zkopírovat">
                        <IconButton onClick={copy}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    {/* <Grid item xs="auto">
                    <Tooltip title="Vyjmout">
                      <IconButton>
                        <ContentCutIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid> */}
                    <Grid item xs="auto">
                      <ConfirmDialogIconButton
                        icon={DeleteIcon}
                        title={"Smazat otázku?"}
                        onConfirm={destroy}
                        tooltip={"Smazat"}
                      />
                    </Grid>
                    <Grid item xs="auto">
                      <PasteButton />
                    </Grid>

                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                    <Grid item xs="auto">
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={mandatory}
                              onChange={(e) =>
                                update({
                                  mandatory: e.target.checked,
                                })
                              }
                            />
                          }
                          label="Povinná"
                        />
                      </FormGroup>
                    </Grid>
                    <Grid item xs="auto">
                      <QuestionMenu
                        id={id}
                        {...data}
                        update={update}
                        error={error}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {error && (
                <Grid item xs={12}>
                  <ErrorList error={error} />
                </Grid>
              )}
            </Grid>
            {/* </CardContent> */}
          </HorizontalDragBox>
        </Card>
      )}
    </Draggable>
  );
}

export default React.memo(Question);
