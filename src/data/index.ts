import type { Pokemon } from "@/lib/types";
import redBlue from "./red-blue.json";
import yellow from "./yellow.json";
import goldSilver from "./gold-silver.json";
import crystal from "./crystal.json";
import rubySapphire from "./ruby-sapphire.json";
import emerald from "./emerald.json";
import fireredLeafgreen from "./firered-leafgreen.json";
import diamondPearl from "./diamond-pearl.json";
import platinum from "./platinum.json";
import heartgoldSoulsilver from "./heartgold-soulsilver.json";
import blackWhite from "./black-white.json";
import black2White2 from "./black-2-white-2.json";
import xY from "./x-y.json";
import omegaRubyAlphaSapphire from "./omega-ruby-alpha-sapphire.json";
import sunMoon from "./sun-moon.json";
import ultraSunUltraMoon from "./ultra-sun-ultra-moon.json";
import letsGoPikachuLetsGoEevee from "./lets-go-pikachu-lets-go-eevee.json";
import swordShield from "./sword-shield.json";
import brilliantDiamondShiningPearl from "./brilliant-diamond-shining-pearl.json";
import legendsArceus from "./legends-arceus.json";
import scarletViolet from "./scarlet-violet.json";

const GAME_DATA: Record<string, Pokemon[]> = {
  "red-blue": redBlue as unknown as Pokemon[],
  "yellow": yellow as unknown as Pokemon[],
  "gold-silver": goldSilver as unknown as Pokemon[],
  "crystal": crystal as unknown as Pokemon[],
  "ruby-sapphire": rubySapphire as unknown as Pokemon[],
  "emerald": emerald as unknown as Pokemon[],
  "firered-leafgreen": fireredLeafgreen as unknown as Pokemon[],
  "diamond-pearl": diamondPearl as unknown as Pokemon[],
  "platinum": platinum as unknown as Pokemon[],
  "heartgold-soulsilver": heartgoldSoulsilver as unknown as Pokemon[],
  "black-white": blackWhite as unknown as Pokemon[],
  "black-2-white-2": black2White2 as unknown as Pokemon[],
  "x-y": xY as unknown as Pokemon[],
  "omega-ruby-alpha-sapphire": omegaRubyAlphaSapphire as unknown as Pokemon[],
  "sun-moon": sunMoon as unknown as Pokemon[],
  "ultra-sun-ultra-moon": ultraSunUltraMoon as unknown as Pokemon[],
  "lets-go-pikachu-lets-go-eevee": letsGoPikachuLetsGoEevee as unknown as Pokemon[],
  "sword-shield": swordShield as unknown as Pokemon[],
  "brilliant-diamond-shining-pearl": brilliantDiamondShiningPearl as unknown as Pokemon[],
  "legends-arceus": legendsArceus as unknown as Pokemon[],
  "scarlet-violet": scarletViolet as unknown as Pokemon[],
};

export function getGameData(slug: string): Pokemon[] | undefined {
  return GAME_DATA[slug];
}
