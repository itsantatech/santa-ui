export function createSafeSlug(value: string) {
  const thai = Object.fromEntries([
    ["ก", "k"], ["ข", "kh"], ["ค", "kh"], ["ง", "ng"], ["จ", "ch"], ["ฉ", "ch"], ["ช", "ch"], ["ซ", "s"], ["ญ", "y"], ["ด", "d"], ["ต", "t"], ["ท", "th"], ["น", "n"], ["บ", "b"], ["ป", "p"], ["พ", "ph"], ["ฟ", "f"], ["ม", "m"], ["ย", "y"], ["ร", "r"], ["ล", "l"], ["ว", "w"], ["ส", "s"], ["ห", "h"], ["อ", "o"], ["ฮ", "h"], ["า", "a"], ["ำ", "am"], ["ิ", "i"], ["ี", "i"], ["ุ", "u"], ["ู", "u"], ["เ", "e"], ["แ", "ae"], ["โ", "o"], ["ใ", "ai"], ["ไ", "ai"],
  ]) as Record<string, string>;
  return Array.from(value.trim()).map((char) => thai[char] ?? char).join("")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
}
