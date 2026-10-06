import { describe, expect, it } from "vitest";
import { coerceCell } from "./coerce";
import { inferColumn } from "./infer";
import { describeIssues } from "./issues";
import { parseUf, parseUfName, UFS } from "./uf";

describe("parseUf", () => {
  it("reads siglas, names and IBGE codes", () => {
    expect(parseUf("SP")).toBe("SP");
    expect(parseUf(" sp ")).toBe("SP");
    expect(parseUf("São Paulo")).toBe("SP");
    expect(parseUf("sao  paulo")).toBe("SP");
    expect(parseUf("MATO GROSSO DO SUL")).toBe("MS");
    expect(parseUf("35")).toBe("SP");
  });

  it("rejects what is not a state", () => {
    for (const raw of ["", "Brasil", "BR", "Rio Branco", "99", "3"]) {
      expect(parseUf(raw)).toBeNull();
    }
    expect(parseUf(null)).toBeNull();
  });

  it("knows the 27 units", () => {
    expect(UFS).toHaveLength(27);
    expect(new Set(UFS.map((uf) => uf.code)).size).toBe(27);
    expect(new Set(UFS.map((uf) => uf.ibge)).size).toBe(27);
    for (const uf of UFS) {
      expect(parseUf(uf.name)).toBe(uf.code);
      expect(parseUf(String(uf.ibge))).toBe(uf.code);
    }
  });

  it("keeps codes out of name parsing", () => {
    expect(parseUfName("35")).toBeNull();
    expect(parseUfName("Acre")).toBe("AC");
  });
});

describe("UF columns", () => {
  const siglas = UFS.map((uf) => uf.code);

  it("are detected from siglas or names", () => {
    expect(inferColumn("UF", siglas, ",").type).toBe("uf");
    expect(
      inferColumn(
        "Estado",
        UFS.map((uf) => uf.name),
        ",",
      ).type,
    ).toBe("uf");
  });

  it("tolerate a total row", () => {
    expect(inferColumn("UF", [...siglas, "Brasil"], ",").type).toBe("uf");
  });

  it("are not detected from capitals, free text or IBGE codes", () => {
    const capitals = ["Rio Branco", "Maceió", "Macapá", "Manaus", "São Paulo"];
    expect(inferColumn("Capital", capitals, ",").type).toBe("text");
    expect(inferColumn("Sexo", ["Homens", "Mulheres"], ",").type).toBe("text");
    expect(
      inferColumn(
        "cod",
        UFS.map((uf) => String(uf.ibge)),
        ",",
      ).type,
    ).toBe("number");
  });

  it("keep the cell as written and drop what is not a state", () => {
    const column = { name: "UF", type: "uf" as const };
    expect(coerceCell(" Acre ", column, ",")).toBe("Acre");
    expect(coerceCell("12", column, ",")).toBe("12");
    expect(coerceCell("Brasil", column, ",")).toBeNull();
    expect(coerceCell("", column, ",")).toBeNull();
  });

  it("describe their failed cells", () => {
    expect(describeIssues("uf", 1, ["Brasil"])).toBe(
      "1 valor que não é UF: “Brasil”",
    );
  });
});
