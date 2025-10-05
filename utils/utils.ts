export const DEFAULT_DRIVE_FIELD = "Not Provided";
export const DEFAULT_ROUND = {
  round_name: "Unnamed Round",
  round_date: "DD-MM-YYYY HH:MM",
  status: "upcoming",
  result: "not_conducted",
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return DEFAULT_DRIVE_FIELD;
  try {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
  } catch {
    return dateString || DEFAULT_DRIVE_FIELD;
  }
};
