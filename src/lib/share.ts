import type { EvolutionLine, GameVersion, Generation } from "@/lib/types";
import { getGameData } from "@/data";
import { getGameVersion, getGenerationForGame } from "@/lib/games";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TeamMemberRef {
  lineId: number;
  branchIndex: number | undefined;
  isStarter: boolean;
}

export interface SharePayload {
  gameSlug: string;
  members: TeamMemberRef[];
  attempts: number;
}

export interface ResolvedShareData {
  gameVersion: GameVersion;
  generation: Generation;
  team: EvolutionLine[];
  attempts: number;
}

// ---------------------------------------------------------------------------
// Frozen game-slug ↔ index mapping
// ⚠️ APPEND-ONLY — reordering or removing entries breaks all existing shared URLs
// ---------------------------------------------------------------------------

export const SHARE_GAME_INDEX: Record<string, number> = {
  "red": 0,
  "blue": 1,
  "yellow": 2,
  "gold": 3,
  "silver": 4,
  "crystal": 5,
  "ruby": 6,
  "sapphire": 7,
  "emerald": 8,
  "firered": 9,
  "leafgreen": 10,
  "diamond": 11,
  "pearl": 12,
  "platinum": 13,
  "heartgold": 14,
  "soulsilver": 15,
  "black": 16,
  "white": 17,
  "black-2": 18,
  "white-2": 19,
  "x": 20,
  "y": 21,
  "omega-ruby": 22,
  "alpha-sapphire": 23,
  "sun": 24,
  "moon": 25,
  "ultra-sun": 26,
  "ultra-moon": 27,
  "lets-go-pikachu": 28,
  "lets-go-eevee": 29,
  "sword": 30,
  "shield": 31,
  "brilliant-diamond": 32,
  "shining-pearl": 33,
  "legends-arceus": 34,
  "scarlet": 35,
  "violet": 36,
};

// ⚠️ APPEND-ONLY — must stay in sync with SHARE_GAME_INDEX
export const SHARE_INDEX_TO_GAME: string[] = [
  "red",
  "blue",
  "yellow",
  "gold",
  "silver",
  "crystal",
  "ruby",
  "sapphire",
  "emerald",
  "firered",
  "leafgreen",
  "diamond",
  "pearl",
  "platinum",
  "heartgold",
  "soulsilver",
  "black",
  "white",
  "black-2",
  "white-2",
  "x",
  "y",
  "omega-ruby",
  "alpha-sapphire",
  "sun",
  "moon",
  "ultra-sun",
  "ultra-moon",
  "lets-go-pikachu",
  "lets-go-eevee",
  "sword",
  "shield",
  "brilliant-diamond",
  "shining-pearl",
  "legends-arceus",
  "scarlet",
  "violet",
];

// ---------------------------------------------------------------------------
// CRC-8 (polynomial 0x07, init 0x00)
// ---------------------------------------------------------------------------

