export type FlowPathType = "start" | "sales_data" | "sales_data_save" | "peer_data";

export const flowPaths: Record<NonNullable<FlowPathType>, string[]> = {
  start: ["e-start-gd"],
  sales_data: ["e-gd-datasave"],
  sales_data_save: ["e-datasave-db1"],
  peer_data: ["e-db2-peerdata"]
};
