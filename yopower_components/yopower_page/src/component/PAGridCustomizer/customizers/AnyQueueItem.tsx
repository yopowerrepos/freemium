import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { _911AnyQueueItem, DistributeOption } from "../models/customizers/_911AnyQueueItem";
import { Icon, Text } from "@fluentui/react";
import {
    Button,
    Spinner,
    FluentProvider,
    IdPrefixProvider,
    webLightTheme,
    PopoverTrigger,
    PopoverSurface,
    Popover,
    Combobox,
    Option,
    Badge
} from "@fluentui/react-components";
import { QueueApiClient, QueueItemRecord, QueueMemberOption, QueueOption } from "../queueApi";

const DISTRIBUTE_LABELS: Record<DistributeOption, string> = {
    lessItems: "Assign to least busy",
    moreItems: "Assign to most busy",
    random: "Assign randomly"
};

const DISTRIBUTE_ICONS: Record<DistributeOption, string> = {
    lessItems: "GroupedDescending",
    moreItems: "GroupedAscending",
    random: "StatusCircleQuestionMark"
};

const ICON_BUTTON_STYLE: React.CSSProperties = { minWidth: 24, maxWidth: 24, height: 24, padding: 0, flexShrink: 0 };

const pluralize = (value: number, unit: string): string => `${value} ${unit}${value === 1 ? "" : "s"}`;

const formatElapsed = (from: Date, to: Date): string => {
    if (to.getTime() <= from.getTime()) {
        return "0 minutes";
    }

    let years = to.getFullYear() - from.getFullYear();
    let months = to.getMonth() - from.getMonth();
    let days = to.getDate() - from.getDate();
    let hours = to.getHours() - from.getHours();
    let minutes = to.getMinutes() - from.getMinutes();

    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        const daysInPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
        days += daysInPrevMonth;
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    const parts: string[] = [];
    if (years > 0) parts.push(pluralize(years, "year"));
    if (months > 0) parts.push(pluralize(months, "month"));
    if (days > 0) parts.push(pluralize(days, "day"));
    if (hours > 0) parts.push(pluralize(hours, "hour"));
    if (minutes > 0 || parts.length === 0) parts.push(pluralize(minutes, "minute"));

    return parts.join(", ");
};

