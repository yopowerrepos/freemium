export type DistributeOption = "lessItems" | "moreItems" | "random";

export interface _911AnyQueueItem {
    add: boolean;
    remove: boolean;
    pick: boolean;
    release: boolean;
    distributeOptions: DistributeOption[] | null;
}
