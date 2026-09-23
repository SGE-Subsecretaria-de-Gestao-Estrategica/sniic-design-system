import * as d3 from "d3";

export const formatLocale = d3.formatLocale({
    thousands: ".",
    decimal: ",",
    grouping: [3],
    currency: ["R$", ""],
  })