function crc8(data: Uint8Array): number {
  let crc = 0x00;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

// ---------------------------------------------------------------------------
// Base64url helpers (browser-native btoa/atob with URL-safe substitution)
// ---------------------------------------------------------------------------

function toBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(code: string): Uint8Array | null {
  try {
    // Restore standard base64 characters
    let b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    // Re-pad to multiple of 4
    const pad = b64.length % 4;
    if (pad === 2) b64 += "==";
    else if (pad === 3) b64 += "=";
    else if (pad === 1) return null; // Invalid base64 length

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Encode
// ---------------------------------------------------------------------------

/** Encode a completed team into a share code string. */
export function encodeTeamShareCode(
  gameSlug: string,
  team: EvolutionLine[],
  attempts: number,
): string {
  const gameIndex = SHARE_GAME_INDEX[gameSlug];
  if (gameIndex === undefined) {
    throw new Error(`Unknown game slug for sharing: ${gameSlug}`);
  }
  if (team.length < 1 || team.length > 6) {
    throw new Error(`Team size must be 1-6, got ${team.length}`);
  }

  const memberCount = team.length;
  // Total bytes: 1 (header) + 2*N (members) + 1 (attempts) + 1 (checksum)
  const totalBytes = 1 + memberCount * 2 + 1 + 1;
  const buf = new Uint8Array(totalBytes);

  // Byte 0: [GGGGGG][VV] — gameIndex (6 bits) + version (2 bits, = 00 for v1)
  buf[0] = (gameIndex << 2) | 0b00;

  // Bytes 1..2N: team members (16 bits each, big-endian)
  for (let i = 0; i < memberCount; i++) {
    const member = team[i];
    const lineId = member.lineId & 0x7ff; // 11 bits
    const branchPlusOne =
      member.branchIndex !== undefined ? (member.branchIndex + 1) & 0xf : 0;
    const starterBit = member.isStarter ? 1 : 0;

    // Bits 15-5: lineId, Bits 4-1: branchIndex+1, Bit 0: isStarter
    const word = (lineId << 5) | (branchPlusOne << 1) | starterBit;
    buf[1 + i * 2] = (word >> 8) & 0xff; // high byte
    buf[1 + i * 2 + 1] = word & 0xff; // low byte
  }

  // Attempts byte (clamped to 0-255)
  buf[1 + memberCount * 2] = Math.min(attempts, 255);

  // CRC-8 checksum over all preceding bytes
  const payloadBytes = buf.subarray(0, totalBytes - 1);
  buf[totalBytes - 1] = crc8(payloadBytes);

  return toBase64url(buf);
}

// ---------------------------------------------------------------------------
// Decode (lightweight — no data resolution)
// ---------------------------------------------------------------------------

/** Decode a share code into lightweight refs. Returns null on any failure. */
export function decodeShareCode(code: string): SharePayload | null {
  // 1. Base64url decode must not throw
  const bytes = fromBase64url(code);
  if (!bytes) return null;

  const len = bytes.length;

  // 2. Byte count must be odd (header + N×2 + attempts + checksum) and >= 5
  //    header(1) + members(2*N) + attempts(1) + checksum(1) = 2N + 3
  //    So length must be odd and >= 5
  if (len < 5 || len % 2 === 0) return null;

  // 3. Version bits must be 00
  const headerByte = bytes[0];
  const version = headerByte & 0b11;
  if (version !== 0) return null;

  // 4. CRC-8 checksum must match
  const payloadBytes = bytes.subarray(0, len - 1);
  const expectedCrc = bytes[len - 1];
  if (crc8(payloadBytes) !== expectedCrc) return null;

  // 5. gameIndex must map to a known slug
  const gameIndex = headerByte >> 2;
  const gameSlug = SHARE_INDEX_TO_GAME[gameIndex];
  if (!gameSlug) return null;

  // 6. Team size derived as (byteLength - 3) / 2 must be 1-6
  const teamSize = (len - 3) / 2;
  if (teamSize < 1 || teamSize > 6) return null;

  // Parse members
  const members: TeamMemberRef[] = [];
  for (let i = 0; i < teamSize; i++) {
    const hi = bytes[1 + i * 2];
    const lo = bytes[1 + i * 2 + 1];
    const word = (hi << 8) | lo;

    const lineId = (word >> 5) & 0x7ff; // bits 15-5
    const branchPlusOne = (word >> 1) & 0xf; // bits 4-1
    const isStarter = (word & 1) === 1; // bit 0

    // 7. Each lineId must be > 0
    if (lineId === 0) return null;

    // 8. Each branchIndex+1 must be 0-8 (not 9-15)
    if (branchPlusOne > 8) return null;

    members.push({
      lineId,
      branchIndex: branchPlusOne === 0 ? undefined : branchPlusOne - 1,
      isStarter,
    });
  }

  // Attempts byte
  const attempts = bytes[1 + teamSize * 2];

  return { gameSlug, members, attempts };
}

// ---------------------------------------------------------------------------
// Resolve (full data lookup)
// ---------------------------------------------------------------------------

/** Decode + resolve full EvolutionLine objects from static game data. Returns null on any failure. */
export function resolveShareCode(code: string): ResolvedShareData | null {
  const payload = decodeShareCode(code);
  if (!payload) return null;

  // 1. getGameData must return data
  const data = getGameData(payload.gameSlug);
  if (!data) return null;

  // 2. Each member must be found in game data
  const team: EvolutionLine[] = [];
  for (const ref of payload.members) {
    const line = data.find(
      (l) =>
        l.lineId === ref.lineId &&
        (ref.branchIndex === undefined
          ? l.branchIndex === undefined
          : l.branchIndex === ref.branchIndex),
    );
    if (!line) return null;
    team.push(line);
  }

  // 3. getGameVersion and getGenerationForGame must return values
  const gameVersion = getGameVersion(payload.gameSlug);
  if (!gameVersion) return null;

  const generation = getGenerationForGame(gameVersion);
  if (!generation) return null;

  return {
    gameVersion,
    generation,
    team,
    attempts: payload.attempts,
  };
}
