import * as React from "react";
import BasePublishQnaireDialog from "./BasePublishQnaireDialog";

export default function PublishQnaireDialog({ name, ...props }) {
  return (
    <BasePublishQnaireDialog
      title={`Publikovat dotazník "${name}"`}
      buttonText="Publikovat"
      {...props}
    />
  );
}
