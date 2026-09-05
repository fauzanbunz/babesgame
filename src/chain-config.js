import { defineChain } from "thirdweb/chains";

// SATU-SATUNYA tempat mendefinisikan kontrak & RPC Robinhood Chain.
// Import file ini di SEMUA komponen yang butuh baca on-chain
// (page.js, CharacterPreview.jsx, dll) -- JANGAN definisikan chain/RPC
// terpisah di file lain lagi. Kejadian sebelumnya: page.js sudah diupdate
// pakai Alchemy key yang valid, tapi CharacterPreview.jsx punya definisi
// sendiri yang masih pakai key lama/rusak -> NFT preview jadi kosong.

export const NFT_CONTRACT_ADDRESS = "0x9a6268489686a04075d0beea36429f0b5836290b";

// Isi API key Alchemy ASLI kamu di baris pertama (uncomment), RPC publik
// jadi fallback kalau Alchemy sedang bermasalah.
export const RPC_ENDPOINTS = [
    "https://robinhood-mainnet.g.alchemy.com/v2/alch_EMaIvTiuZyumUrGHfFnFd",
    "https://rpc.mainnet.chain.robinhood.com", // fallback publik (bisa diblokir oleh ISP tertentu, mis. Telkomsel Internet Baik)
];

export function makeRobinhoodChain(rpcUrl) {
    return defineChain({
        id: 4663,
        name: "Robinhood Chain",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpc: rpcUrl,
        blockExplorers: [{ name: "Blockscout", url: "https://robinhoodchain.blockscout.com" }]
    });
}

// Chain siap pakai untuk komponen yang butuh SATU chain tetap
// (misalnya hook useReadContract yang tidak bisa loop banyak RPC).
// Pakai entry PERTAMA di RPC_ENDPOINTS sebagai chain utama.
export const robinhoodChain = makeRobinhoodChain(RPC_ENDPOINTS[0]);
