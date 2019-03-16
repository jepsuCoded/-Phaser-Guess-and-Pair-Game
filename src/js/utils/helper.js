const index2Dto1D = (x, y, length) => {
  return x + y * length;
};

// useless
const copyArray = fromThis => {
  let toThis = [];
  
  for(let i = 0; i < fromThis.length; i++) {
    toThis[i] = [];
    for(let j = 0; j < fromThis[i].length; j++) {
      toThis[i][j] = fromThis[i][j];
    }
  }
  
  return toThis;
};