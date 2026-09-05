import React, { useState, useEffect } from 'react';
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { client } from "../client";
import { itemDB } from '../data/items';
import { NFT_CONTRACT_ADDRESS, robinhoodChain } from "../chain-config";
import { resolveScheme } from "thirdweb/storage"; // JALUR VIP THIRDWEB

export default function CharacterPreview({ equipped, activeNFT, onAttributesChange }) {
  // GATEWAY GAMBAR: Tetap pakai Pinata pribadimu untuk PNG
  const ipfsBaseUrl = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";
  
  const [nftAttributes, setNftAttributes] = useState([]);
  
  // INI DIA YANG HILANG! State untuk menampilkan teks indikator UI
  const [statusMsg, setStatusMsg] = useState("");

  const tokenId = activeNFT ? Number(activeNFT.id) : null;

  const contract = getContract({
    client,
    chain: robinhoodChain,
    address: NFT_CONTRACT_ADDRESS,
  });

  const { data: tokenUri, isLoading: isTokenUriLoading, error: tokenUriError } = useReadContract({
    contract,
    method: "function tokenURI(uint256 tokenId) view returns (string)",
    params: [tokenId !== null ? tokenId : 0],
    enabled: tokenId !== null,
  });

  useEffect(() => {
    if (tokenUriError) {
      console.error("❌ Gagal membaca tokenURI:", tokenUriError);
      setStatusMsg("Gagal membaca Smart Contract.");
    }
  }, [tokenUriError]);

  useEffect(() => {
    async function fetchMetadata() {
      if (!tokenUri) return;
      try {
        setStatusMsg("Membuka Jalur VIP Thirdweb...");
        let resolvedUrl = tokenUri;
        
        // MENGGUNAKAN JALUR VIP THIRDWEB (KEBAL CORS & 403)
        if (tokenUri.startsWith("ipfs://")) {
            resolvedUrl = resolveScheme({ client, uri: tokenUri }); 
        } else if (tokenUri.includes("mypinata.cloud")) {
            resolvedUrl = tokenUri.replace("https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/", "https://ipfs.io/ipfs/");
        }
        
        console.log("📡 Menarik JSON dari Jalur VIP:", resolvedUrl);
        
        const res = await fetch(resolvedUrl);
        if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);

        const data = await res.json();
        if (data.attributes) {
          setNftAttributes(data.attributes);
          if (onAttributesChange) onAttributesChange(data.attributes);
          setStatusMsg(""); // Kosongkan pesan agar gambar bisa muncul!
        }
      } catch (err) {
        console.error("❌ Gagal memuat metadata NFT:", err);
        setStatusMsg("Gagal memuat metadata (Ditolak Server).");
      }
    }
    fetchMetadata();
  }, [tokenUri, onAttributesChange]);

  const getTraitValue = (traitType) => {
    const attr = nftAttributes.find(a => a.trait_type?.toLowerCase() === traitType.toLowerCase());
    return attr ? attr.value : null;
  };

  const getFileName = (val) => {
    if (!val) return null;
    return itemDB[val]?.fileName || val;
  };

  const bgFile = getFileName(getTraitValue('Background'));
  const skinFile = getFileName(getTraitValue('Skin'));
  const mouthFile = getFileName(getTraitValue('Mouth'));
  const hairFile = getFileName(getTraitValue('Hair'));
  const piercingFile = getFileName(getTraitValue('Piercing'));

  const getActiveTraitFile = (category, defaultVal) => {
    const equippedItem = equipped?.[category];
    if (equippedItem && itemDB[equippedItem]) {
      return itemDB[equippedItem].fileName;
    }
    return getFileName(defaultVal);
  };

  const bikiniFile = getActiveTraitFile('bikini', getTraitValue('Bikini'));
  const necklaceFile = getActiveTraitFile('necklace', getTraitValue('Necklace'));
  const shadesFile = getActiveTraitFile('shades', getTraitValue('Shades'));
  const braceletFile = getActiveTraitFile('bracelet', getTraitValue('Bracelet'));

  const layerStyle = (zIndex) => ({
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: zIndex
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', aspectRatio: '1 / 1', backgroundColor: '#111', overflow: 'hidden', borderRadius: '14px' }}>
        
        {/* Indikator Status Teks */}
        {statusMsg && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '10px', zIndex: 100 }}>
                {statusMsg}
            </div>
        )}

        {tokenId === null && !statusMsg && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '10px', zIndex: 100 }}>
                Tidak ada NFT dipilih
            </div>
        )}

        {tokenId !== null && isTokenUriLoading && !statusMsg && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', zIndex: 100 }}>
                Memuat metadata NFT...
            </div>
        )}

        {/* GAMBAR BARU MUNCUL JIKA TIDAK ADA ERROR MSG */}
        {!statusMsg && !isTokenUriLoading && (
            <>
                {bgFile && <img src={`${ipfsBaseUrl}/01_Background/${encodeURIComponent(bgFile)}.png`} style={layerStyle(0)} alt="Background" />}
                {skinFile && <img src={`${ipfsBaseUrl}/02_Skin/${encodeURIComponent(skinFile)}.png`} style={layerStyle(10)} alt="Skin" />}
                {mouthFile && <img src={`${ipfsBaseUrl}/08_Mouth/${encodeURIComponent(mouthFile)}.png`} style={layerStyle(15)} alt="Mouth" />}
                {piercingFile && <img src={`${ipfsBaseUrl}/03_Piercing/${encodeURIComponent(piercingFile)}.png`} style={layerStyle(20)} alt="Piercing" />}
                {bikiniFile && <img src={`${ipfsBaseUrl}/04_Bikini/${encodeURIComponent(bikiniFile)}.png`} style={layerStyle(30)} alt="Bikini" />}
                {necklaceFile && <img src={`${ipfsBaseUrl}/05_Necklace/${encodeURIComponent(necklaceFile)}.png`} style={layerStyle(40)} alt="Necklace" />}
                {hairFile && <img src={`${ipfsBaseUrl}/06_Hair/${encodeURIComponent(hairFile)}.png`} style={layerStyle(50)} alt="Hair" />}
                {shadesFile && <img src={`${ipfsBaseUrl}/07_Shades/${encodeURIComponent(shadesFile)}.png`} style={layerStyle(60)} alt="Shades" />}
                {braceletFile && <img src={`${ipfsBaseUrl}/09_Bracelet/${encodeURIComponent(braceletFile)}.png`} style={layerStyle(70)} alt="Bracelet" />}
            </>
        )}
    </div>
  );
}
