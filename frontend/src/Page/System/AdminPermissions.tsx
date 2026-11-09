import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCheck, Save, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { permissionService } from "@/services/permissionService";
import type {
  AdminAccount,
  PermissionGroup,
} from "@/services/permissionService";
import { togglePermission } from "@/utils/roles";

const labels: Record<string, string> = {
  read: "Xem",
  create: "Tạo",
  update: "Sửa",
  delete: "Xóa",
  lock: "Khóa",
  restore: "Khôi phục",
};
const equal = (a: string[], b: string[]) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

export default function AdminPermissions() {
  const [params, setParams] = useSearchParams();
  const requestedId = useRef(params.get("admin"));
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [catalog, setCatalog] = useState<PermissionGroup[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const selected = admins.find((admin) => admin.id === selectedId);
  const all = useMemo(
    () =>
      catalog.flatMap((group) =>
        group.actions.map((action) => `${group.key}:${action}`)
      ),
    [catalog]
  );
  const dirty = !equal(permissions, saved);
  const filtered = admins.filter((admin) =>
    `${admin.name} ${admin.email}`.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([permissionService.catalog(), permissionService.admins()])
      .then(([groups, accounts]) => {
        if (!active) return;
        setCatalog(groups.data);
        setAdmins(accounts.data.items);
        const first =
          accounts.data.items.find(
            (admin) => String(admin.id) === requestedId.current
          ) ?? accounts.data.items[0];
        setSelectedId(first?.id ?? null);
        setPermissions(first?.permissions ?? []);
        setSaved(first?.permissions ?? []);
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.data?.message || "Không tải được danh sách admin."
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const choose = (admin: AdminAccount) => {
    if (saving || selectedId === admin.id) return;
    if (
      dirty &&
      !window.confirm("Bỏ các thay đổi chưa lưu để chuyển tài khoản?")
    )
      return;
    setSelectedId(admin.id);
    setPermissions(admin.permissions ?? []);
    setSaved(admin.permissions ?? []);
    setParams({ admin: String(admin.id) }, { replace: true });
  };

  const save = async () => {
    if (!selected || saving || !dirty) return;
    setSaving(true);
    try {
      const { data } = await permissionService.save(selected.id, permissions);
      setPermissions(data.permissions);
      setSaved(data.permissions);
      setAdmins((previous) =>
        previous.map((admin) =>
          admin.id === selected.id
            ? { ...admin, permissions: data.permissions }
            : admin
        )
      );
      toast.success("Đã lưu quyền. Admin cần đăng nhập lại để tiếp tục.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Không lưu được quyền. Vui lòng thử lại."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 p-2 md:p-4">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-green-100 p-3 text-green-700">
          <ShieldCheck size={26} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Phân quyền admin</h1>
          <p className="text-muted-foreground mt-1">
            Chọn tài khoản và những thao tác admin được phép thực hiện.
          </p>
        </div>
      </header>
      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Super admin luôn có toàn quyền. Màn này chỉ phân quyền cho admin thường.
        Khi lưu, admin sẽ cần đăng nhập lại.
      </div>
      {loading ? (
        <div
          role="status"
          className="rounded-xl border p-10 text-center text-muted-foreground"
        >
          Đang tải danh sách quyền…
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 p-8 space-y-4"
        >
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            onClick={() => setReload((value) => value + 1)}
          >
            Thử lại
          </Button>
        </div>
      ) : !admins.length ? (
        <div className="rounded-xl border border-dashed p-10 text-center space-y-3">
          <h2 className="font-semibold">Chưa có admin thường</h2>
          <p className="text-muted-foreground">
            Vào danh sách người dùng, đổi vai trò của tài khoản thành Admin rồi
            quay lại đây để chọn quyền.
          </p>
          <Button asChild>
            <Link to="/admin/user">Quản lý người dùng</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-xl border overflow-hidden self-start">
            <div className="border-b p-4 space-y-3">
              <h2 className="font-semibold">
                Admin thường{" "}
                <span className="text-muted-foreground">({admins.length})</span>
              </h2>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-muted-foreground"
                />
                <Input
                  className="pl-9"
                  aria-label="Tìm admin"
                  placeholder="Tìm tên hoặc email"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[540px] overflow-y-auto p-2 space-y-1">
              {filtered.map((admin) => (
                <button
                  key={admin.id}
                  disabled={saving}
                  onClick={() => choose(admin)}
                  aria-pressed={admin.id === selectedId}
                  className={`w-full rounded-lg p-3 text-left transition disabled:opacity-50 ${admin.id === selectedId ? "bg-green-50 ring-1 ring-inset ring-green-400" : "hover:bg-muted"}`}
                >
                  <span className="block font-medium truncate">
                    {admin.name}
                  </span>
                  <span className="block text-xs text-muted-foreground break-all mt-1">
                    {admin.email}
                  </span>
                  <span className="block text-xs mt-2 text-muted-foreground">
                    {admin.permissions?.length ?? 0} quyền
                    {admin.deletedAt ? " · Đã khóa" : ""}
                  </span>
                </button>
              ))}
              {!filtered.length && (
                <p className="p-4 text-sm text-muted-foreground">
                  Không tìm thấy admin phù hợp.
                </p>
              )}
            </div>
          </aside>
          {selected && (
            <div className="rounded-xl border overflow-hidden">
              <div className="border-b p-5 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground break-all">
                    {selected.email}
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    Đã chọn {permissions.length}/{all.length} quyền
                    {dirty ? " · Có thay đổi chưa lưu" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() => setPermissions(all)}
                  >
                    <CheckCheck size={16} />
                    Chọn tất cả
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() => setPermissions([])}
                  >
                    Bỏ tất cả
                  </Button>
                </div>
              </div>
              <div className="divide-y">
                {catalog.map((group) => {
                  const groupPermissions = group.actions.map(
                    (action) => `${group.key}:${action}`
                  );
                  const checked = groupPermissions.every((permission) =>
                    permissions.includes(permission)
                  );
                  return (
                    <fieldset
                      key={group.key}
                      disabled={saving}
                      className="p-5 space-y-4"
                    >
                      <legend className="sr-only">{group.label}</legend>
                      <label className="flex items-center gap-3 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          className="size-4 accent-green-600"
                          checked={checked}
                          onChange={(event) =>
                            setPermissions((previous) =>
                              event.target.checked
                                ? [
                                    ...new Set([
                                      ...previous,
                                      ...groupPermissions,
                                    ]),
                                  ]
                                : previous.filter(
                                    (permission) =>
                                      !permission.startsWith(group.key + ":")
                                  )
                            )
                          }
                        />
                        {group.label}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 pl-7">
                        {group.actions.map((action) => {
                          const permission = `${group.key}:${action}`;
                          return (
                            <label
                              key={permission}
                              className={`flex items-center gap-2 rounded-lg border px-3 py-3 text-sm cursor-pointer ${permissions.includes(permission) ? "border-green-300 bg-green-50 text-green-900" : "text-muted-foreground"}`}
                            >
                              <input
                                type="checkbox"
                                className="size-4 accent-green-600"
                                checked={permissions.includes(permission)}
                                onChange={(event) =>
                                  setPermissions((previous) =>
                                    togglePermission(
                                      previous,
                                      permission,
                                      event.target.checked
                                    )
                                  )
                                }
                              />
                              {labels[action] || action}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
              <footer className="border-t bg-muted/20 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Quyền thao tác luôn đi kèm quyền xem cùng chức năng.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={saving || !dirty}
                    onClick={() => setPermissions(saved)}
                  >
                    Hoàn tác
                  </Button>
                  <Button
                    disabled={saving || !dirty}
                    onClick={save}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Save size={16} />
                    {saving ? "Đang lưu…" : "Lưu quyền"}
                  </Button>
                </div>
              </footer>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
