import * as React from "react";
import Rating from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";

const iconSize = 60;

const icons5 = [
  <SentimentVeryDissatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentDissatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedAltIcon sx={{ fontSize: iconSize }} />,
  <SentimentVerySatisfiedIcon sx={{ fontSize: iconSize }} />,
];

const icons4 = [
  <SentimentVeryDissatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentDissatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedAltIcon sx={{ fontSize: iconSize }} />,
];

const icons3 = [
  <SentimentVeryDissatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedAltIcon sx={{ fontSize: iconSize }} />,
];

const icons2 = [
  <SentimentVeryDissatisfiedIcon sx={{ fontSize: iconSize }} />,
  <SentimentSatisfiedAltIcon sx={{ fontSize: iconSize }} />,
];

const icons1 = [<SentimentSatisfiedAltIcon sx={{ fontSize: iconSize }} />];

const iconsMap = {
  1: icons1,
  2: icons2,
  3: icons3,
  4: icons4,
  5: icons5,
};

function getIconContainer(max) {
  const icons = iconsMap[max];
  return (props) => {
    const { value, ...other } = props;
    return <span {...other}>{icons[value - 1]}</span>;
  };
}

export default function SmileyRating({ onChange, ...props }) {
  return (
    <Rating
      {...props}
      onChange={(event, value) => {
        onChange(value);
      }}
      IconContainerComponent={getIconContainer(props.max)}
      highlightSelectedOnly
    />
  );
}
