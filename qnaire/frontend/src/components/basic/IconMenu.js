import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function IconMenu({ title, iconElement, items }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item) => {
    handleClose();

    if (!item) {
      return;
    }

    if (item.path) {
      return navigate(item.path);
    } else if (item.callback) {
      item.callback(navigate);
    }
  };

  const buttonId = `${title}-icon-button`;
  const menuId = `${title}-menu`;

  return (
    <div>
      <Tooltip title={title}>
        <IconButton
          id={buttonId}
          aria-controls={open ? { menuId } : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          {iconElement}
        </IconButton>
      </Tooltip>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": { buttonId },
        }}
      >
        {items.map((item) => (
          <MenuItem onClick={() => handleItemClick(item)} key={item.name}>
            {item.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
