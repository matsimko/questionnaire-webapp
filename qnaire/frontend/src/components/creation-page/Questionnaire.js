import React, { useEffect, useReducer, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Preview";
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { EditableText } from "../basic/EditableText";
import Section from "./Section";
import { useQnaireController } from "../../controllers/useQnaireController";
import { useQnaireSelect } from "../../providers/QnaireProvider";
import { getSelectedStyle } from "../../style";
import { Resources } from "../../data/Resources";
import ErrorList from "../basic/ErrorList";
import { useScrollWhenSelected } from "../../hooks";
import ConfirmDialogIconButton from "../basic/ConfirmDialogIconButton";
import { OptionMenu } from "../basic/OptionMenu";
import CheckMenuItem from "../basic/CheckMenuItem";
import PublishQnaireDialog from "../dialogs/PublishQnaireDialog";
import UnpublishDialogButton from "../dialogs/UnpublishDialogButton";
import QnaireLinkDialog from "../dialogs/QnaireLinkDialog";
import QnaireStatsDialog from "../dialogs/QnaireStatsDialog";
import QnaireExportDialog from "../dialogs/QnaireExportDialog";

const Sections = React.memo(({ sections, isPublished }) =>
  sections.map((section, index) => (
    <Grid item xs={12} key={section.id}>
      <Section id={section.id} index={index} isPublished={isPublished} />
    </Grid>
  ))
);

export function Questionnaire({ id }) {
  const {
    name,
    desc,
    private: isPrivate, //private is a reserved word...
    anonymous: isAnonymous,
    published: isPublished,
    sections,
    update,
    destroy,
    publish,
    isLoaded,
    handleDragEnd,
    error,
    previewLink,
    exportResult,
    getLink,
    getStats,
  } = useQnaireController(id);
  const { isSelected, select } = useQnaireSelect(id);
  const scrollRef = useRef(null);
  useScrollWhenSelected(isSelected, scrollRef);

  useEffect(() => {
    if (isLoaded) {
      select();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="qnaire" type={Resources.SECTIONS}>
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef}>
            <Paper
              sx={{ backgroundColor: "background.default" }}
              variant="outlined"
              ref={scrollRef}
            >
              <Grid
                container
                className="clickable"
                sx={{ /* borderBottom: 2, */ ...getSelectedStyle(isSelected) }}
                p={2}
                onClick={select}
              >
                <Grid
                  item
                  container
                  xs={12}
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs="auto">
                    <Tooltip title="Zobrazit náhled">
                      <Link
                        to={previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconButton>
                          <PreviewIcon fontSize="large" />
                        </IconButton>
                      </Link>
                    </Tooltip>
                  </Grid>
                  {!isPublished && (
                    <Grid item xs="auto">
                      <PublishQnaireDialog
                        name={name}
                        isPrivate={isPrivate}
                        isAnonymous={isAnonymous}
                        onSubmit={publish}
                        buttonProps={{ variant: "contained" }}
                      />
                    </Grid>
                  )}
                  {isPublished && (
                    <React.Fragment>
                      <Grid item xs="auto">
                        <UnpublishDialogButton
                          buttonProps={{
                            variant: "outlined",
                          }}
                          onConfirm={() => update({ published: false })}
                        />
                      </Grid>
                      <Grid item xs="auto">
                        <QnaireStatsDialog
                          getStats={getStats}
                          buttonProps={{ variant: "outlined" }}
                        />
                      </Grid>
                      <Grid item xs="auto">
                        <QnaireExportDialog
                          exportResult={exportResult}
                          buttonProps={{ variant: "contained" }}
                        />
                      </Grid>
                      <Grid item xs="auto">
                        <QnaireLinkDialog
                          getLink={getLink}
                          buttonProps={{ variant: "contained" }}
                        />
                      </Grid>
                    </React.Fragment>
                  )}
                </Grid>
                <Grid item xs={12} mt={1}>
                  <EditableText
                    editable={isSelected}
                    typographyProps={{ variant: "h1" }}
                    value={name}
                    error={error.name}
                    onChange={(name) => {
                      update({ name });
                    }}
                    textFieldProps={{
                      fullWidth: true,
                      label: "Dotazník",
                      id: "questionnaire-name",
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
                      label: "Popis",
                      id: "questionnaire-desc",
                      multiline: true,
                      minRows: 3,
                    }}
                  />
                </Grid>
                {isSelected && (
                  <Grid
                    item
                    xs={12}
                    container
                    justifyContent="flex-end"
                    sx={{ pt: 1 }}
                  >
                    <Grid item xs="auto">
                      <ConfirmDialogIconButton
                        icon={DeleteIcon}
                        title={
                          isPublished
                            ? "Smazat dotazník a všechny dosud nasbírané odpovědi?"
                            : "Smazat dotazník?"
                        }
                        onConfirm={destroy}
                        tooltip={"Smazat"}
                      />
                    </Grid>
                    <Grid item xs="auto">
                      <OptionMenu>
                        <CheckMenuItem
                          checked={isAnonymous}
                          onChange={(anonymous) => update({ anonymous })}
                          text="Anonymní"
                        />
                        <CheckMenuItem
                          checked={isPrivate}
                          onChange={(isPrivate) =>
                            update({ private: isPrivate })
                          }
                          text="Soukromý"
                        />
                      </OptionMenu>
                    </Grid>
                  </Grid>
                )}
                <ErrorList error={error} />
              </Grid>
            </Paper>
            <Grid container mt={1} spacing={4}>
              <Sections sections={sections} isPublished={isPublished} />
            </Grid>
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
