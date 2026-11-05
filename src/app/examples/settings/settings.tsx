"use client";

import { BellIcon, CableIcon, ScaleIcon, ShieldAlertIcon, SlidersHorizontalIcon, UsersIcon } from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/lark/cards";
import { DateCell, RecordCell } from "@/components/lark/cells";
import { type ColumnDef, DataGrid } from "@/components/lark/data-grid";
import { DirtyMark, UnsavedChangesBar, useDirtyState, useLeaveGuard } from "@/components/lark/feedback";
import { Figure, FigureStrip } from "@/components/lark/figure";
import { PersonAvatar } from "@/components/lark/identity";
import { SettingsLayout } from "@/components/lark/layouts";
import { ActionMenu, VerticalNav } from "@/components/lark/menus";
import { PageHeader } from "@/components/lark/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const POLICIES = {
  discount: { on: true, limit: "20" },
  term: { on: true, limit: "36" },
  payment: { on: false, limit: "45" },
  ace: { on: true, limit: "" },
};
type PolicyKey = keyof typeof POLICIES;
const POLICY_TEXT: Record<PolicyKey, { title: string; description: string; unit?: string }> = {
  discount: { title: "Discount limit", description: "Above this platform discount, VP Finance must approve.", unit: "%" },
  term: { title: "Longest standard term", description: "Longer terms go to Legal.", unit: "months" },
  payment: { title: "Payment terms limit", description: "Terms beyond this need Finance.", unit: "days" },
  ace: { title: "ACE may draft approval notes", description: "ACE prepares the note; a person always sends it." },
};

type User = { id: string; name: string; email: string; role: string; last: string; lastLabel: string; status: "Active" | "Invited" | "Deactivated" };
const USERS: User[] = [
  { id: "u1", name: "Avery Chen", email: "avery.chen@example.com", role: "Deal desk", last: "2026-11-05", lastLabel: "Today", status: "Active" },
  { id: "u2", name: "Priya Raman", email: "priya.raman@example.com", role: "Seller", last: "2026-11-04", lastLabel: "Yesterday", status: "Active" },
  { id: "u3", name: "Rui Tanaka", email: "rui.tanaka@example.com", role: "Approver · Finance", last: "2026-11-01", lastLabel: "Nov 1", status: "Active" },
  { id: "u4", name: "Sam Whitfield", email: "sam.whitfield@example.com", role: "Approver · Legal", last: "", lastLabel: "Never", status: "Invited" },
  { id: "u5", name: "Dana Okafor", email: "dana.okafor@example.com", role: "Seller", last: "2026-09-12", lastLabel: "Sep 12", status: "Deactivated" },
];

const userCols: ColumnDef<User, unknown>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    meta: { width: 280, sticky: true },
    cell: ({ row }) => <RecordCell leading={<PersonAvatar name={row.original.name} size="sm" />} meta={row.original.email} name={row.original.name} onOpen={() => {}} />,
  },
  { id: "role", accessorKey: "role", header: "Role", meta: { width: 200 }, cell: ({ row }) => row.original.role },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    meta: { width: 140 },
    cell: ({ row }) => <Badge variant={row.original.status === "Active" ? "success" : row.original.status === "Invited" ? "info" : "default"}>{row.original.status}</Badge>,
  },
  { id: "last", accessorKey: "last", header: "Last active", meta: { width: 140 }, cell: ({ row }) => <DateCell iso={row.original.last || "never"} label={row.original.lastLabel} /> },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    meta: { width: 64, align: "right", label: "Actions" },
    cell: ({ row }) => (
      <ActionMenu
        label={`Actions for ${row.original.name}`}
        sections={[
          { items: [{ label: "Change role" }, { label: row.original.status === "Invited" ? "Resend invite" : "Reset password" }] },
          { items: [{ label: "Deactivate", destructive: true, disabledReason: row.original.name === "Avery Chen" ? "You can't deactivate yourself." : undefined }] },
        ]}
      />
    ),
  },
];

