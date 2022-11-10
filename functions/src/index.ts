import * as functions from "firebase-functions";
import * as express from "express";
import * as clingo from "clingo-wasm";
import * as fs from "fs";
import { generateAspString, sortModels } from "./utils";
import { Response } from "./types";

const app = express();

const cors = require("cors");
app.use(cors());
app.use("*", cors());
app.enable("trust proxy");
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

exports.api = functions.https.onRequest(app);

app.post("/revise", async (req, res) => {
  const reqBody = req.body;
  const previousModel = reqBody.previousModel.join("");
  const changes = reqBody.changes.join("");
  const revision = previousModel + changes;

  const control = fs.readFileSync("src/asp/control.lp", "utf8");
  const actions = fs.readFileSync("src/asp/actions.lp", "utf8");
  const newModels: clingo.ClingoResult | clingo.ClingoError = await clingo.run(
    control + actions + revision,
    0
  );
  console.log("models: ", newModels);
  res.status(200).json(newModels);
});

app.post("/initial", async (req, res) => {
  console.log("/initial request received");
  const reqBody = req.body;
  const [aspString, error] = generateAspString(reqBody);
  if (error) {
    const response = error as Response;
    res.status(response.status).json(response.body);
  }

  console.log("Successfully generated asp strings");
  if (aspString) {
    console.log("Reading as control file");
    const control = fs.readFileSync("src/asp/control.lp", "utf8");
    console.log("Running clingo on asp files");
    const models: clingo.ClingoResult | clingo.ClingoError = await clingo.run(
      control + aspString,
      0
    );
    console.log(models);
    if (models.Result === "ERROR") {
      res
        .status(500)
        .json({ function: "clingo.run", reason: "invalid asp format" });
    } else {
      const sortedModels = sortModels(models);
      res.status(sortedModels.status).json(sortedModels.body);
    }
  }
});
