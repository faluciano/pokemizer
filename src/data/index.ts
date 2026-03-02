import type { EvolutionLine } from "@/lib/types";
import red from "./red.json";
import blue from "./blue.json";
import yellow from "./yellow.json";
import gold from "./gold.json";
import silver from "./silver.json";
import crystal from "./crystal.json";
import ruby from "./ruby.json";
import sapphire from "./sapphire.json";
import emerald from "./emerald.json";
import firered from "./firered.json";
import leafgreen from "./leafgreen.json";
import diamond from "./diamond.json";
import pearl from "./pearl.json";
import platinum from "./platinum.json";
import heartgold from "./heartgold.json";
import soulsilver from "./soulsilver.json";
import black from "./black.json";
import white from "./white.json";
import black2 from "./black-2.json";
import white2 from "./white-2.json";
import x from "./x.json";
import y from "./y.json";
import omegaRuby from "./omega-ruby.json";
import alphaSapphire from "./alpha-sapphire.json";
import sun from "./sun.json";
import moon from "./moon.json";
import ultraSun from "./ultra-sun.json";
import ultraMoon from "./ultra-moon.json";
import letsGoPikachu from "./lets-go-pikachu.json";
import letsGoEevee from "./lets-go-eevee.json";
import sword from "./sword.json";
import shield from "./shield.json";
import brilliantDiamond from "./brilliant-diamond.json";
import shiningPearl from "./shining-pearl.json";
import legendsArceus from "./legends-arceus.json";
import scarlet from "./scarlet.json";
import violet from "./violet.json";

const GAME_DATA: Record<string, EvolutionLine[]> = {
  "red": red as unknown as EvolutionLine[],
  "blue": blue as unknown as EvolutionLine[],
  "yellow": yellow as unknown as EvolutionLine[],
  "gold": gold as unknown as EvolutionLine[],
  "silver": silver as unknown as EvolutionLine[],
  "crystal": crystal as unknown as EvolutionLine[],
  "ruby": ruby as unknown as EvolutionLine[],
  "sapphire": sapphire as unknown as EvolutionLine[],
  "emerald": emerald as unknown as EvolutionLine[],
  "firered": firered as unknown as EvolutionLine[],
  "leafgreen": leafgreen as unknown as EvolutionLine[],
  "diamond": diamond as unknown as EvolutionLine[],
  "pearl": pearl as unknown as EvolutionLine[],
  "platinum": platinum as unknown as EvolutionLine[],
  "heartgold": heartgold as unknown as EvolutionLine[],
  "soulsilver": soulsilver as unknown as EvolutionLine[],
  "black": black as unknown as EvolutionLine[],
  "white": white as unknown as EvolutionLine[],
  "black-2": black2 as unknown as EvolutionLine[],
  "white-2": white2 as unknown as EvolutionLine[],
  "x": x as unknown as EvolutionLine[],
  "y": y as unknown as EvolutionLine[],
  "omega-ruby": omegaRuby as unknown as EvolutionLine[],
  "alpha-sapphire": alphaSapphire as unknown as EvolutionLine[],
  "sun": sun as unknown as EvolutionLine[],
  "moon": moon as unknown as EvolutionLine[],
  "ultra-sun": ultraSun as unknown as EvolutionLine[],
  "ultra-moon": ultraMoon as unknown as EvolutionLine[],
  "lets-go-pikachu": letsGoPikachu as unknown as EvolutionLine[],
  "lets-go-eevee": letsGoEevee as unknown as EvolutionLine[],
  "sword": sword as unknown as EvolutionLine[],
  "shield": shield as unknown as EvolutionLine[],
  "brilliant-diamond": brilliantDiamond as unknown as EvolutionLine[],
  "shining-pearl": shiningPearl as unknown as EvolutionLine[],
  "legends-arceus": legendsArceus as unknown as EvolutionLine[],
  "scarlet": scarlet as unknown as EvolutionLine[],
  "violet": violet as unknown as EvolutionLine[],
};

export function getGameData(slug: string): EvolutionLine[] | undefined {
  return GAME_DATA[slug];
}
