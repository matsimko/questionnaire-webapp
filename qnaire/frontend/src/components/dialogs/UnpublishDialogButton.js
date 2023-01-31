import * as React from "react";
import ConfirmDialogButton from "../basic/ConfirmDialogButton";

export default function UnpublishDialogButton({ onConfirm, buttonProps }) {
  return (
    <ConfirmDialogButton
      buttonProps={buttonProps}
      buttonText="Zrušit publikaci"
      title="Zrušit publikaci dotazníku a smazat všechny dosud nasbírané odpovědi na něj?"
      onConfirm={onConfirm}
      confirmText="Ano"
      cancelText="Ne"
    />
  );
}
