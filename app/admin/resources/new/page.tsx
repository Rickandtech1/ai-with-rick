import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewResourcePage() {
  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-h1">New resource</h1>
      </div>
      <div className="admin-panel">
        <ResourceForm />
      </div>
    </>
  );
}
