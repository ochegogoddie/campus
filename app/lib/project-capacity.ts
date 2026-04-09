export type ProjectCapacityStatus = "open" | "almost-full" | "full";

export interface ProjectCapacitySummary {
  members: number;
  maxMembers: number;
  remainingSlots: number;
  progress: number;
  label: string;
  detail: string;
  status: ProjectCapacityStatus;
}

export function getProjectCapacitySummary(
  memberCount: number,
  maxMembers: number
): ProjectCapacitySummary {
  const safeMaxMembers = Math.max(maxMembers, 1);
  const members = Math.max(0, Math.min(memberCount, safeMaxMembers));
  const remainingSlots = Math.max(safeMaxMembers - members, 0);
  const progress = Math.min(100, Math.round((members / safeMaxMembers) * 100));

  if (remainingSlots === 0) {
    return {
      members,
      maxMembers: safeMaxMembers,
      remainingSlots,
      progress,
      label: "Full team",
      detail: "All member slots are filled.",
      status: "full",
    };
  }

  if (remainingSlots === 1) {
    return {
      members,
      maxMembers: safeMaxMembers,
      remainingSlots,
      progress,
      label: "1 member missing",
      detail: "Only one more member can still join.",
      status: "almost-full",
    };
  }

  return {
    members,
    maxMembers: safeMaxMembers,
    remainingSlots,
    progress,
    label: `${remainingSlots} spots open`,
    detail: "This project still has room for more members.",
    status: "open",
  };
}
