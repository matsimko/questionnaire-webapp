import React, { useRef, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  Tooltip,
  IconButton,
  Button,
  Paper,
} from "@mui/material";
import ConfirmDialogIconButton from "../basic/ConfirmDialogIconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { OptionMenu } from "../basic/OptionMenu";
import { EditableText } from "../basic/EditableText";
import Question from "./Question";
import { useSectionController } from "../../controllers/useSectionController";
import {
  useQnaireContext,
  useSectionSelect,
} from "../../providers/QnaireProvider";
import { getSelectedStyle } from "../../style";
import PasteButton from "./PasteButton";
import { QuestionTypes } from "../../QuestionTypes";
import HorizontalDragBox from "../basic/HorizontalDragBox";
import { Resources } from "../../data/Resources";
import CollapseButton from "../basic/CollapseButton";
import ErrorList from "../basic/ErrorList";
import { useScrollWhenSelected } from "../../hooks";

const Questions = React.memo(({ questions, isPublished }) =>
  questions.map((q, index) => {
    const Question = QuestionTypes[q.resourcetype].component;
    return (
      <Grid item xs={12} key={q.id}>
        <Question id={q.id} index={index} isPublished={isPublished} />
      </Grid>
    );
  })
);

function Section({ id, index, isPublished }) {
  const { name, desc, order_num, questions, update, destroy, error } =
    useSectionController(id);
  const { isSelected, select } = useSectionSelect(id);
  const [showQuestions, setShowQuestions] = useState(true);
  const scrollRef = useRef(null);
  useScrollWhenSelected(isSelected, scrollRef);
  const style = {
    display: "flex",
    pt: 2,
  };
  if (isSelected) {
    Object.assign(style, {
      pl: 1,
      borderLeft: 2,
      borderColor: "primary.light", //"secondary.light",
    });
  }

  return (
    <Draggable draggableId={id.toString()} index={index}>
      {(draggableProvided) => (
        <Box
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          // sx={{
          //   backgroundColor: (theme) =>
          //     theme.palette.background.default,
          // }}
        >
          <Droppable droppableId={id.toString()} type={Resources.QUESTIONS}>
            {({ innerRef, droppableProps, placeholder }) => (
              <Box ref={innerRef} {...droppableProps}>
                <Paper
                  sx={{
                    backgroundColor: "background.default",
                    px: 2,
                    pb: 2,
                    ...getSelectedStyle(isSelected),
                  }}
                  elevation={4}
                  className="clickable"
                  onClick={select}
                  ref={scrollRef}
                >
                  <HorizontalDragBox
                    dragHandleProps={draggableProvided.dragHandleProps}
                  >
                    <Grid container>
                      {isSelected && (
                        <Grid item xs={12} container justifyContent="flex-end">
                          <Grid item xs="auto">
                            <CollapseButton
                              collapsed={!showQuestions}
                              onClick={() =>
                                setShowQuestions(
                                  (showQuestions) => !showQuestions
                                )
                              }
                            ></CollapseButton>
                          </Grid>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <EditableText
                          editable={isSelected}
                          value={name}
                          error={error.name}
                          onChange={(name) => {
                            update({ name });
                          }}
                          selectOnFocus={true}
                          typographyProps={{ variant: "h4" }}
                          textFieldProps={{
                            fullWidth: true,
                            id: "section-name",
                            label: "Sekce",
                            required: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} mt={2}>
                        <EditableText
                          editable={isSelected}
                          value={desc}
                          error={error.desc}
                          onChange={(desc) => {
                            update({ desc });
                          }}
                          textFieldProps={{
                            fullWidth: true,
                            id: "section-desc",
                            label: "Popis",
                            multiline: true,
                            minRows: 2,
                          }}
                        />
                      </Grid>

                      {isSelected && (
                        <Grid
                          item
                          container
                          xs={12}
                          justifyContent="flex-end"
                          sx={{ pt: 1 }}
                        >
                          <Grid item xs="auto">
                            <ConfirmDialogIconButton
                              icon={DeleteIcon}
                              title={"Smazat sekci a všechny otázky v ní?"}
                              onConfirm={destroy}
                              tooltip={"Smazat"}
                              disabled={isPublished}
                            />
                          </Grid>
                          <Grid item xs="auto">
                            <PasteButton disabled={isPublished} />
                          </Grid>
                          {/* <Grid item xs="auto">
                           <OptionMenu></OptionMenu>
                          </Grid> */}
                        </Grid>
                      )}
                      {error && (
                        <Grid item xs={12} mt={1}>
                          <ErrorList error={error} />
                        </Grid>
                      )}
                    </Grid>
                  </HorizontalDragBox>
                </Paper>
                <Box
                  sx={{ ...style, display: showQuestions ? "block" : "none" }}
                >
                  <Grid container spacing={2}>
                    <Questions
                      questions={questions}
                      isPublished={isPublished}
                    />
                  </Grid>
                </Box>
                {placeholder}
              </Box>
            )}
          </Droppable>
        </Box>
      )}
    </Draggable>
  );
}

export default React.memo(Section);
