// @flow
import {type CredrankInput, type CredrankOutput} from "../main/credrank";
import {type GraphInput, type GraphOutput} from "../main/graph";
import {type GrainInput} from "../main/grain";
import {type AnalysisInput, type AnalysisOutput} from "../main/analysis";
import {CredGraph} from "../../core/credrank/credGraph";
import {type WeightedGraph} from "../../core/weightedGraph";
import {Ledger} from "../../core/ledger/ledger";

/**
  Simple read interface for inputs and outputs of the main SourceCred API.
 */
export interface ReadOnlyInstance {
  /** Reads inputs required to run Graph. */
  readGraphInput(): Promise<GraphInput>;
  /** Reads inputs required to run CredRank. */
  readCredrankInput(): Promise<CredrankInput>;
  /** Reads inputs required to run Grain. */
  readGrainInput(): Promise<GrainInput>;
  /** Reads inputs required to run Analysis. */
  readAnalysisInput(): Promise<AnalysisInput>;

  /** Reads a weighted graph generated by a previous run of Graph. */
  readWeightedGraphForPlugin(pluginId: string): Promise<WeightedGraph>;
  /** Reads a cred graph generated by a previous run of CredRank. */
  readCredGraph(): Promise<CredGraph>;
  /** Reads a ledger. */
  readLedger(): Promise<Ledger>;
}

/**
  Simple read/write interface for inputs and outputs of the main SourceCred API.
 */
export interface Instance extends ReadOnlyInstance {
  /** Writes output after running Graph. */
  writeGraphOutput(graphOutput: GraphOutput): Promise<void>;
  /** Writes output after running CredRank. */
  writeCredrankOutput(credrankOutput: CredrankOutput): Promise<void>;
  /** Writes output after running Analysis. */
  writeAnalysisOutput(analysisOutput: AnalysisOutput): Promise<void>;

  /** Writes a ledger. */
  writeLedger(ledger: Ledger): Promise<void>;
}
