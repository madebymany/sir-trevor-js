function diffText(before, after) {
  var pos1 = -1,
      pos2 = -1,
      after_len = after.length,
      before_len = before.length;

  for (var i = 0; i < after_len; i++) {
    if (pos1 == -1 && before.substr(i, 1) != after.substr(i, 1)) {
      pos1 = i - 1;
    }

    if (pos2 == -1 &&
        before.substr(before_len - i - 1, 1) !=
        after.substr(after_len - i - 1, 1)
      ) {
      pos2 = i;
    }
  }

  return {
    result: after.substr(pos1, after_len - pos2 - pos1 + 1),
    pos1: pos1,
    pos2: pos2
  };
}