export const AnyQueueItem: React.FC<ICell> = (cell) => {
    const params = JSON.parse(cell.definition.parameters) as _911AnyQueueItem;

    const client = React.useMemo(() => new QueueApiClient(cell.context), [cell.context]);

    const [items, setItems] = React.useState<QueueItemRecord[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [busy, setBusy] = React.useState<boolean>(false);
    const [showQueuePicker, setShowQueuePicker] = React.useState<boolean>(false);
    const [queues, setQueues] = React.useState<QueueOption[]>([]);
    const [queueSearch, setQueueSearch] = React.useState<string>("");
    const [selectedQueueId, setSelectedQueueId] = React.useState<string>("");

    const [showMemberPicker, setShowMemberPicker] = React.useState<boolean>(false);
    const [membersLoading, setMembersLoading] = React.useState<boolean>(false);
    const [memberOptions, setMemberOptions] = React.useState<QueueMemberOption[]>([]);
    const [memberSearch, setMemberSearch] = React.useState<string>("");
    const [selectedMemberId, setSelectedMemberId] = React.useState<string>("");

    const [showDistributePanel, setShowDistributePanel] = React.useState<boolean>(false);
    const [distributeLoading, setDistributeLoading] = React.useState<boolean>(false);
    const [distributeWorkload, setDistributeWorkload] = React.useState<Array<QueueMemberOption & { count: number }>>([]);
    const [selectedStrategy, setSelectedStrategy] = React.useState<DistributeOption | null>(null);
    const [hoveredStrategy, setHoveredStrategy] = React.useState<DistributeOption | null>(null);

    const [now, setNow] = React.useState<Date>(() => new Date());
    React.useEffect(() => {
        const intervalId = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(intervalId);
    }, []);

    const loadItems = React.useCallback(async () => {
        setLoading(true);
        try {
            const result = await client.getQueueItems(cell.table, cell.id);
            setItems(result);
        } catch (error) {
            console.error("Error fetching queue items:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [client, cell.table, cell.id]);

    React.useEffect(() => {
        loadItems();
    }, [loadItems]);

    const current = items.length > 0 ? items[0] : null;
    const pastItems = items.slice(1);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setShowMemberPicker(false);
            setMemberSearch("");
            setSelectedMemberId("");
            setShowQueuePicker(false);
            setQueueSearch("");
            setSelectedQueueId("");
            setShowDistributePanel(false);
            setSelectedStrategy(null);
            setHoveredStrategy(null);
            return;
        }
        if (params.add && queues.length === 0) {
            client.listActiveQueues()
                .then(setQueues)
                .catch((error) => console.error("Error fetching queues:", error));
        }
    };

    const handleToggleQueuePicker = () => {
        setShowQueuePicker((prev) => {
            const next = !prev;
            if (next) {
                setShowMemberPicker(false);
                setShowDistributePanel(false);
            }
            return next;
        });
        if (queues.length === 0) {
            client.listActiveQueues()
                .then(setQueues)
                .catch((error) => console.error("Error fetching queues:", error));
        }
    };

    const filteredQueues = React.useMemo(() => {
        const term = queueSearch.trim().toLowerCase();
        if (!term) return queues;
        return queues.filter((queue) => queue.name.toLowerCase().includes(term));
    }, [queues, queueSearch]);

    const confirm = async (text: string, confirmButtonLabel: string): Promise<boolean> => {
        const response = await cell.context.navigation.openConfirmDialog(
            { text, confirmButtonLabel, cancelButtonLabel: "Cancel" }
        );
        return response.confirmed;
    };

    const handleAdd = async () => {
        if (!selectedQueueId) return;
        setBusy(true);
        try {
            await client.addToQueue(cell.table, cell.id, selectedQueueId, current?._queueid_value);
            setSelectedQueueId("");
            setQueueSearch("");
            setShowQueuePicker(false);
            setShowMemberPicker(false);
            setMemberSearch("");
            setSelectedMemberId("");
            setShowDistributePanel(false);
            setSelectedStrategy(null);
            setHoveredStrategy(null);
            await loadItems();
        } catch (error) {
            console.error("Error adding to queue:", error);
        } finally {
            setBusy(false);
        }
    };

    const handleRemove = async () => {
        if (!current) return;
        const confirmed = await confirm("Are you sure you want to remove this item from the queue?", "Remove");
        if (!confirmed) return;
        setBusy(true);
        try {
            await client.removeFromQueue(current.queueitemid);
            await loadItems();
        } catch (error) {
            console.error("Error removing from queue:", error);
        } finally {
            setBusy(false);
        }
    };

    const handleWorkOnMe = async () => {
        if (!current) return;
        setBusy(true);
        try {
            const userId = ((cell.context.userSettings as any).userId as string).replace(/[{}]/g, "");
            await client.workOn(current.queueitemid, userId);
            await loadItems();
        } catch (error) {
            console.error("Error working on queue item:", error);
        } finally {
            setBusy(false);
        }
    };

    const isPrivateQueue = current?.["queue.queueviewtype"] === 1;

    const handleWorkOnAnother = async () => {
        if (!current) return;

        setShowQueuePicker(false);
        setShowDistributePanel(false);
        setShowMemberPicker(true);
        setMemberSearch("");
        setSelectedMemberId("");
        if (current._queueid_value) {
            setMembersLoading(true);
            try {
                const members = await client.getQueueMembers(current._queueid_value);
                setMemberOptions(members);
            } catch (error) {
                console.error("Error fetching queue members:", error);
            } finally {
                setMembersLoading(false);
            }
        }
    };

    const handleAssignToMember = async () => {
        if (!current || !selectedMemberId) return;
        const member = memberOptions.find((m) => m.id === selectedMemberId);
        if (!member) return;

        setBusy(true);
        try {
            await client.workOn(current.queueitemid, member.id, member.type);
            setShowMemberPicker(false);
            setMemberSearch("");
            setSelectedMemberId("");
            await loadItems();
        } catch (error) {
            console.error("Error working on queue item:", error);
        } finally {
            setBusy(false);
        }
    };

    const loadDistributionWorkload = React.useCallback(async (): Promise<Array<QueueMemberOption & { count: number }>> => {
        if (!current?._queueid_value) return [];
        const members = await client.getQueueMembers(current._queueid_value);
        const counts = await client.getWorkerItemCounts(members.map((m) => m.id));
        return members.map((m) => ({ ...m, count: counts[m.id] ?? 0 }));
    }, [client, current?._queueid_value]);

    const handleToggleDistributePanel = () => {
        const willOpen = !showDistributePanel;
        setShowDistributePanel(willOpen);
        if (willOpen) {
            setShowQueuePicker(false);
            setShowMemberPicker(false);
            setDistributeLoading(true);
            loadDistributionWorkload()
                .then((workload) => setDistributeWorkload([...workload].sort((a, b) => b.count - a.count)))
                .catch((error) => console.error("Error loading distribution workload:", error))
                .finally(() => setDistributeLoading(false));
        }
    };

    const handleDistribute = async (strategy: DistributeOption) => {
        if (!current) return;
        setSelectedStrategy(strategy);
        setBusy(true);
        try {
            const workload = await loadDistributionWorkload();
            if (workload.length === 0) return;

            let target: QueueMemberOption;
            if (strategy === "random") {
                target = workload[Math.floor(Math.random() * workload.length)];
            } else {
                const sorted = [...workload].sort((a, b) => strategy === "lessItems" ? a.count - b.count : b.count - a.count);
                target = sorted[0];
            }

            await client.workOn(current.queueitemid, target.id, target.type);
            setShowDistributePanel(false);
            setSelectedStrategy(null);
            setHoveredStrategy(null);
            await loadItems();
        } catch (error) {
            console.error("Error distributing queue item:", error);
        } finally {
            setBusy(false);
        }
    };

    const handleReturnToQueue = async () => {
        if (!current) return;
        const confirmed = await confirm("Are you sure you want to release this item back to the queue?", "Release");
        if (!confirmed) return;
        setBusy(true);
        try {
            await client.returnToQueue(current.queueitemid);
            await loadItems();
        } catch (error) {
            console.error("Error returning to queue:", error);
        } finally {
            setBusy(false);
        }
    };

    const queueName = current?.["queue.name"];
    const workerName = current?.["worker.fullname"];
    const numberOfItems = current?.["queue.numberofitems"];
    const numberOfMembers = current?.["queue.numberofmembers"];
    const queueViewTypeLabel = current?.["queue.queueviewtype@OData.Community.Display.V1.FormattedValue"];
    const hasWorker = !!current?._workerid_value;
    const workerModifiedOn = current?.workeridmodifiedon;

    const label = current
        ? `${queueName ?? ""} - ${workerName ?? "Unassigned"}`
        : "No active queue";

    const filteredMembers = React.useMemo(() => {
        const term = memberSearch.trim().toLowerCase();
        if (!term) return memberOptions;
        return memberOptions.filter((member) => member.name.toLowerCase().includes(term));
    }, [memberOptions, memberSearch]);

    const hoveredTargetId = React.useMemo(() => {
        if (!hoveredStrategy || hoveredStrategy === "random" || distributeWorkload.length === 0) return null;
        const sorted = [...distributeWorkload].sort((a, b) => hoveredStrategy === "lessItems" ? a.count - b.count : b.count - a.count);
        return sorted[0].id;
    }, [hoveredStrategy, distributeWorkload]);

    return (
        <FluentProvider theme={webLightTheme}>
            <IdPrefixProvider value={"page-911-" + cell.table + "-" + cell.id}>
                <div
                    style={{
                        padding: "4px 8px",
                        borderRadius: 2,
                        lineHeight: "20px",
                        display: "flex",
                        alignItems: "center",
                        margin: "4px",
                        gap: 4
                    }}>
                    <Popover withArrow onOpenChange={(_, data) => handleOpenChange(data.open)}>
                        <PopoverTrigger disableButtonEnhancement>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                }}
                                title={label}>
                                <Icon iconName="Group" style={{ marginRight: 3 }} />
                                {loading ? <Spinner size="tiny" /> : <span>{label}</span>}
                            </div>
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1} style={{ width: 320, display: "flex", flexDirection: "column", gap: 8 }}>
                            {current ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                        <Text variant="mediumPlus" style={{ fontWeight: 600 }}>{queueName}</Text>
                                        {queueViewTypeLabel && (
                                            <Badge
                                                appearance={isPrivateQueue ? "filled" : "tint"}
                                                color={isPrivateQueue ? undefined : "informative"}
                                                style={isPrivateQueue ? { backgroundColor: "#000", color: "#fff" } : undefined}>
                                                {queueViewTypeLabel}
                                            </Badge>
                                        )}
                                    </div>
                                    <Text variant="small"><strong>Worker:</strong> {workerName ?? "Unassigned"}</Text>
                                    <Text variant="small"><strong>{numberOfItems ?? 0} items · {numberOfMembers ?? 0} members</strong></Text>
                                    {current.enteredon && (
                                        <Text variant="small">
                                            <strong>Entered On:</strong> {new Date(current.enteredon).toLocaleString()} ({formatElapsed(new Date(current.enteredon), now)})
                                        </Text>
                                    )}
                                    {hasWorker && workerModifiedOn && (
                                        <Text variant="small">
                                            <strong>Assigned On:</strong> {new Date(workerModifiedOn).toLocaleString()} ({formatElapsed(new Date(workerModifiedOn), now)})
                                        </Text>
                                    )}
                                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                                        {params.pick && !hasWorker && (
                                            <Button
                                                size="small"
                                                style={ICON_BUTTON_STYLE}
                                                disabled={busy}
                                                title="Assign to me"
                                                icon={busy ? <Spinner size="tiny" /> : <Icon iconName="AddFriend" />}
                                                onClick={handleWorkOnMe} />
                                        )}
                                        {params.pick && !hasWorker && isPrivateQueue && (
                                            <Button
                                                size="small"
                                                style={ICON_BUTTON_STYLE}
                                                disabled={busy}
                                                title="Assign to another user"
                                                icon={busy ? <Spinner size="tiny" /> : <Icon iconName="ProfileSearch" />}
                                                onClick={handleWorkOnAnother} />
                                        )}
                                        {params.pick && !hasWorker && isPrivateQueue && params.distributeOptions && params.distributeOptions.length > 0 && (
                                            <Button
                                                size="small"
                                                style={ICON_BUTTON_STYLE}
                                                disabled={busy}
                                                title="Distribute automatically"
                                                icon={busy ? <Spinner size="tiny" /> : <Icon iconName="Transition" />}
                                                onClick={handleToggleDistributePanel} />
                                        )}
                                        {params.release && hasWorker && (
                                            <Button
                                                size="small"
                                                style={ICON_BUTTON_STYLE}
                                                disabled={busy}
                                                title="Release"
                                                icon={busy ? <Spinner size="tiny" /> : <Icon iconName="OpenFile" />}
                                                onClick={handleReturnToQueue} />
                                        )}
                                        {params.add && (
                                            <Button
                                                size="small"
                                                style={ICON_BUTTON_STYLE}
                                                disabled={busy}
                                                title="Move to Queue"
                                                icon={<Icon iconName="AddToShoppingList" />}
                                                onClick={handleToggleQueuePicker} />
                                        )}
                                        {params.remove && (
                                            <Button
                                                size="small"
                                                disabled={busy}
                                                title="Remove"
                                                style={{ ...ICON_BUTTON_STYLE, marginLeft: "auto" }}
                                                icon={busy ? <Spinner size="tiny" /> : <Icon iconName="RemoveFromShoppingList" />}
                                                onClick={handleRemove} />
                                        )}
                                    </div>
                                    {showMemberPicker && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid #eee", paddingTop: 8 }}>
                                            <Text variant="small">Assign to queue member</Text>
                                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                                <Combobox
                                                    size="small"
                                                    placeholder={membersLoading ? "Loading members..." : "Search members..."}
                                                    value={memberSearch}
                                                    selectedOptions={selectedMemberId ? [selectedMemberId] : []}
                                                    onChange={(e) => {
                                                        setMemberSearch(e.target.value);
                                                        setSelectedMemberId("");
                                                    }}
                                                    onOptionSelect={(_, data) => {
                                                        setSelectedMemberId(data.optionValue ?? "");
                                                        setMemberSearch(data.optionText ?? "");
                                                    }}
                                                    style={{ flex: 1, minWidth: 0 }}
                                                    listbox={{ style: { minWidth: 320 } }}>
                                                    {filteredMembers.map((member) => (
                                                        <Option key={member.id} value={member.id} text={member.name}>
                                                            {member.name}
                                                        </Option>
                                                    ))}
                                                </Combobox>
                                                <Button
                                                    size="small"
                                                    appearance="primary"
                                                    style={{ flexShrink: 0 }}
                                                    disabled={busy || !selectedMemberId}
                                                    icon={busy ? <Spinner size="tiny" /> : <Icon iconName="UserEvent" />}
                                                    onClick={handleAssignToMember}>
                                                    Assign
                                                </Button>
                                                <Button
                                                    size="small"
                                                    style={ICON_BUTTON_STYLE}
                                                    disabled={busy}
                                                    title="Cancel"
                                                    icon={<Icon iconName="Cancel" />}
                                                    onClick={() => setShowMemberPicker(false)} />
                                            </div>
                                        </div>
                                    )}
                                    {showDistributePanel && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid #eee", paddingTop: 8 }}>
                                            {distributeLoading ? (
                                                <Spinner size="tiny" />
                                            ) : distributeWorkload.length === 0 ? (
                                                <Text variant="small">No members found for this queue.</Text>
                                            ) : (
                                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                                    {distributeWorkload.map((member) => (
                                                        <Text
                                                            variant="small"
                                                            key={member.id}
                                                            style={member.id === hoveredTargetId ? { backgroundColor: "#deecf9", fontWeight: 600 } : undefined}>
                                                            {member.name} · {member.count}
                                                        </Text>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", gap: 4 }}>
                                                {params.distributeOptions?.map((option) => (
                                                    <Button
                                                        key={option}
                                                        size="small"
                                                        appearance={selectedStrategy === option ? "primary" : undefined}
                                                        style={ICON_BUTTON_STYLE}
                                                        disabled={busy}
                                                        title={DISTRIBUTE_LABELS[option]}
                                                        icon={<Icon iconName={DISTRIBUTE_ICONS[option]} />}
                                                        onMouseEnter={() => setHoveredStrategy(option)}
                                                        onMouseLeave={() => setHoveredStrategy((prev) => prev === option ? null : prev)}
                                                        onClick={() => handleDistribute(option)} />
                                                ))}
                                                <Button
                                                    size="small"
                                                    style={ICON_BUTTON_STYLE}
                                                    disabled={busy}
                                                    title="Cancel"
                                                    icon={<Icon iconName="Cancel" />}
                                                    onClick={() => setShowDistributePanel(false)} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Text variant="small">No active queue item for this record.</Text>
                            )}

                            {params.add && (!current || showQueuePicker) && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid #eee", paddingTop: 8 }}>
                                    <Text variant="small">{current ? "Move to Queue" : "Add to Queue"}</Text>
                                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                        <Combobox
                                            size="small"
                                            placeholder="Search queues..."
                                            value={queueSearch}
                                            selectedOptions={selectedQueueId ? [selectedQueueId] : []}
                                            onChange={(e) => {
                                                setQueueSearch(e.target.value);
                                                setSelectedQueueId("");
                                            }}
                                            onOptionSelect={(_, data) => {
                                                setSelectedQueueId(data.optionValue ?? "");
                                                setQueueSearch(data.optionText ?? "");
                                            }}
                                            style={{ flex: 1, minWidth: 0 }}
                                            listbox={{ style: { minWidth: 400 } }}>
                                            {filteredQueues.map((queue) => (
                                                <Option key={queue.queueid} value={queue.queueid} text={queue.name}>
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        <span>{queue.name}</span>
                                                        <span style={{ fontSize: 11, color: "#666" }}>
                                                            {queue.numberofitems ?? 0} items · {queue.numberofmembers ?? 0} members
                                                        </span>
                                                    </div>
                                                </Option>
                                            ))}
                                        </Combobox>
                                        <Button
                                            size="small"
                                            appearance="primary"
                                            style={{ flexShrink: 0 }}
                                            disabled={busy || !selectedQueueId}
                                            icon={busy ? <Spinner size="tiny" /> : <Icon iconName="ChevronRightMed" />}
                                            onClick={handleAdd}>
                                            {current ? "Move" : "Add"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </PopoverSurface>
                    </Popover>
                </div>
            </IdPrefixProvider>
        </FluentProvider>
    );
}
