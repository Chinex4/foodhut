export const capitalizeFirst = (s?: string | null) =>
  !s ? "" : s.charAt(0).toLocaleUpperCase() + s.slice(1);

export const capitalizeFirstPreserveSpace = (s = "") =>
  s.replace(/^(\s*)(\p{L})/u, (_, ws, ch) => ws + ch.toLocaleUpperCase());

export const titleCase = (s = "") =>
  s.replace(/\p{L}[\p{L}\p{Mn}\p{Pd}]*/gu, w =>
    w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase()
  );
