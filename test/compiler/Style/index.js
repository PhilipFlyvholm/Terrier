import { scopeStyle } from "../../../build/runtime/StyleModification.js";
import { describe, it } from "mocha";
import assert from "assert";

describe("StyleModification", () => {
  describe("scopeStyle", () => {
    it("should return scoped object", () => {
      assert.equal(scopeStyle("", "hash"), "");
      assert.equal(scopeStyle("a{flex:1}", "hash"), "a.hash{flex:1}");
      assert.equal(scopeStyle("a.a{flex:1}", "hash"), "a.a.hash{flex:1}");
      assert.equal(scopeStyle("a.a#a{flex:1}", "hash"), "a.a#a.hash{flex:1}");
      assert.equal(
        scopeStyle("a.a#a{flex:1}b{flex:1}", "hash"),
        "a.a#a.hash{flex:1}b.hash{flex:1}"
      );
      assert.equal(
        scopeStyle("@media screen and (min-width:0px){a.a#a{flex:1}}", "hash"),
        "@media screen and (min-width:0px){a.a#a.hash{flex:1}}"
      );
      assert.equal(
        scopeStyle("a:has(.bing){flex:1}", "hash"),
        "a:has(.bing).hash{flex:1}"
      );
    });
    it("should parse :global", () => {
      assert.equal(
        scopeStyle("a :global(.bing){flex:1}", "hash"),
        "a.hash .bing{flex:1}"
      );
      assert.equal(
        scopeStyle(":global(.bing) a{flex:1}", "hash"),
        ".bing a.hash{flex:1}"
      );
      assert.equal(
        scopeStyle("a:global(.bing) a{flex:1}", "hash"),
        "a.hash.bing a.hash{flex:1}"
      );
      assert.equal(
        scopeStyle(":global(.bing){flex:1}", "hash"),
        ".bing{flex:1}"
      );
      assert.equal(
        scopeStyle(":global(.bing#bla .bang){flex:1}", "hash"),
        ".bing#bla .bang{flex:1}"
      );
    });
  });
});
