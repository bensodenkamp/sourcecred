// @flow

import {DataStorage, WritableDataStorage} from "./index";
import normalize from "../../util/pathNormalize";
import {join as pathJoin, isAbsolute} from "path";
import fetch from "cross-fetch";
import {decode} from "./textEncoding";

const normalizePath = (base: string, resource: string) => {
  const path = normalize(pathJoin(base, resource));
  if (
    !path.startsWith(base) &&
    (path.startsWith("..") || isAbsolute(path) || base !== ".")
  )
    throw new Error(
      `Path traversal is not allowed. ${path} is not a subpath of ${base}`
    );
  return path;
};

/**
 * This class serves as a simple wrapper for http GET requests using fetch.
 */
export class OriginStorage implements DataStorage, WritableDataStorage {
  _base: string;

  constructor(base: string) {
    this._base = normalize(base);
  }

  /**
   * This get method will error if a non-200 or 300-level status was returned.
   */
  async get(resource: string): Promise<Uint8Array> {
    const path = normalizePath(this._base, resource);
    const result = await fetch(path);
    if (!result.ok) {
      const error = new Error(
        `Error fetching ${resource}: ${result.status} ${result.statusText}`
      );
      error.number = result.status;
      throw error;
    }

    return new Uint8Array(await result.arrayBuffer());
  }

  async set(resource: string, value: Uint8Array) {
    const path = normalizePath(this._base, resource);
    const valueDecoded = decode(value);
    await fetch(path, {
      headers: {
        Accept: "text/plain",
        "Content-Type": "text/plain",
      },
      method: "POST",
      body: valueDecoded,
    });
  }
}
