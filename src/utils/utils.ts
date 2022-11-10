import axios from "axios";
import converter from "number-to-words";
import md5 from "md5";
import {
  Action,
  BackendResponse,
  CausalityData,
  ModelResponse,
  ProcedureData,
  TaxonomyData,
} from "../types";

export const generateSunburstData = (models: Action[][]) => {
  /**
   * Iterate through all the models, looking through all the data to set the correct
   * values and parents.
   */
  const values = generateValues(models);
  const sunburstData: any = [];
  models
    .map((model) => {
      let parents: string[] = [];
      return model.map((el: Action, j: number) => {
        const hash = md5(`${el.agent}${el.name}, at ${el.time}`);
        const id = `${hash}-${el.time}`;

        const parent = getParent(parents, el.time, j);

        parents.push(id);

        const sunburstSection = {
          id: id,
          parent: parent,
          name: `${el.agent}, ${el.name}, at ${el.time}`,
          value: 100 / values[el.time].length,
        };
        if (!sunburstData.some((section: any) => section.id === id)) {
          //Check if section already exist
          sunburstData.push(sunburstSection);
        }
      });
    })
    .flat(1);
  return sunburstData;
};

export const generateActionCardData = (models: Action[][]) => {
  const actionCardData: Action[][][] = [[[]]];

  models.forEach((model, i) => {
    model.forEach((action) => {
      try {
        actionCardData[i][action.time - 1].push(action);
      } catch (e) {
        console.log("catch error");
        actionCardData[i][action.time - 1] = [action];
      }
    });
  });
  console.log("ActionCardDAta ", actionCardData);

  return actionCardData;
};

const getParent = (parents: string[], time: number, index: number) => {
  /**
   *
   * Check through parents, and find latest parent from circle before.
   * 1. Every element should have a parent, except the first
   * 2. No elements should have parent at the same level
   * 3. The parent of a level should be the last in the previous
   * 4. All parents should have at least one child, if not on the last level
   */
  if (parents.length < 1) {
    //Satisfies #1
    return "";
  }

  //each entry in parents is a hashed value of agent, action and time with the time appended with dash: AD3df2dj84KaL8-1
  if (parseInt(parents[index - 1].split("-")[1]) === time && time === 1) {
    //Satistfies #2
    return "";
  }

  if (parseInt(parents[index - 1].split("-")[1]) === time) {
    /**
     * Child and parent occur on the same level. Need to find element from previous level
     * Currently this is causing issues, since it's finding the last element from the previous level
     * and all the models has the same action and agent as the last element.
     */
    for (let i = 0; i < parents.length; i++) {
      if (parseInt(parents[i].split("-")[1]) === time) {
        //Means we reached current level, and should set the previous element as parent
        return parents[i - 1];
      }
    }
  } else {
    return parents[index - 1];
  }
};

const generateValues = (models: any) => {
  /**
   * Estimate value for each section by finding out how many sections are
   * on the current level.
   */
  const valueEstimator: any = [];
  models.map((model: any, i: number) => {
    model.map((el: Action, j: number) => {
      const hash = md5(`${el.agent}${el.name}, at ${el.time}`);
      if (typeof valueEstimator[el.time] === "undefined") {
        valueEstimator[el.time] = [];
      }

      if (valueEstimator[el.time].indexOf(hash) === -1) {
        valueEstimator[el.time].push(`${hash}`);
      }
    });
  });
  return valueEstimator;
};

export const getASPModels = (
  procedure: ProcedureData[],
  taxonomy: TaxonomyData[],
  requestData: any,
  endpoint: string,
  numberOfModels: number
): Promise<BackendResponse> => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL
    ? process.env.REACT_APP_BACKEND_URL + endpoint
    : `http://localhost:5001/delegation-sequencing-d8ae4/us-central1/api/${endpoint}`;

  return axios({
    method: "post",
    url: backendUrl,
    data: requestData,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      const data = res.data;
      console.log("BACKEND RESPONSE: ", data);
      if (data.Result !== "OPTIMUM FOUND") {
        throw new Error(data.Result);
      }
      const [optimum] = data.Call[0].Witnesses.slice(-1);
      const optimumCost = optimum.Costs[0];
      const optimumModels = data.Call[0].Witnesses.filter((el: any) => {
        return el.Costs[0] === optimumCost;
      });
      return optimumModels.slice(-numberOfModels);
    })
    .then((models) => parseModels(models, procedure, taxonomy))
    .catch((error: any) => {
      console.log("error", error);
      if (error.response) {
        return { error: error.response?.data };
      } else {
        return { error: error.message };
      }
    });
};

export const causalityThresholdReached = (
  causalitySelection: string[],
  causalityData: CausalityData[]
) => {
  const [causality, comparisonOperator, threshold] = causalitySelection;
  const value = causalityData.find(
    (el: CausalityData) => el.causality === causality
  )?.value;

  if (!value) {
    console.log("Cold not find value for ", causality);
    return false;
  }

  console.log(`${causality} of ${value} is ${comparisonOperator} ${threshold}`);
  let res: boolean;
  switch (comparisonOperator) {
    case "Less than":
      console.log("Less than");
      res = value < threshold;
      console.log(res);
      return res;
    case "Greater than":
      console.log("Greater than");
      res = value > threshold;
      console.log(res);
      return res;
    case "Equal to":
      console.log("Equal to");
      res = value === threshold;
      console.log(res);
      return res;
  }
};

const parseModels = (
  optimumModels: Action[],
  procedure: ProcedureData[],
  taxonomy: TaxonomyData[]
): ModelResponse => {
  let parsedModels: any = [];
  let previousModel: string[] = [];
  optimumModels.map((model: any) => {
    let tmpParsedModel: any = [];
    model.Value.map((el: string) => {
      const parsedPrevious = el.replace("expedite", "previous") + ".";
      previousModel.push(parsedPrevious);
      const expedite = el.replaceAll('"', "").split(/[\(\)\s,]+/);
      const abbreviation = expedite[1];
      const agent = expedite[2];
      const time = parseInt(expedite[3]);

      console.log("readableconst", createReadableConst("FA"));
      console.log("abbreviation", abbreviation);
      console.log("procedure", procedure);
      // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
      const actionLookup = procedure.find(
        (el: ProcedureData) =>
          createReadableConst(el.abbreviation) === abbreviation
      ).action;

      // @ts-ignore: Object is possibly 'undefined'. //https://github.com/microsoft/TypeScript/issues/29642
      const agentLookup = taxonomy.find(
        (el: TaxonomyData) => createReadableConst(el.agent) === agent
      ).agent;

      const actionObject: Action = {
        name: actionLookup,
        agent: agentLookup,
        time: time,
      };
      tmpParsedModel.push(actionObject);
    });
    parsedModels.push(tmpParsedModel);
  });

  parsedModels.map((model: any) => {
    model.sort((a: any, b: any) =>
      a.time > b.time ? 1 : b.time > a.time ? -1 : 0
    );
  });

  return { newModels: parsedModels, newPreviousModel: previousModel };
};

export const unique = (value: any, index: any, self: any) => {
  return self.indexOf(value) === index;
};

//This is the same function as used in backend, but needs to be used frontend as well to "deserialize" the const back
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