export function Settings() {
  const [section, setSection] = useState("policies");
  const form = useDirtyState(POLICIES);
  useLeaveGuard(form.dirty);
  const [saving, setSaving] = useState(false);
  const isDirty = (k: PolicyKey) => JSON.stringify(form.value[k]) !== JSON.stringify(POLICIES[k]);
  const dirtyCount = (Object.keys(POLICIES) as PolicyKey[]).filter(isDirty).length;
  const set = (k: PolicyKey, patch: Partial<(typeof POLICIES)[PolicyKey]>) => form.setValue({ ...form.value, [k]: { ...form.value[k], ...patch } });

  return (
    <>
      <SettingsLayout
        header={
          <PageHeader
            className="pb-4"
            description="Deepgrids sets standard policies by default. Changes apply to new requests; open requests keep the rules they started with."
            title="Approval policies"
          />
        }
        nav={
          <VerticalNav
            items={[
              { value: "general", label: "General", icon: <SlidersHorizontalIcon /> },
              { value: "users", label: "Users", icon: <UsersIcon />, count: USERS.length },
              { value: "policies", label: "Approval policies", icon: <ScaleIcon /> },
              { value: "integrations", label: "Integrations", icon: <CableIcon /> },
              { value: "notifications", label: "Notifications", icon: <BellIcon /> },
              { value: "danger", label: "Danger zone", icon: <ShieldAlertIcon /> },
            ]}
            label="Settings"
            onChange={setSection}
            value={section}
          />
        }
      >
        <SectionCard description="How often each policy fired in the last 30 days." title="Policy activity">
          <FigureStrip className="-mx-4 -mb-4 rounded-none border-x-0 border-b-0" columns={3}>
            <Figure caption="From Oct 6" label="Requests checked" value="214" />
            <Figure caption="Sent to an approver" delta={{ value: "+4", direction: "up", good: false, context: "vs prior 30 days" }} label="Exceptions" value="31" />
            <Figure caption="Median" label="Time to decision" unit="days" value="1.6" />
          </FigureStrip>
        </SectionCard>

        <div className="flex flex-col gap-1">
          <h2 className="text-label-lg font-semibold">Rules</h2>
          <p className="text-body-sm font-medium text-on-surface-tertiary">Each rule sends a request to the named approver when it applies.</p>
        </div>
        <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant bg-card">
          {(Object.keys(POLICIES) as PolicyKey[]).map((k) => {
            const p = form.value[k];
            const t = POLICY_TEXT[k];
            return (
              <CollapsiblePrimitive.Root key={k}>
                <div className="flex min-h-14 items-center gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="flex flex-wrap items-center gap-2 text-title-sm">
                      {t.title}
                      <Badge variant={p.on ? "success" : "default"}>{p.on ? "On" : "Off"}</Badge>
                      {isDirty(k) && <DirtyMark />}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">{t.description}</span>
                  </div>
                  <Switch aria-label={`${t.title} ${p.on ? "on" : "off"}`} checked={p.on} onCheckedChange={(v) => set(k, { on: v })} />
                  {t.unit ? (
                    <CollapsiblePrimitive.Trigger asChild>
                      <Button aria-label={`Edit ${t.title.toLowerCase()}`} size="sm" variant="ghost">
                        Edit
                      </Button>
                    </CollapsiblePrimitive.Trigger>
                  ) : (
                    // Keeps every switch in the same column whether or not the rule has a limit to edit.
                    <span aria-hidden="true" className="invisible">
                      <Button size="sm" tabIndex={-1} variant="ghost">
                        Edit
                      </Button>
                    </span>
                  )}
                </div>
                {t.unit && (
                  <CollapsiblePrimitive.Content className="border-t border-outline-variant bg-surface-container-low px-4 py-3">
                    <label className="flex flex-wrap items-center gap-2 text-sm">
                      Limit
                      <Input className="w-24" inputMode="numeric" onChange={(e) => set(k, { limit: e.target.value.replace(/\D/g, "") })} size="sm" value={p.limit} />
                      <span className="text-on-surface-variant">{t.unit}</span>
                    </label>
                  </CollapsiblePrimitive.Content>
                )}
              </CollapsiblePrimitive.Root>
            );
          })}
        </div>

        <SectionCard
          action={
            <Button size="sm" variant="secondary">
              Invite people
            </Button>
          }
          flush
          title="Approvers and users"
        >
          <DataGrid caption="Users" columns={userCols} data={USERS} density="compact" getRowId={(u) => u.id} selectable />
        </SectionCard>

        <SectionCard description="These actions can't be undone." title="Danger zone">
          <div className="flex flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1 text-sm">Reset every policy to Deepgrids&apos; defaults. Open requests keep their current rules.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset policies</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all approval policies?</AlertDialogTitle>
                  <AlertDialogDescription>Your four custom rules will be replaced with the defaults. This can&apos;t be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my rules</AlertDialogCancel>
                  <AlertDialogAction className="bg-error text-on-error" onClick={() => toast("Policies reset to defaults")}>
                    Reset policies
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SectionCard>
      </SettingsLayout>
      <UnsavedChangesBar
        count={dirtyCount}
        onDiscard={form.reset}
        onSave={() => {
          setSaving(true);
          window.setTimeout(() => {
            form.commit();
            setSaving(false);
            toast("Policies saved", { description: "New requests use the updated rules." });
          }, 900);
        }}
        open={form.dirty}
        saving={saving}
      />
    </>
  );
}
