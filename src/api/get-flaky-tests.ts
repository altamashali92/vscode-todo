import { QuarantinedTest } from "../types";
import { data } from "./data";

export async function getFlakyTests() {
  const res = await Promise.resolve(data);
  if (!res.success) {
    throw new Error(res.message);
  }
  return res.data as QuarantinedTest[];
}
