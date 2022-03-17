import React from "react";
// cards
import { parts } from "../parts/parts";
import _r1 from "../assets/images/rarity/_rarity_1.png";
import _r2 from "../assets/images/rarity/_rarity_2.png";
import _r3 from "../assets/images/rarity/_rarity_3.png";

const ZombieRenderer = ({ zombie = null, size = 200, style }) => {
  if (!zombie) {
    return null;
  }
  let rarity = _r1;

  if (zombie.rarity >= 80) {
    rarity = _r2;
  }
  if (zombie.rarity >= 95) {
    rarity = _r3;
  }

  let dnaStr = String(zombie.dna);

  while (dnaStr.length < 16) dnaStr = "0" + dnaStr;

  let zombieDeatils = {
    bg: dnaStr.substring(0, 2) % 5,
    mask: dnaStr.substring(2, 4) % 5,
    line: dnaStr.substring(4, 6) % 5,
    addon: dnaStr.substring(6, 8) % 5,
    addonMouth1: dnaStr.substring(8, 10) % 5,
    addonMouth2: dnaStr.substring(10, 12) % 5,
    addonMouth3: dnaStr.substring(12, 14) % 5,
    name: zombie.name,
  };

  const zombieStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
  };

  return (
    <div
      style={{
        minWidth: size,
        minHeight: size,
        background: "blue",
        position: "relative",
        ...style,
      }}
    >
      <img alt={"bg"} src={parts.bg[zombieDeatils.bg]} style={zombieStyle} />
      <img alt={"mask"} src={parts.mask[zombieDeatils.mask]} style={zombieStyle} />
      <img alt={"line"} src={parts.line[zombieDeatils.line]} style={zombieStyle} />
      <img alt={"addon"} src={parts.addon[zombieDeatils.addon]} style={zombieStyle} />
      <img
        alt={"addon_mouth"}
        src={parts.addonMouth1[zombieDeatils.addonMouth1]}
        style={zombieStyle}
      />
      <img
        alt={"addon_mouth"}
        src={parts.addonMouth2[zombieDeatils.addonMouth2]}
        style={zombieStyle}
      />
      <img
        alt={"addon_mouth"}
        src={parts.addonMouth3[zombieDeatils.addonMouth3]}
        style={zombieStyle}
      />
      <img alt={"rarity"} src={rarity} style={zombieStyle} />
    </div>
  );
};

export default ZombieRenderer;
