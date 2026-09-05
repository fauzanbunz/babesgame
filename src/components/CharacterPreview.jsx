import React, { useState, useEffect } from 'react';
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { client } from "../client";
import { itemDB } from '../data/items';
import { NFT_CONTRACT_ADDRESS, robinhoodChain } from "../chain-config";

export default function CharacterPreview({ equipped, activeNFT, onAttributesChange }) {
  // GATEWAY VIP (PINATA PRIBADI): Tetap dipertahankan KHUSUS untuk me-render gambar trait (PNG) 
  const ipfsBaseUrl = "https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/bafybeigq7bvl53ffdfctjyvhlhxfvig2qw2nffvzji4lanzodk6u62huei";
  const [nftAttributes, setNftAttributes] = useState([]);

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
      console.error("❌ Gagal membaca tokenURI untuk token #" + tokenId + ":", tokenUriError);
    }
  }, [tokenUriError, tokenId]);

  useEffect(() => {
    async function fetchMetadata() {
      if (!tokenUri) return;
      try {
        let url = tokenUri;
        
        // DIPERBAIKI: Membelokkan permintaan JSON ke Gateway Publik (dweb.link) agar tidak kena 403 Pinata
        if (tokenUri.startsWith("ipfs://")) {
          url = tokenUri.replace("ipfs://", "https://dweb.link/ipfs/");
        }
        // Jaring pengaman ekstra: jika URL aslinya sudah terlanjur Pinata, paksa belokkan ke Publik
        url = url.replace("https://scarlet-hilarious-guan-333.mypinata.cloud/ipfs/", "https://dweb.link/ipfs/");
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);

        const data = await res.json();
        if (data.attributes) {
          setNftAttributes(data.attributes);
          if (onAttributesChange) onAttributesChange(data.attributes);
        }
      } catch (err) {
        console.error("❌ Gagal memuat metadata NFT:", err);
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
        
        {tokenId === null && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '10px', zIndex: 100 }}>
                Tidak ada NFT dipilih
            </div>
        )}
        
        {tokenId !== null && isTokenUriLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', zIndex: 100 }}>
                Memuat metadata NFT...
            </div>
        )}
        
        {tokenId !== null && !isTokenUriLoading && tokenUriError && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontSize: '11px', textAlign: 'center', padding: '10px', zIndex: 100 }}>
                Gagal memuat NFT #{tokenId}
            </div>
        )}
        
        {bgFile && <img src={`${ipfsBaseUrl}/01_Background/${encodeURIComponent(bgFile)}.png`} style={layerStyle(0)} alt="Background" />}
        {skinFile && <img src={`${ipfsBaseUrl}/02_Skin/${encodeURIComponent(skinFile)}.png`} style={layerStyle(10)} alt="Skin" />}
        {mouthFile && <img src={`${ipfsBaseUrl}/08_Mouth/${encodeURIComponent(mouthFile)}.png`} style={layerStyle(15)} alt="Mouth" />}
        {piercingFile && <img src={`${ipfsBaseUrl}/03_Piercing/${encodeURIComponent(piercingFile)}.png`} style={layerStyle(20)} alt="Piercing" />}
        {bikiniFile && <img src={`${ipfsBaseUrl}/04_Bikini/${encodeURIComponent(bikiniFile)}.png`} style={layerStyle(30)} alt="Bikini" />}
        {necklaceFile && <img src={`${ipfsBaseUrl}/05_Necklace/${encodeURIComponent(necklaceFile)}.png`} style={layerStyle(40)} alt="Necklace" />}
        {hairFile && <img src={`${ipfsBaseUrl}/06_Hair/${encodeURIComponent(hairFile)}.png`} style={layerStyle(50)} alt="Hair" />}
        {shadesFile && <img src={`${ipfsBaseUrl}/07_Shades/${encodeURIComponent(shadesFile)}.png`} style={layerStyle(60)} alt="Shades" />}
        {braceletFile && <img src={`${ipfsBaseUrl}/09_Bracelet/${encodeURIComponent(braceletFile)}.png`} style={layerStyle(70)} alt="Bracelet" />}
    </div>
  );
}
