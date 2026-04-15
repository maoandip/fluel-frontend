// Pure helpers mapping backend status strings to CSS module class names.

export function txStatusClass(status: string): "statusDone" | "statusPending" | "statusFailed" | "statusUnknown" {
  switch (status) {
    case "DONE":
      return "statusDone";
    case "PENDING":
      return "statusPending";
    case "FAILED":
    case "NOT_FOUND":
      return "statusFailed";
    default:
      return "statusUnknown";
  }
}

export function giftStatusClass(
  status: string,
): "statusClaimed" | "statusPending" | "statusExpired" | "statusDefault" {
  switch (status) {
    case "claimed":
      return "statusClaimed";
    case "pending":
      return "statusPending";
    case "expired":
      return "statusExpired";
    default:
      return "statusDefault";
  }
}
