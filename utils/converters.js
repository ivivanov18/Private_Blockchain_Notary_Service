module.exports.ascii_to_hexa = str2Convert => {
  const arrHex = [];
  for (let charac = 0; charac < str2Convert.length; charac++) {
    const hex = Number(str2Convert.charCodeAt(charac)).toString(16);
    arrHex.push(hex);
  }

  return arrHex.join("");
};

module.exports.hexa_to_ascii = str2Convert => {
  const hex = str2Convert.toString();
  let ascii = "";
  for (let charac = 0; charac < hex.length; charac += 2) {
    ascii += String.fromCharCode(parseInt(hex.substr(charac, 2), 16));
  }

  return ascii;
};
