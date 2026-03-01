![Rootstock Banner](https://raw.githubusercontent.com/rsksmart/devportal/main/rootstock-logo.png)


# 🎯 Fee-Radar: The Cross-Layer Cost Estimator

**Fee-Radar** provides an "Amazon Checkout" experience for Rootstock (RSK) users Pegging Out to the Bitcoin network. Stop getting surprised by hidden L1 release fees.


---

## ⚡ Problem Statement
Standard wallets (like MetaMask or Rabby) only estimate the **L2 Rootstock gas fee** to initiate a cross-chain smart contract call. They completely ignore the underlying costs of bridging, such as **Federation fees** and **Bitcoin Miner L1 release fees**.

Fee-Radar is a purpose-built React widget that calculates all three layers of cost simultaneously, giving users a transparent breakdown of exactly what they’ll receive on the Bitcoin network.

---

## Key Features

- **Multi-Layer Polling:** Simultaneously fetches Rootstock gas prices (via `ethers.js`) and Bitcoin fee rates (via `mempool.space`).
- **Dynamic Bridge Logic:** Calculates both **PowPeg API** (0.2% fixed protocol fee) and **Flyover LPs** (dynamic 0.1-0.3% fast-liquidity fee).
- **L1 vByte Estimation:** Pure-math calculation estimating the virtual bytes (vBytes) of a legacy P2SH 3-of-5 multisig Bitcoin release transaction.
- **Fee Dominance Warning:** Intelligently warns users if Bitcoin miner congestion causes L1 fees to exceed 50% of the total cost.
- **Strict BigInt Precision:** All blockchain mathematical operations utilize native JavaScript `BigInt` to guarantee zero floating-point imprecision.

---

## Architecture

Built on a modern stack tailored for speed and developer experience:

- **Framework:** Next.js 16 (App Router) + React 19
- **State & Caching:** TanStack Query (`@tanstack/react-query`)
- **Web3 Interaction:** `ethers.js` v6
- **Styling:** Tailwind CSS v4 with custom glass-morphism classes and animations
- **Type Safety:** 100% Strict TypeScript

### 📂 Folder Structure

The project enforces a strict separation between "Pure Math", "API Data Fetching", and "React UI/State":

```text
fee-radar/
├── app/                  # Next.js App Router (Pages & Layout)
├── src/
│   ├── api/              # External API endpoints (mempool.space, RSK RPC)
│   ├── components/       # React UI Layer
│   │   ├── ui/           # Reusable Shadcn-style primitives (Card, Tooltip)
│   │   └── FeeRadar/     # Core domain widgets (Breakdown, CostRow)
│   ├── hooks/            # TanStack Query data orchestration
│   ├── lib/              # PURE MATH & Constants
│   │   ├── calculators/  # btcWeight.ts, bridgeLogic.ts (No React here!)
│   │   └── constants.ts  # Contract addresses and fee buffers
│   └── types/            # Global TypeScript interfaces
```

---

## Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/fee-radar.git
cd fee-radar
npm install
```

### 2. Run the Development Server

Start the Next.js Turbopack dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

---

## Deep Dive: The Core Logic

### `useCrossLayerEstimate` Hook
The brain of the application located at `src/hooks/useCrossLayerEstimate.ts`. It orchestrates two independent polling intervals via TanStack Query:
1. **RSK Gas:** Refreshes every 30 seconds.
2. **BTC Fees:** Refreshes every 60 seconds.

It then passes these real-time values, along with the user's `amount` and selected `speed`, into the pure math calculators and returns a highly structured `FeeBreakdownResult` JSON object.

### The vByte Estimator
Located in `src/lib/calculators/btcWeight.ts`. Instead of hardcoding an average fee, this utility programmatically calculates the byte size of a legacy Rootstock PowPeg release transaction (1 P2SH multisig input, 2 P2PKH outputs) ensuring accurate L1 estimation regardless of whether the user chooses Economy, Standard, or Priority routing.

---

## 🛠️ Configuration & Customization

No hidden "magic numbers". Everything is highly configurable in `src/lib/constants.ts`:

- `POWPEG_BRIDGE_ADDRESS`
- `FEE_BUFFER_PERCENTAGE` (defaults to 10%)
- `FEE_DOMINANCE_THRESHOLD` (defaults to 50%)
- Polling Intervals (`RSK_GAS_POLL_INTERVAL`, etc.)

---

## 📝 License

MIT License. See `LICENSE` for more information.
