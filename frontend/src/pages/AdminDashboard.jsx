import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  X,
  Save,
  LoaderCircle,
  RefreshCw,
  Code2,
  ImagePlus,
} from "lucide-react";

const BUCKET = "portfolio-projects";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const emptyForm = {
  title: "",
  description: "",
  image_url: "",
  project_url: "",
  github_url: "",
  technologies: "",
  published: false,
  display_order: "0",
};

function normalizeProject(project) {
  return {
    ...project,
    technologies: Array.isArray(project.technologies)
      ? project.technologies
      : [],
  };
}

function getStoragePath(imageUrl) {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    const encodedPath = url.pathname.slice(
      index + marker.length
    );

    if (!encodedPath) return null;

    const path = decodeURIComponent(encodedPath);

    // Reject paths that could escape the bucket
    if (
      path.startsWith("/") ||
      path.split("/").some(
        (segment) => segment === "." || segment === ".."
      )
    ) {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "An unknown error occurred.";
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [imageWarning, setImageWarning] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Preview is generated from the selected image.
  // The blob URL is revoked when the image changes or the component unmounts.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(form.image_url.trim());
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage, form.image_url]);

  const loadProjects = useCallback(async () => {
    setError("");

    const { data, error: queryError } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(`Failed to load projects: ${queryError.message}`);
      return false;
    }

    setProjects((data || []).map(normalizeProject));
    return true;
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (authError || !data.user) {
          navigate("/admin/login", { replace: true });
          return;
        }

        const { data: admin, error: adminError } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminError) throw adminError;

        if (!admin) {
          await supabase.auth.signOut();
          navigate("/admin/login", { replace: true });
          return;
        }

        if (!active) return;

        setAdminEmail(data.user.email || "Admin");
        await loadProjects();
      } catch (err) {
        if (active) {
          setError(
            `Failed to open Dashboard: ${getErrorMessage(err)}`
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [navigate, loadProjects]);

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setSelectedImage(null);
    setImagePreview("");
    setImageWarning("");
  }

  function openNewForm() {
    setError("");
    setNotice("");
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(project) {
    setError("");
    setNotice("");
    setImageWarning("");
    setEditingId(project.id);

    setForm({
      title: project.title || "",
      description: project.description || "",
      image_url: project.image_url || "",
      project_url: project.project_url || "",
      github_url: project.github_url || "",
      technologies: project.technologies.join(", "),
      published: Boolean(project.published),
      display_order: String(project.display_order ?? 0),
    });

    setSelectedImage(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    resetForm();
    setError("");
    setImageWarning("");
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(event) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;

    setError("");
    setNotice("");
    setImageWarning("");

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Please choose a JPG, PNG or WebP image only.");
      input.value = "";
      return;
    }

    if (file.size === 0) {
      setError("This file is empty. Please choose another image.");
      input.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("The image must be no larger than 5 MB.");
      input.value = "";
      return;
    }

    setSelectedImage(file);
    input.value = "";
  }

  function clearSelectedImage() {
    if (saving) return;

    setSelectedImage(null);
    setError("");
    setImageWarning("");
  }

  async function removeStorageImage(imageUrl) {
    const path = getStoragePath(imageUrl);

    // Never attempt to delete external URLs or images from other buckets.
    if (!path) {
      return {
        removed: false,
        reason: "The URL does not belong to our bucket.",
      };
    }

    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([path]);

    if (removeError) {
      return {
        removed: false,
        reason: removeError.message,
      };
    }

    return { removed: true };
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setNotice("");
    setImageWarning("");

    if (!form.title.trim()) {
      setError("Please enter a project title.");
      return;
    }

    if (selectedImage) {
      if (!ALLOWED_IMAGE_TYPES.has(selectedImage.type)) {
        setError("Please choose a JPG, PNG or WebP image only.");
        return;
      }

      if (
        selectedImage.size === 0 ||
        selectedImage.size > MAX_IMAGE_SIZE
      ) {
        setError("The image must be between 1 byte and 5 MB.");
        return;
      }
    }

    const order = Number(form.display_order);

    if (!Number.isSafeInteger(order) || order < 0) {
      setError("Display order must be a whole number that is not less than 0.");
      return;
    }

    const technologies = [
      ...new Set(
        form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];

    setSaving(true);

    let uploadedPath = null;
    let uploadedUrl = null;

    try {
      const oldImageUrl = form.image_url.trim() || null;
      let imageUrl = oldImageUrl;

      // 1. Upload the new image first.
      if (selectedImage) {
        const extensionByType = {
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/webp": "webp",
        };

        const extension = extensionByType[selectedImage.type];

        // A unique name reduces the chance of collisions.
        const randomId = crypto.randomUUID();
        uploadedPath = `${randomId}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedPath, selectedImage, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedImage.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(uploadedPath);

        uploadedUrl = publicUrlData.publicUrl;
        imageUrl = uploadedUrl;
      }

      // 2. Save the project to the database.
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        image_url: imageUrl,
        project_url: form.project_url.trim() || null,
        github_url: form.github_url.trim() || null,
        technologies,
        published: form.published,
        display_order: order,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("projects")
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // 3. The database confirmed the project was saved.
      // Only now do we delete the old image.
      if (
        selectedImage &&
        oldImageUrl &&
        oldImageUrl !== uploadedUrl
      ) {
        const oldPath = getStoragePath(oldImageUrl);

        if (oldPath && oldPath !== uploadedPath) {
          const removal = await removeStorageImage(oldImageUrl);

          if (!removal.removed) {
            setImageWarning(
              `Project saved successfully, but the old image was not deleted: ${removal.reason}`
            );
          }
        }
      }

      setNotice(
        editingId
          ? "Project updated successfully."
          : "New project added successfully."
      );

      setFormOpen(false);
      resetForm();

      // Even if the refresh fails, the project is already saved.
      await loadProjects();
    } catch (err) {
      setError(`Failed to save project: ${getErrorMessage(err)}`);

      // Did the database insert fail? Try to delete the new upload
      // so it does not remain orphaned in storage.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          setImageWarning(
            `Project was not saved, and cleanup of the new image also failed: ${cleanupError.message}. Check Storage.`
          );
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(project) {
    if (publishingId || saving || deletingId) return;

    setError("");
    setNotice("");

    setPublishingId(project.id);

    try {
      const newPublishedStatus = !project.published;

      const { data, error: updateError } = await supabase
        .from("projects")
        .update({
          published: newPublishedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)
        .select("id, title, published")
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error("No project was updated.");

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? { ...item, published: data.published }
            : item
        )
      );

      setNotice(
        newPublishedStatus
          ? "Project published on the site."
          : "Project hidden from the site."
      );
    } catch (err) {
      setError(`Failed to change status: ${getErrorMessage(err)}`);
    } finally {
      setPublishingId(null);
    }
  }

  async function deleteProject(project) {
    if (deletingId || saving || publishingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setDeletingId(project.id);

    try {
      // 1. Delete the row from the database first.
      const { data, error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)
        .select("id");

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error(
          "Project was not deleted. Check the admin permissions in RLS."
        );
      }

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );

      setNotice("Project deleted from the database.");

      // 2. Only after that do we delete its image, if it belongs to us.
      if (project.image_url) {
        const removal = await removeStorageImage(project.image_url);

        if (!removal.removed && getStoragePath(project.image_url)) {
          setImageWarning(
            `Project deleted, but the image in Storage remains: ${removal.reason}`
          );
        }
      }
    } catch (err) {
      setError(`Failed to delete project: ${getErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    navigate("/admin/login", { replace: true });
  }

  async function handleRefresh() {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await loadProjects();
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <LoaderCircle className="mr-3 animate-spin" />
        Opening Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <aside className="border-b border-slate-800 bg-slate-900 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
        <a href="/" className="text-lg font-bold">
          Impano <span className="text-blue-400">Admin</span>
        </a>

        <p className="mt-2 break-all text-xs text-slate-400">
          {adminEmail}
        </p>

        <nav className="mt-8 space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-blue-600/15 px-4 py-3 text-blue-300">
            <LayoutDashboard size={19} />
            Dashboard
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-slate-200">
            <FolderKanban size={19} />
            Projects
          </div>
        </nav>

        <button
          onClick={handleLogout}
          disabled={saving}
          className="mt-6 flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-blue-400">
              PORTFOLIO MANAGEMENT
            </p>
            <h1 className="mt-2 text-3xl font-bold">Projects</h1>
            <p className="mt-2 text-sm text-slate-400">
              Add, edit, publish or unpublish projects.
            </p>
          </div>

          <button
            onClick={openNewForm}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            <Plus size={19} />
            New Project
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 break-words rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/40 p-4 text-sm text-emerald-300"
          >
            {notice}
          </div>
        )}

        {imageWarning && (
          <div
            role="status"
            className="mt-4 break-words rounded-xl border border-amber-900 bg-amber-950/40 p-4 text-sm text-amber-300"
          >
            {imageWarning}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">All projects</p>
            <p className="mt-2 text-3xl font-bold">{projects.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Published</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {projects.filter((project) => project.published).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Drafts</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">
              {projects.filter((project) => !project.published).length}
            </p>
          </div>
        </section>

        {formOpen && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Project" : "Add Project"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Project title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  required
                  maxLength={150}
                  placeholder="e.g. JandaWatch"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Display order
                </label>
                <input
                  name="display_order"
                  type="number"
                  min="0"
                  step="1"
                  value={form.display_order}
                  onChange={updateField}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={updateField}
                  disabled={saving}
                  placeholder="Describe what the project does..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="project-image"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Upload project image
                </label>

                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-5">
                  <div className="flex flex-col items-center gap-3 py-3 text-center">
                    <ImagePlus size={34} className="text-blue-400" />
                    <p className="font-medium">
                      Choose a project image
                    </p>
                    <p className="text-xs text-slate-400">
                      JPG, PNG or WebP · No more than 5 MB
                    </p>

                    <input
                      id="project-image"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={saving}
                      className="w-full max-w-md text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500 disabled:opacity-50"
                    />
                  </div>

                  {imagePreview ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-700">
                      <img
                        src={imagePreview}
                        alt={`Preview of ${form.title || "project"}`}
                        className="max-h-80 w-full bg-slate-900 object-contain"
                        onError={() =>
                          setError(
                            "The image could not be displayed. Choose another image or check the URL."
                          )
                        }
                      />

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 p-3">
                        <div className="min-w-0">
                          <p className="break-all text-sm font-medium text-slate-200">
                            {selectedImage
                              ? selectedImage.name
                              : "Current image"}
                          </p>

                          {selectedImage && (
                            <p className="mt-1 text-xs text-slate-400">
                              {(
                                selectedImage.size /
                                (1024 * 1024)
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          )}
                        </div>

                        {selectedImage && (
                          <button
                            type="button"
                            onClick={clearSelectedImage}
                            disabled={saving}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40 disabled:opacity-50"
                          >
                            Remove new image
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-center text-sm text-slate-500">
                      No image selected.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  Image URL (optional)
                </label>
                <input
                  name="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={updateField}
                  disabled={saving || Boolean(selectedImage)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
                <p className="mt-2 text-xs text-slate-500">
                  If you select a new image, it will be used instead.
                  To use a URL, first remove the new image you selected.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Live project URL
                </label>
                <input
                  name="project_url"
                  type="url"
                  value={form.project_url}
                  onChange={updateField}
                  disabled={saving}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  GitHub URL
                </label>
                <input
                  name="github_url"
                  type="url"
                  value={form.github_url}
                  onChange={updateField}
                  disabled={saving}
                  placeholder="https://github.com/..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Technologies
                </label>
                <input
                  name="technologies"
                  value={form.technologies}
                  onChange={updateField}
                  disabled={saving}
                  placeholder="React, Supabase, Tailwind CSS"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-60"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Separate technologies with commas.
                </p>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-700 p-4 md:col-span-2">
                <input
                  name="published"
                  type="checkbox"
                  checked={form.published}
                  onChange={updateField}
                  disabled={saving}
                  className="h-4 w-4 accent-blue-500"
                />
                <span>
                  <span className="block font-medium">
                    Publish project
                  </span>
                  <span className="mt-1 block text-sm text-slate-400">
                    The project will appear on the portfolio.
                  </span>
                </span>
              </label>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Add Project"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">
              Projects in the database
            </h2>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
              <FolderKanban
                className="mx-auto text-slate-500"
                size={36}
              />
              <h3 className="mt-4 font-semibold">
                No projects yet
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Click New Project to add your first project.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
                >
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-48 w-full bg-slate-950 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-500/10 to-violet-500/10">
                      <FolderKanban
                        size={38}
                        className="text-blue-400"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">
                          {project.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Order: {project.display_order ?? 0}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${
                          project.published
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                      {project.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-blue-300"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                      <button
                        onClick={() => openEditForm(project)}
                        disabled={saving || Boolean(deletingId)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-blue-500 disabled:opacity-50"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        onClick={() => togglePublished(project)}
                        disabled={
                          Boolean(publishingId) ||
                          Boolean(deletingId) ||
                          saving
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-emerald-500 disabled:opacity-50"
                      >
                        {publishingId === project.id ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : project.published ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                        {project.published ? "Hide" : "Publish"}
                      </button>

                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-blue-500"
                        >
                          <ExternalLink size={15} />
                          Live
                        </a>
                      )}

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-blue-500"
                        >
                          <Code2 size={15} />
                          GitHub
                        </a>
                      )}

                      <button
                        onClick={() => deleteProject(project)}
                        disabled={
                          Boolean(deletingId) ||
                          Boolean(publishingId) ||
                          saving
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm text-red-300 hover:bg-red-950/50 disabled:opacity-50"
                      >
                        {deletingId === project.id ? (
                          <LoaderCircle
                            size={15}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}