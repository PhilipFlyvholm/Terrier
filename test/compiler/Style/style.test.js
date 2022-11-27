import { scopeStyle } from "../../../build/compiler/StyleModification.js";
import { describe, it } from "mocha";
import assert from "assert";
import TerrierComponent from "../../../build/runtime/TerrierComponent.js";
import Fragment from "../../../build/parser/Nodes/Fragment.js";

/**
 * Shorthand version used for testing to create a new component where the only focus is the style attribute
 * @param {string} style 
 * @returns {string} scoped version of style
 */
const shorthandScope = style => {
  const c = new TerrierComponent(new Fragment(), '', style);
  c.hash = "hash";
  scopeStyle(c);
  return c.style;
}

describe("StyleModification", () => {
  describe("scopeStyle", () => {
    it("should return scoped object", () => {
      assert.equal(shorthandScope("", "hash"), "");
      assert.equal(shorthandScope("a{flex:1}", "hash"), "a.hash{flex:1}");
      assert.equal(shorthandScope("a.a{flex:1}", "hash"), "a.a.hash{flex:1}");
      assert.equal(shorthandScope("a.a#a{flex:1}", "hash"), "a.a#a.hash{flex:1}");
      assert.equal(
        shorthandScope("a.a#a{flex:1}b{flex:1}", "hash"),
        "a.a#a.hash{flex:1}b.hash{flex:1}"
      );
      assert.equal(
        shorthandScope("@media screen and (min-width:0px){a.a#a{flex:1}}", "hash"),
        "@media screen and (min-width:0px){a.a#a.hash{flex:1}}"
      );
      assert.equal(
        shorthandScope("a:has(.bing){flex:1}", "hash"),
        "a:has(.bing).hash{flex:1}"
      );
    });
    it("should parse :global", () => {
      assert.equal(
        shorthandScope("a :global(.bing){flex:1}", "hash"),
        "a.hash .bing{flex:1}"
      );
      assert.equal(
        shorthandScope(":global(.bing) a{flex:1}", "hash"),
        ".bing a.hash{flex:1}"
      );
      assert.equal(
        shorthandScope("a:global(.bing) a{flex:1}", "hash"),
        "a.hash.bing a.hash{flex:1}"
      );
      assert.equal(
        shorthandScope(":global(.bing){flex:1}", "hash"),
        ".bing{flex:1}"
      );
      assert.equal(
        shorthandScope(":global(.bing#bla .bang){flex:1}", "hash"),
        ".bing#bla .bang{flex:1}"
      );
    });
  });
});
