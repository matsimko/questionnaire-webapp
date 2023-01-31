export function ensurePrecision(value, step) {
  const stepDecimalPart = step.toString().split(".")[1];
  const stepPrecision = stepDecimalPart ? stepDecimalPart.length : 0;

  const order = Math.pow(10, stepPrecision);
  return Math.round(value * order) / order;
  //return Number(value.toFixed(stepPrecision));
}

export function dictToSortedArray(dict, sortFunc, mapFunc = null) {
  const array = Object.entries(dict).sort(sortFunc);
  if (mapFunc) {
    array.map(mapFunc);
  }
  return array;
}

export function downloadTextFile(text, name) {
  const a = document.createElement("a");
  const type = name.split(".").pop();
  a.href = URL.createObjectURL(
    new Blob([text], { type: `text/${type === "txt" ? "plain" : type}` })
  );
  a.download = name;
  a.click();
}

export function shallowCompare(prevObj, newObj){
  for (key in newObj){
      if(newObj[key] !== prevObj[key]) return true;
  }
  return false;
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

