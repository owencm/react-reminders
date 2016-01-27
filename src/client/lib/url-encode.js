// Format {where: {a: b}, {limit: 1}} becomes where={a:b}&limit=1, but escaped
// This is pretty damn ugly, but gets the job done. Note that each entry in
const urlEncode = (obj) => {
  var list = [];
  for (let key in obj) {
    list.push(`${key}=${escape(JSON.stringify(obj[key]))}`)
  }
  return list.join('&');
}

module.exports = urlEncode;
