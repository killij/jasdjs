// @ts-nocheck 

//
// Copyright (c) James Killick and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

"use strict";

function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
      ? this.location.source.offset(s)
      : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + offset_s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
      return "end of input";
    },

    other: function(expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== undefined ? options : {};

  var peg$FAILED = {};
  var peg$source = options.grammarSource;

  var peg$startRuleFunctions = { Diagram: peg$parseDiagram };
  var peg$startRuleFunction = peg$parseDiagram;

  var peg$c0 = "title:";
  var peg$c1 = "lifeline:";
  var peg$c2 = "ll:";
  var peg$c3 = "actor:";
  var peg$c4 = "as";
  var peg$c5 = "note";
  var peg$c6 = ":";
  var peg$c7 = ",";
  var peg$c8 = "left of";
  var peg$c9 = "right of";
  var peg$c10 = "over";
  var peg$c11 = ">>";
  var peg$c12 = ">";
  var peg$c13 = "--";
  var peg$c14 = "-";
  var peg$c15 = "+";
  var peg$c16 = "//";
  var peg$c17 = "/*";
  var peg$c18 = "*/";
  var peg$c19 = "\"";

  var peg$r0 = /^[a-zA-Z0-9_]/;
  var peg$r1 = /^[ a-zA-Z0-9]/;
  var peg$r2 = /^[ \t]/;
  var peg$r3 = /^[\r\n]/;

  var peg$e0 = peg$literalExpectation("title:", false);
  var peg$e1 = peg$literalExpectation("lifeline:", false);
  var peg$e2 = peg$literalExpectation("ll:", false);
  var peg$e3 = peg$literalExpectation("actor:", false);
  var peg$e4 = peg$literalExpectation("as", false);
  var peg$e5 = peg$classExpectation([["a", "z"], ["A", "Z"], ["0", "9"], "_"], false, false);
  var peg$e6 = peg$literalExpectation("note", false);
  var peg$e7 = peg$literalExpectation(":", false);
  var peg$e8 = peg$literalExpectation(",", false);
  var peg$e9 = peg$literalExpectation("left of", false);
  var peg$e10 = peg$literalExpectation("right of", false);
  var peg$e11 = peg$literalExpectation("over", false);
  var peg$e12 = peg$otherExpectation("open arrow head");
  var peg$e13 = peg$literalExpectation(">>", false);
  var peg$e14 = peg$otherExpectation("closed arrow head");
  var peg$e15 = peg$literalExpectation(">", false);
  var peg$e16 = peg$otherExpectation("dashed line");
  var peg$e17 = peg$literalExpectation("--", false);
  var peg$e18 = peg$otherExpectation("solid line");
  var peg$e19 = peg$literalExpectation("-", false);
  var peg$e20 = peg$literalExpectation("+", false);
  var peg$e21 = peg$otherExpectation("single line comment");
  var peg$e22 = peg$literalExpectation("//", false);
  var peg$e23 = peg$otherExpectation("multi line comment");
  var peg$e24 = peg$literalExpectation("/*", false);
  var peg$e25 = peg$literalExpectation("*/", false);
  var peg$e26 = peg$otherExpectation("single line text");
  var peg$e27 = peg$classExpectation([" ", ["a", "z"], ["A", "Z"], ["0", "9"]], false, false);
  var peg$e28 = peg$otherExpectation("multi line text");
  var peg$e29 = peg$literalExpectation("\"", false);
  var peg$e30 = peg$otherExpectation("empty line");
  var peg$e31 = peg$otherExpectation("whitespace");
  var peg$e32 = peg$classExpectation([" ", "\t"], false, false);
  var peg$e33 = peg$otherExpectation("text");
  var peg$e34 = peg$otherExpectation("character");
  var peg$e35 = peg$anyExpectation();
  var peg$e36 = peg$otherExpectation("end of line");
  var peg$e37 = peg$classExpectation(["\r", "\n"], false, false);

  var peg$f0 = function(statements) { return statements.filter(x => x) };
  var peg$f1 = function(titleText) { return { type: 'title', text: titleText } };
  var peg$f2 = function(member) {
    return {
    	type: 'declaration',
        participant: 'lifeline',
        id: member.id,
        alias: member.alias
    }
};
  var peg$f3 = function(member) {
    return {
    	type: 'declaration',
        participant: 'actor',
        id: member.id,
        alias: member.alias
    }
};
  var peg$f4 = function(id, alias) { return { type: 'declaration', id, alias }};
  var peg$f5 = function(alias) { return alias };
  var peg$f6 = function() { return text() };
  var peg$f7 = function(location, target, t) {
    return {
    	type: 'note',
        location,
        target: [target],
        text: t
    }
};
  var peg$f8 = function(location, target, t) {
	return {
		type: 'note',
		location,
		target,
		text: t
	}
};
  var peg$f9 = function(head, t) { return t };
  var peg$f10 = function(head, tail) { return tail ? [head, tail] : [head] };
  var peg$f11 = function() { return "leftOf" };
  var peg$f12 = function() { return "rightOf" };
  var peg$f13 = function(source, arrow, target, t) {
	return {
		type: 'message',
		source,
		target,
		arrow,
		text: t
	}
};
  var peg$f14 = function(lineType, headType, modifier) { 
    return {
        headType,
        lineType,
        modifier
    }
};
  var peg$f15 = function() { return 'open' };
  var peg$f16 = function() { return 'closed' };
  var peg$f17 = function() { return 'dashed' };
  var peg$f18 = function() { return 'solid' };
  var peg$f19 = function() { return 'activate' };
  var peg$f20 = function() { return 'deactivate' };
  var peg$f21 = function() {
	return {
		type: 'comment',
		text: text()
	}
};
  var peg$f22 = function() {
	return {
		type: "comment",
    	text: text()
	}
};
  var peg$f23 = function() { return text() };
  var peg$f24 = function() {
	return text().replaceAll('"', '')
};
  var peg$f25 = function() {};
  var peg$f26 = function() {};
  var peg$currPos = 0;
  var peg$savedPos = 0;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = 0;
  var peg$maxFailExpected = [];
  var peg$silentFails = 0;

  var peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function offset() {
    return peg$savedPos;
  }

  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos, endPos, offset) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);

    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset && peg$source && (typeof peg$source.offset === "function")) {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseDiagram() {
    var s0;

    s0 = peg$parseStatements();

    return s0;
  }

  function peg$parseStatements() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseStatement();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseStatement();
    }
    peg$savedPos = s0;
    s1 = peg$f0(s1);
    s0 = s1;

    return s0;
  }

  function peg$parseStatement() {
    var s0;

    s0 = peg$parseTitle();
    if (s0 === peg$FAILED) {
      s0 = peg$parseDeclaration();
      if (s0 === peg$FAILED) {
        s0 = peg$parseNote();
        if (s0 === peg$FAILED) {
          s0 = peg$parseMessage();
          if (s0 === peg$FAILED) {
            s0 = peg$parseSpace();
            if (s0 === peg$FAILED) {
              s0 = peg$parseEmptyLine();
              if (s0 === peg$FAILED) {
                s0 = peg$parseSingleLineComment();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseMultiLineComment();
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseTitle() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c0) {
      s1 = peg$c0;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e0); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSpace();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      s3 = peg$parseText();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseEOL();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        peg$savedPos = s0;
        s0 = peg$f1(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDeclaration() {
    var s0;

    s0 = peg$parseLifeline();
    if (s0 === peg$FAILED) {
      s0 = peg$parseActor();
    }

    return s0;
  }

  function peg$parseLifeline() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 9) === peg$c1) {
      s1 = peg$c1;
      peg$currPos += 9;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e1); }
    }
    if (s1 === peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c2) {
        s1 = peg$c2;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e2); }
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseMember();
      peg$savedPos = s0;
      s0 = peg$f2(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseActor() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c3) {
      s1 = peg$c3;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e3); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseMember();
      peg$savedPos = s0;
      s0 = peg$f3(s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseMember() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseSpace();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseSpace();
    }
    s2 = peg$parseId();
    s3 = peg$parseAlias();
    if (s3 === peg$FAILED) {
      s3 = null;
    }
    s4 = peg$parseEOL();
    if (s4 === peg$FAILED) {
      s4 = null;
    }
    peg$savedPos = s0;
    s0 = peg$f4(s2, s3);

    return s0;
  }

  function peg$parseAlias() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseSpace();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseSpace();
    }
    if (input.substr(peg$currPos, 2) === peg$c4) {
      s2 = peg$c4;
      peg$currPos += 2;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e4); }
    }
    if (s2 !== peg$FAILED) {
      s3 = [];
      s4 = peg$parseSpace();
      while (s4 !== peg$FAILED) {
        s3.push(s4);
        s4 = peg$parseSpace();
      }
      s4 = peg$parseText();
      if (s4 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f5(s4);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseId() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    if (peg$r0.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e5); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (peg$r0.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e5); }
      }
    }
    peg$savedPos = s0;
    s1 = peg$f6();
    s0 = s1;

    return s0;
  }

  function peg$parseNote() {
    var s0;

    s0 = peg$parseNoteLR();
    if (s0 === peg$FAILED) {
      s0 = peg$parseNoteOver();
    }

    return s0;
  }

  function peg$parseNoteLR() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c5) {
      s1 = peg$c5;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e6); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSpace();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseNotePlacement();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseSpace();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseSingleLineText();
          if (input.charCodeAt(peg$currPos) === 58) {
            s6 = peg$c6;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e7); }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parseSpace();
            if (s7 === peg$FAILED) {
              s7 = null;
            }
            s8 = peg$parseText();
            if (s8 !== peg$FAILED) {
              s9 = peg$parseEOL();
              if (s9 === peg$FAILED) {
                s9 = null;
              }
              peg$savedPos = s0;
              s0 = peg$f7(s3, s5, s8);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNoteOver() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c5) {
      s1 = peg$c5;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e6); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSpace();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseNoteOverPlacement();
        if (s3 !== peg$FAILED) {
          s4 = peg$parseSpace();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          s5 = peg$parseMultipleTargets();
          if (s5 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s6 = peg$c6;
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e7); }
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parseSpace();
              if (s7 === peg$FAILED) {
                s7 = null;
              }
              s8 = peg$parseText();
              if (s8 !== peg$FAILED) {
                s9 = peg$parseEOL();
                if (s9 === peg$FAILED) {
                  s9 = null;
                }
                peg$savedPos = s0;
                s0 = peg$f8(s3, s5, s8);
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseMultipleTargets() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseText();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 44) {
        s3 = peg$c7;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e8); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseSpace();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        s5 = peg$parseText();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s2;
          s2 = peg$f9(s1, s5);
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f10(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNotePlacement() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c8) {
      s1 = peg$c8;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e9); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f11();
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c9) {
        s1 = peg$c9;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e10); }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f12();
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parseNoteOverPlacement() {
    var s0;

    if (input.substr(peg$currPos, 4) === peg$c10) {
      s0 = peg$c10;
      peg$currPos += 4;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e11); }
    }

    return s0;
  }

  function peg$parseMessage() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    s1 = peg$parseSingleLineText();
    s2 = peg$parseSpace();
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    s3 = peg$parseArrow();
    if (s3 !== peg$FAILED) {
      s4 = peg$parseSpace();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      s5 = peg$parseSingleLineText();
      if (input.charCodeAt(peg$currPos) === 58) {
        s6 = peg$c6;
        peg$currPos++;
      } else {
        s6 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e7); }
      }
      if (s6 !== peg$FAILED) {
        s7 = [];
        s8 = peg$parseSpace();
        while (s8 !== peg$FAILED) {
          s7.push(s8);
          s8 = peg$parseSpace();
        }
        s8 = peg$parseText();
        if (s8 !== peg$FAILED) {
          s9 = peg$parseEOL();
          if (s9 === peg$FAILED) {
            s9 = null;
          }
          peg$savedPos = s0;
          s0 = peg$f13(s1, s3, s5, s8);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseArrow() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseArrowLine();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseArrowHead();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseArrowModifier();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        peg$savedPos = s0;
        s0 = peg$f14(s1, s2, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseArrowHead() {
    var s0;

    s0 = peg$parseOpenArrow();
    if (s0 === peg$FAILED) {
      s0 = peg$parseClosedArrow();
    }

    return s0;
  }

  function peg$parseArrowLine() {
    var s0;

    s0 = peg$parseDashedLine();
    if (s0 === peg$FAILED) {
      s0 = peg$parseSolidLine();
    }

    return s0;
  }

  function peg$parseOpenArrow() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c11) {
      s1 = peg$c11;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e13); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f15();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e12); }
    }

    return s0;
  }

  function peg$parseClosedArrow() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 62) {
      s1 = peg$c12;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e15); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f16();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e14); }
    }

    return s0;
  }

  function peg$parseDashedLine() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c13) {
      s1 = peg$c13;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e17); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f17();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e16); }
    }

    return s0;
  }

  function peg$parseSolidLine() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 45) {
      s1 = peg$c14;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e19); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f18();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e18); }
    }

    return s0;
  }

  function peg$parseArrowModifier() {
    var s0;

    s0 = peg$parseActivationModifier();
    if (s0 === peg$FAILED) {
      s0 = peg$parseDeactivationModifier();
    }

    return s0;
  }

  function peg$parseActivationModifier() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 43) {
      s1 = peg$c15;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e20); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f19();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseDeactivationModifier() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 45) {
      s1 = peg$c14;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e19); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f20();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseSingleLineComment() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c16) {
      s1 = peg$c16;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e22); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseEOL();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = undefined;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseEOL();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = undefined;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$savedPos = s0;
      s0 = peg$f21();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e21); }
    }

    return s0;
  }

  function peg$parseMultiLineComment() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c17) {
      s1 = peg$c17;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e24); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c18) {
        s5 = peg$c18;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e25); }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = undefined;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c18) {
          s5 = peg$c18;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e25); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = undefined;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (input.substr(peg$currPos, 2) === peg$c18) {
        s3 = peg$c18;
        peg$currPos += 2;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e25); }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f22();
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e23); }
    }

    return s0;
  }

  function peg$parseSingleLineText() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (peg$r1.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e27); }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e27); }
      }
    }
    peg$savedPos = s0;
    s1 = peg$f23();
    s0 = s1;
    peg$silentFails--;
    s1 = peg$FAILED;
    if (peg$silentFails === 0) { peg$fail(peg$e26); }

    return s0;
  }

  function peg$parseMultiLineText() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s1 = peg$c19;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e29); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 34) {
        s5 = peg$c19;
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e29); }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = undefined;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 34) {
          s5 = peg$c19;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e29); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = undefined;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (input.charCodeAt(peg$currPos) === 34) {
        s3 = peg$c19;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e29); }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f24();
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e28); }
    }

    return s0;
  }

  function peg$parseEmptyLine() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseSpace();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseSpace();
    }
    s2 = peg$parseEOL();
    if (s2 !== peg$FAILED) {
      peg$savedPos = s0;
      s0 = peg$f25();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e30); }
    }

    return s0;
  }

  function peg$parseSpace() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$currPos;
    if (peg$r2.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e32); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f26();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e31); }
    }

    return s0;
  }

  function peg$parseText() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$parseMultiLineText();
    if (s0 === peg$FAILED) {
      s0 = peg$parseSingleLineText();
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e33); }
    }

    return s0;
  }

  function peg$parseSourceCharacter() {
    var s0, s1;

    peg$silentFails++;
    if (input.length > peg$currPos) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e35); }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e34); }
    }

    return s0;
  }

  function peg$parseEOL() {
    var s0, s1;

    peg$silentFails++;
    if (peg$r3.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e37); }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e36); }
    }

    return s0;
  }

  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

export default {
  SyntaxError: peg$SyntaxError,
  parse: peg$parse
}