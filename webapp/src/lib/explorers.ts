// Block-explorer base URLs keyed by EVM chain id, for building /tx/<hash>
// links on the History page. Chains absent here simply don't get a link —
// the copy button still lets the user paste the hash into any explorer.
const EXPLORER_BASE: Record<number, string> = {
  1: "https://etherscan.io",
  10: "https://optimistic.etherscan.io",
  56: "https://bscscan.com",
  100: "https://gnosisscan.io",
  130: "https://uniscan.xyz",
  137: "https://polygonscan.com",
  204: "https://opbnbscan.com",
  250: "https://ftmscan.com",
  324: "https://explorer.zksync.io",
  480: "https://worldscan.org",
  1101: "https://zkevm.polygonscan.com",
  1284: "https://moonscan.io",
  5000: "https://mantlescan.xyz",
  8453: "https://basescan.org",
  34443: "https://explorer.mode.network",
  42161: "https://arbiscan.io",
  42220: "https://celoscan.io",
  43114: "https://snowtrace.io",
  59144: "https://lineascan.build",
  81457: "https://blastscan.io",
  534352: "https://scrollscan.com",
};

export function explorerTxUrl(chainId: number | undefined, txHash: string): string | null {
  if (chainId === undefined) return null;
  const base = EXPLORER_BASE[chainId];
  return base ? `${base}/tx/${txHash}` : null;
}
