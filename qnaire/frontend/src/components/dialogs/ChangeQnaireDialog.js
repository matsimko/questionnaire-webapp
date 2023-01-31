import * as React from "react";
import BasePublishQnaireDialog from "./BasePublishQnaireDialog";

export default function ChangeQnaireDialog({ name, ...props }) {
  return (
    <BasePublishQnaireDialog
      title={`Změnit dotazník "${name}"`}
      buttonText="Změnit"
      {...props}
    />
  );
}
