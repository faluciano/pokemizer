import type { EvolutionLine } from "@/lib/types";
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

const GAME_DATA: Record<string, EvolutionLine[]> = {
  "red-blue": redBlue as unknown as EvolutionLine[],
  "yellow": yellow as unknown as EvolutionLine[],
  "gold-silver": goldSilver as unknown as EvolutionLine[],
  "crystal": crystal as unknown as EvolutionLine[],
  "ruby-sapphire": rubySapphire as unknown as EvolutionLine[],
  "emerald": emerald as unknown as EvolutionLine[],
  "firered-leafgreen": fireredLeafgreen as unknown as EvolutionLine[],
  "diamond-pearl": diamondPearl as unknown as EvolutionLine[],
  "platinum": platinum as unknown as EvolutionLine[],
  "heartgold-soulsilver": heartgoldSoulsilver as unknown as EvolutionLine[],
  "black-white": blackWhite as unknown as EvolutionLine[],
  "black-2-white-2": black2White2 as unknown as EvolutionLine[],
  "x-y": xY as unknown as EvolutionLine[],
  "omega-ruby-alpha-sapphire": omegaRubyAlphaSapphire as unknown as EvolutionLine[],
  "sun-moon": sunMoon as unknown as EvolutionLine[],
  "ultra-sun-ultra-moon": ultraSunUltraMoon as unknown as EvolutionLine[],
  "lets-go-pikachu-lets-go-eevee": letsGoPikachuLetsGoEevee as unknown as EvolutionLine[],
  "sword-shield": swordShield as unknown as EvolutionLine[],
  "brilliant-diamond-shining-pearl": brilliantDiamondShiningPearl as unknown as EvolutionLine[],
  "legends-arceus": legendsArceus as unknown as EvolutionLine[],
  "scarlet-violet": scarletViolet as unknown as EvolutionLine[],
};

export function getGameData(slug: string): EvolutionLine[] | undefined {
  return GAME_DATA[slug];
}
