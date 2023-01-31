import * as React from "react";
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { useQnaireListItemController } from "../../controllers/useQnaireListItemController";
import PublishQnaireDialog from "../dialogs/PublishQnaireDialog";
import QnaireLinkDialog from "../dialogs/QnaireLinkDialog";
import UnpublishDialogButton from "../dialogs/UnpublishDialogButton";
import { useNavigate } from "react-router-dom";
import QnaireStatsDialog from "../dialogs/QnaireStatsDialog";

function QnaireListItem({ id }) {
  const {
    name,
    desc,
    published: isPublished,
    private: isPrivate,
    anonymous: isAnonymous,
    getLink,
    getStats,
    update,
  } = useQnaireListItemController(id);

  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "space-between",
      }}
    >
      <CardActionArea
        sx={{ flexGrow: 1 }}
        onClick={() => navigate(`/questionnaires/${id}`)}
      >
        <CardContent sx={{ height: "100%" }}>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {desc ? desc.slice(0, 100).concat("...") : ""}
          </Typography>
        </CardContent>
      </CardActionArea>

      {isPublished ? (
        <CardActions>
          <UnpublishDialogButton
            buttonProps={{ size: "small" }}
            onConfirm={() => update({ published: false })}
          />
          <QnaireLinkDialog getLink={getLink} buttonProps={{ size: "small" }} />
          <QnaireStatsDialog getStats={getStats} buttonProps={{ size: "small" }} />
        </CardActions>
      ) : (
        <CardActions>
          <PublishQnaireDialog
            buttonProps={{ size: "small" }}
            name={name}
            isPrivate={isPrivate}
            isAnonymous={isAnonymous}
            onSubmit={(values) => update({ ...values, published: true })}
          />
        </CardActions>
      )}
    </Card>
  );
}

export default React.memo(QnaireListItem);
