import * as converter from "number-to-words";
import { TaxonomyData } from "./types";

export const isSubClass = (child: string, parent: string) => {
  return `is_subclass(${createReadableConst(child)}, ${createReadableConst(
    parent
  )}).\n`;
};

export const isA = (child: string, parent: string) => {
  return `is_a(${createReadableConst(child)}, ${createReadableConst(
    parent
  )}).\n`;
};

export const property = (child: string, parent: string) => {
  return `property(${createReadableConst(child)}, ${createReadableConst(
    parent
  )}).\n`;
};

export const roleProperty = (role: string) => {
  return `property(Ag, ${role})`;
};

export const delegate = (
  abbreviation: string,
  quantity: number,
  agent: string
) => {
  const parsedAbbreviation = createReadableConst(abbreviation);
  const parsedAgent = createReadableConst(agent);
  return `delegate(${parsedAbbreviation}, ${quantity}, ${parsedAgent}) :- ${deploy(
    parsedAbbreviation
  )} . \n`;
};

export const responsible = (
  abbreviation: string,
  role: string,
  agent: string
) => {
  const parsedAbbreviation = createReadableConst(abbreviation);
  const parsedAgent = createReadableConst(agent);
  const parsedRole = createReadableConst(role);
  return `responsible(${parsedAbbreviation}, Ag) :- ${deploy(
    parsedAbbreviation
  )}, ${roleProperty(parsedRole)}, ${member(parsedAgent)}`;
};

const deploy = (abbreviation: string) => {
  return `deploy(${abbreviation})`;
};

export const member = (agent: string) => {
  return `member(Ag, ${agent}). \n`;
};

export const collaborative = (abbreviation: string) => {
  return `collaborative(${createReadableConst(abbreviation)}) . \n`;
};

export const primitive = (abbreviation: string) => {
  return `primitive(${createReadableConst(abbreviation)}) . \n`;
};

export const mandatory = (abbreviation: string) => {
  return `\nmandatory(${createReadableConst(abbreviation)}) .\n\n`;
};

export const description = (abbreviation: string, action: string) => {
  return `description(${abbreviation}, "${action}") .`;
};

export const createReadableConst = (input: string) => {
  if (!input) {
    console.log("No input");
    return null;
  }
  const readableConst = input
    .replace(/\d.{2}/g, numberConverter)
    .replace(/\s/g, "")
    .replace(/[æøå]/g, "");
  return readableConst.charAt(0).toLowerCase() + readableConst.slice(1);
};

const numberConverter = (stringNumber: string) => {
  const ordinals = ["st", "nd", "rd", "th"];

  if (ordinals.includes(stringNumber.slice(-2).toLowerCase())) {
    return converter.toWordsOrdinal(stringNumber.slice(0, -2));
  }

  return stringNumber.replace(/\d/g, converter.toWordsOrdinal);
};

export const generateAgentSuperClass = (
  agents: string[],
  aspActions: string
) => {
  const superClassName = agents.join("");
  let superClassSection = "";

  if (aspActions.includes(superClassName)) {
    return [superClassName, superClassSection];
  }

  agents.forEach((agent) => {
    superClassSection += isSubClass(agent, superClassName);
  });
  superClassSection += isSubClass(superClassName, "agent");

  return [superClassName, superClassSection];
};

export const generateRoleSuperClass = (
  taxonomy: TaxonomyData[],
  roles: string[],
  aspActions: string
) => {
  const superClassName = roles.join("");
  let superClassSection = "";

  if (aspActions.includes(superClassName)) {
    return [superClassName, superClassSection];
  }

  roles.forEach((role) => {
    const agents = taxonomy.filter((el) => el.role == role);
    agents.map((el) => {
      superClassSection += property(el.agent, superClassName);
    });
  });

  superClassSection += isSubClass(superClassName, "agent");

  return [superClassName, superClassSection];
};
