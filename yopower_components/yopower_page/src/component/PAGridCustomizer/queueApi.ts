import { IInputs } from "./generated/ManifestTypes";

export interface QueueOption {
  queueid: string;
  name: string;
  numberofitems?: number;
  numberofmembers?: number;
  queueviewtype?: number;
  "queueviewtype@OData.Community.Display.V1.FormattedValue"?: string;
}

export interface QueueMemberOption {
  id: string;
  name: string;
  type: "systemuser" | "team";
}

export interface QueueItemRecord {
  queueitemid: string;
  _workerid_value?: string;
  _queueid_value?: string;
  enteredon: string;
  workeridmodifiedon?: string;
  statuscode: number;
  "statuscode@OData.Community.Display.V1.FormattedValue"?: string;
  "queue.name"?: string;
  "queue.numberofitems"?: number;
  "queue.numberofmembers"?: number;
  "queue.queueviewtype"?: number;
  "queue.queueviewtype@OData.Community.Display.V1.FormattedValue"?: string;
  "worker.systemuserid"?: string;
  "worker.fullname"?: string;
}

export class QueueApiClient {
  private context: ComponentFramework.Context<IInputs>;

  constructor(context: ComponentFramework.Context<IInputs>) {
    this.context = context;
  }

  private getBaseUrl(): string {
    const page: any = (this.context as any).page;
    return `${page.getClientUrl()}/api/data/v9.2`;
  }

  private defaultHeaders() {
    return {
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8"
    };
  }

  private async handle(response: Response): Promise<any> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.error?.message || `HTTP ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
  }

  async getQueueItems(entityLogicalName: string, recordId: string): Promise<QueueItemRecord[]> {
    const fetchXml = `<fetch>
  <entity name="queueitem">
    <attribute name="queueitemid" />
    <attribute name="queueid" />
    <attribute name="workerid" />
    <attribute name="workeridmodifiedon" />
    <attribute name="enteredon" />
    <attribute name="statuscode" />
    <attribute name="statecode" />
    <order attribute="enteredon" descending="true" />
    <link-entity name="queue" from="queueid" to="queueid" link-type="outer" alias="queue">
      <attribute name="name" />
      <attribute name="numberofitems" />
      <attribute name="numberofmembers" />
      <attribute name="queueviewtype" />
    </link-entity>
    <link-entity name="systemuser" from="systemuserid" to="workerid" link-type="outer" alias="worker">
      <attribute name="systemuserid" />
      <attribute name="fullname" />
    </link-entity>
    <filter type="and">
      <condition attribute="objectid" operator="eq" uitype="${entityLogicalName}" value="${recordId}" />
    </filter>
  </entity>
</fetch>`;

    const result: ComponentFramework.WebApi.RetrieveMultipleResponse = await this.context.webAPI.retrieveMultipleRecords("queueitem", `?fetchXml=${fetchXml}`);
    return result.entities as QueueItemRecord[];
  }

  async listActiveQueues(): Promise<QueueOption[]> {
    const result: ComponentFramework.WebApi.RetrieveMultipleResponse = await this.context.webAPI.retrieveMultipleRecords(
      "queue",
      "?$select=queueid,name,numberofitems,numberofmembers,queueviewtype&$filter=statecode eq 0&$orderby=name asc"
    );
    return result.entities as QueueOption[];
  }

  async getQueueMembers(queueId: string): Promise<QueueMemberOption[]> {
    // Team membership isn't wired up yet - only systemuser members of the queue are returned.
    const fetchXml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" count="5000" no-lock="false">
  <entity name="systemuser">
    <attribute name="systemuserid" />
    <attribute name="fullname" />
    <filter type="and">
      <condition attribute="fullname" operator="ne" value="SYSTEM" />
      <condition attribute="fullname" operator="ne" value="INTEGRATION" />
      <condition attribute="systemmanagedusertype" operator="eq" value="0" />
    </filter>
    <link-entity name="queuemembership" intersect="true" visible="false" to="systemuserid" from="systemuserid">
      <link-entity name="queue" from="queueid" to="queueid" alias="queue">
        <filter type="and">
          <condition attribute="queueid" operator="eq" value="${queueId}" />
        </filter>
      </link-entity>
    </link-entity>
  </entity>
</fetch>`;

    const result: ComponentFramework.WebApi.RetrieveMultipleResponse = await this.context.webAPI.retrieveMultipleRecords("systemuser", `?fetchXml=${fetchXml}`);
    return result.entities.map((entity) => ({ id: entity.systemuserid as string, name: entity.fullname as string, type: "systemuser" as const }));
  }

  async getWorkerItemCounts(workerIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    if (workerIds.length === 0) return counts;

    const values = workerIds.map((id) => `<value>${id}</value>`).join("");
    const fetchXml = `<fetch aggregate="true">
  <entity name="queueitem">
    <attribute name="workerid" alias="workerid" groupby="true" />
    <attribute name="queueitemid" alias="itemcount" aggregate="count" />
    <filter type="and">
      <condition attribute="workerid" operator="in">${values}</condition>
    </filter>
  </entity>
</fetch>`;

    const result: ComponentFramework.WebApi.RetrieveMultipleResponse = await this.context.webAPI.retrieveMultipleRecords("queueitem", `?fetchXml=${fetchXml}`);
    for (const entity of result.entities) {
      const workerId = (entity["workerid"] as string | undefined)?.replace(/[{}]/g, "");
      if (workerId) counts[workerId] = entity["itemcount"] as number;
    }
    return counts;
  }

  async addToQueue(entityLogicalName: string, recordId: string, destinationQueueId: string, sourceQueueId?: string): Promise<{ QueueItemId: string }> {
    const idAttribute = `${entityLogicalName}id`;
    const body: any = {
      Target: {
        "@odata.type": `Microsoft.Dynamics.CRM.${entityLogicalName}`,
        [idAttribute]: recordId
      }
    };
    if (sourceQueueId) {
      body.SourceQueue = {
        "@odata.type": "Microsoft.Dynamics.CRM.queue",
        queueid: sourceQueueId
      };
    }

    const response = await fetch(`${this.getBaseUrl()}/queues(${destinationQueueId})/Microsoft.Dynamics.CRM.AddToQueue`, {
      method: "POST",
      headers: this.defaultHeaders(),
      body: JSON.stringify(body)
    });
    return this.handle(response);
  }

  async removeFromQueue(queueItemId: string): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/queueitems(${queueItemId})/Microsoft.Dynamics.CRM.RemoveFromQueue`, {
      method: "POST",
      headers: this.defaultHeaders()
    });
    return this.handle(response);
  }

  async workOn(queueItemId: string, workerId: string, workerEntityType: "systemuser" | "team" = "systemuser"): Promise<void> {
    // The PickFromQueue action also reassigns ownership of the target record, which fails for
    // entities that aren't user/team-owned. Set the worker directly on the queueitem instead.
    const navigationProperty = workerEntityType === "team" ? "workerid_team" : "workerid_systemuser";
    await this.context.webAPI.updateRecord("queueitem", queueItemId, {
      [`${navigationProperty}@odata.bind`]: `/${workerEntityType}s(${workerId})`
    });
  }

  async returnToQueue(queueItemId: string): Promise<void> {
    await this.context.webAPI.updateRecord("queueitem", queueItemId, {
      ["_workerid_value"]: null
    });
  }
}
