import { Can } from "@/components/Can";
import PaginationControls from "@/components/PaginationControls";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryService } from "@/services/categoryService";
import { mediaUrl } from "@/utils/media";
import { uploadErrorMessage } from "@/utils/upload";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  hexHexadecimal?: string | null;
  tracks?: unknown[];
};

export default function AddCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<any>();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#1db954");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await categoryService.getAll({ page, limit: 20 });
      setCategories(data.items ?? []);
      setMeta(data.meta);
    } catch (error) {
      toast.error(
        uploadErrorMessage(error, "Không tải được danh sách thể loại."),
      );
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setColor("#1db954");
    setImage(null);
    setPreview("");
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setColor(category.hexHexadecimal ?? "#1db954");
    setImage(null);
    setPreview(mediaUrl(category.image_url));
    setOpen(true);
  };

  const submit = async () => {
    if (!name.trim() || saving) return;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("hexHexadecimal", color);
    if (image) formData.append("image", image);

    setSaving(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, formData);
        toast.success("Cập nhật thể loại thành công!");
      } else {
        await categoryService.create(formData);
        toast.success("Tạo thể loại thành công!");
      }
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(uploadErrorMessage(error, "Không thể lưu thể loại."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Xóa thể loại “${category.name}”?`)) return;
    try {
      await categoryService.remove(category.id);
      toast.success("Đã xóa thể loại.");
      await load();
    } catch (error) {
      toast.error(uploadErrorMessage(error, "Không thể xóa thể loại."));
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Danh sách thể loại</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý thể loại dùng để phân loại bài hát.
          </p>
        </div>
        <Can permission="categories:create">
          <Button onClick={openCreate}>+ Thêm thể loại</Button>
        </Can>
      </div>

      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Màu</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số bài hát</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length ? (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Avatar className="h-12 w-12 rounded-md">
                      <AvatarImage src={mediaUrl(category.image_url)} />
                      <AvatarFallback>
                        {category.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-5 rounded-full border"
                        style={{
                          backgroundColor: category.hexHexadecimal ?? "#cccccc",
                        }}
                      />
                      {category.hexHexadecimal ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description || "—"}
                  </TableCell>
                  <TableCell>{category.tracks?.length ?? 0}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Can permission="categories:update">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(category)}
                        >
                          Update
                        </Button>
                      </Can>
                      <Can permission="categories:delete">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => remove(category)}
                        >
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Chưa có thể loại nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationControls meta={meta} onPageChange={setPage} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Cập nhật thể loại" : "Thêm thể loại"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Input
              placeholder="Tên thể loại"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <textarea
              className="min-h-24 rounded-md border bg-transparent p-3 text-sm"
              placeholder="Mô tả"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <label className="space-y-1 text-sm font-medium">
              Màu đại diện
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                />
                <Input
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                />
              </div>
            </label>
            <label className="space-y-1 text-sm font-medium">
              Ảnh thể loại
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImage(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
            {preview && (
              <img
                src={preview}
                alt="Xem trước"
                className="h-32 w-32 rounded-md object-cover"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button disabled={saving || !name.trim()} onClick={submit}>
              {saving ? "Đang lưu…" : editingId ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
