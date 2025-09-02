var jsonHighlight = (function () {
  const pattern =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  function getMatches(data) {
    let json = JSON.stringify(data, undefined, 2);
    let matches = [];
    let lastIndex = 0;
    let match;
    // Use regex exec to capture match positions.
    while ((match = pattern.exec(json)) !== null) {
      // Capture text between matches as plain text.
      if (match.index > lastIndex) {
        matches.push({
          text: json.slice(lastIndex, match.index),
          cls: "plain",
        });
      }
      let text = match[0];
      // Determine css class based on the match.
      let cls = getClass(text);
      if (cls === "key") {
        text = text.substring(0, text.length - 1);
        matches.push({ text, cls });
        matches.push({ text: ":", cls: "plain" });
      } else {
        matches.push({ text, cls });
      }
      lastIndex = pattern.lastIndex;
    }
    // Capture any remaining text after the last match.
    if (lastIndex < json.length) {
      matches.push({ text: json.slice(lastIndex), cls: "plain" });
    }
    return matches;
  }

  function getClass(match) {
    var cls = "number";
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = "key";
      } else {
        cls = "string";
      }
    } else if (/true|false/.test(match)) {
      cls = "boolean";
    } else if (/null/.test(match)) {
      cls = "null";
    }
    return cls;
  }

  // Public methods
  return {
    getMatches: getMatches,
  };
})();
