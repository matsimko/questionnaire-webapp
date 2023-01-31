import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppContext } from "../../providers/AppContextProvider";
import { useQnaireListController } from "../../controllers/useQnaireListController";
import CreateQnaireDialog from "../dialogs/CreateQnaireDialog";
import { PageAction } from "../../PageAction";
import QnaireListItem from "./QnaireListItem";

export function QnairesPage() {
  const { qnaires, isLoaded, create } = useQnaireListController();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { setPageActions } = useAppContext();
  useEffect(() => {
    const pageActions = [
      new PageAction("Vytvořit dotazník", <AddIcon />, () =>
        setShowCreateDialog(true)
      ),
    ];
    setPageActions(pageActions);
    return () => setPageActions([]);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <React.Fragment>
      <Typography variant="h1" mb={2}>
        Moje dotazníky
      </Typography>
      <Grid container spacing={3} alignItems="stretch">
        {qnaires.map((qnaire) => (
          <Grid item xs={12} sm={6} key={qnaire.id}>
            <QnaireListItem id={qnaire.id} />
          </Grid>
        ))}
      </Grid>
      <CreateQnaireDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={create}
      />
    </React.Fragment>
  );
}
