// Pure helpers mapping backend status strings to CSS module class names.

// Maps a tx_history TxStatus to a CSS module class.
export function txStatusClass(status: string): "statusDone" | "statusPending" | "statusFailed" | "statusUnknown" {
  switch (status) {
    case "confirmed":
      return "statusDone";
    case "submitting":
    case "pending":
    case "broadcasted":
      return "statusPending";
    case "reverted":
    case "failed":
    case "error":
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
