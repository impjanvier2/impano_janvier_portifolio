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

} from "lucide-react";


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


export default function AdminDashboard() {

  const navigate = useNavigate();


  const [adminEmail, setAdminEmail] = useState("");

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");


const [selectedImage, setSelectedImage] = useState(null);

const [imagePreview, setImagePreview] = useState("");

const [uploadingImage, setUploadingImage] = useState(false);


  const loadProjects = useCallback(async () => {

    setError("");


    const { data, error: queryError } = await supabase

      .from("projects")

      .select("*")

      .order("display_order", { ascending: true })

      .order("created_at", { ascending: false });


    if (queryError) {

      setError(queryError.message);

      return;

    }


    setProjects((data || []).map(normalizeProject));

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


        if (active) setAdminEmail(data.user.email || "Admin");


        await loadProjects();

      } catch (err) {

        if (active) {

          setError(err.message || "Ntibyashobotse gufungura Dashboard.");

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


  function openNewForm() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setImagePreview("");
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(project) {
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
    setImagePreview(project.image_url || "");
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function updateField(event) {

    const { name, value, type, checked } = event.target;


    setForm((current) => ({

      ...current,

      [name]: type === "checkbox" ? checked : value,

    }));

  }


  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Hitamo dosiye y'ifoto gusa.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ifoto igomba kuba itarengeje 5 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.title.trim()) {
      setError("Andika izina rya project.");
      return;
    }

    const order = Number(form.display_order);
    if (!Number.isInteger(order) || order < 0) {
      setError("Display order igomba kuba umubare utari munsi ya 0.");
      return;
    }

    const technologies = form.technologies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setSaving(true);
    setUploadingImage(Boolean(selectedImage));

    try {
      let imageUrl = form.image_url.trim() || null;

      if (selectedImage) {
        const safeFileName = selectedImage.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const filePath = `${Date.now()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio-projects")
          .upload(filePath, selectedImage, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedImage.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("portfolio-projects")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

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

      setNotice(
        editingId
          ? "Project yahinduwe neza."
          : "Project nshya yongeweho neza."
      );

      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setSelectedImage(null);
      setImagePreview("");

      await loadProjects();
    } catch (err) {
      setError(err.message || "Ntibyashobotse kubika project.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  async function togglePublished(project) {

    setError("");

    setNotice("");


    const { error: updateError } = await supabase

      .from("projects")

      .update({

        published: !project.published,

        updated_at: new Date().toISOString(),

      })

      .eq("id", project.id);


    if (updateError) {

      setError(updateError.message);

      return;

    }


    setNotice(

      project.published

        ? "Project yahishwe ku rubuga."

        : "Project yatangajwe ku rubuga."

    );


    await loadProjects();

  }


  async function deleteProject(project) {

    const confirmed = window.confirm(

      `Uremeza ko ushaka gusiba "${project.title}"? Iki gikorwa ntigisubizwa inyuma.`

    );


    if (!confirmed) return;


    setError("");

    setNotice("");


    const { error: deleteError } = await supabase

      .from("projects")

      .delete()

      .eq("id", project.id);


    if (deleteError) {

      setError(deleteError.message);

      return;

    }


    setNotice("Project yasibwe neza.");

    await loadProjects();

  }


  async function handleLogout() {

    const { error: logoutError } = await supabase.auth.signOut();


    if (logoutError) {

      setError(logoutError.message);

      return;

    }


    navigate("/admin/login", { replace: true });

  }


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">

        <LoaderCircle className="mr-3 animate-spin" />

        Turimo gufungura Dashboard...

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

          className="mt-6 flex w-full items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 text-slate-300 hover:bg-slate-800"

        >

          <LogOut size={18} />

          Sohoka

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

              Ongeramo, hindura, tangaza cyangwa uhagarike projects.

            </p>

          </div>


          <button

            onClick={openNewForm}

            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500"

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

            <strong>Ikosa:</strong> {error}

          </div>

        )}


        {notice && (

          <div className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/40 p-4 text-sm text-emerald-300">

            {notice}

          </div>

        )}


        <section className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <p className="text-sm text-slate-400">Projects zose</p>

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

                {editingId ? "Hindura Project" : "Ongeramo Project"}

              </h2>


              <button

                type="button"

                onClick={() => setFormOpen(false)}

                aria-label="Funga form"

                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"

              >

                <X size={20} />

              </button>

            </div>


            <form onSubmit={handleSave} className="mt-6 grid gap-5 md:grid-cols-2">

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

                  placeholder="Urugero: JandaWatch"

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"

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

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"

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

                  placeholder="Sobanura icyo project ikora..."

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"

                />

              </div>


              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  Upload project image (max 5 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Hitamo ifoto muri mudasobwa. JPG, PNG cyangwa WebP birakwiye.
                </p>

                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Project preview"
                      className="h-52 w-full rounded-xl border border-slate-700 object-cover"
                    />
                    {selectedImage && (
                      <p className="mt-2 text-xs text-emerald-300">
                        Ifoto nshya yatoranyijwe: {selectedImage.name}
                      </p>
                    )}
                  </div>
                )}
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
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Niba wohereje ifoto iri hejuru, URL yayo ni yo izakoreshwa.
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

                  placeholder="https://..."

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"

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

                  placeholder="https://github.com/..."

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"

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

                  placeholder="React, Supabase, Tailwind CSS"

                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"

                />

                <p className="mt-2 text-xs text-slate-500">

                  Tandukanya technologies ukoresheje koma.

                </p>

              </div>


              <label className="flex items-center gap-3 rounded-xl border border-slate-700 p-4 md:col-span-2">

                <input

                  name="published"

                  type="checkbox"

                  checked={form.published}

                  onChange={updateField}

                  className="h-4 w-4 accent-blue-500"

                />

                <span>

                  <span className="block font-medium">Publish project</span>

                  <span className="mt-1 block text-sm text-slate-400">

                    Project izemererwa kugaragara kuri portfolio.

                  </span>

                </span>

              </label>


              <div className="flex flex-wrap gap-3 md:col-span-2">

                <button

                  type="submit"

                  disabled={saving || uploadingImage}

                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-60"

                >

                  {saving ? (

                    <LoaderCircle size={18} className="animate-spin" />

                  ) : (

                    <Save size={18} />

                  )}

                  {saving

                    ? "Turimo kubika..."

                    : editingId

                      ? "Bika impinduka"

                      : "Ongeramo Project"}

                </button>


                <button

                  type="button"

                  onClick={() => setFormOpen(false)}

                  className="rounded-xl border border-slate-700 px-5 py-3 text-slate-300 hover:bg-slate-800"

                >

                  Cancel

                </button>

              </div>

            </form>

          </section>

        )}


        <section className="mt-8">

          <div className="mb-4 flex items-center justify-between gap-3">

            <h2 className="text-xl font-bold">Projects ziri muri database</h2>


            <button

              onClick={loadProjects}

              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"

            >

              <RefreshCw size={16} />

              Refresh

            </button>

          </div>


          {projects.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">

              <FolderKanban className="mx-auto text-slate-500" size={36} />

              <h3 className="mt-4 font-semibold">Nta projects zirimo</h3>

              <p className="mt-2 text-sm text-slate-400">

                Kanda New Project kugira ngo wongere project ya mbere.

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

                      className="h-48 w-full object-cover"

                      onError={(event) => {

                        event.currentTarget.style.display = "none";

                      }}

                    />

                  ) : (

                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-blue-500/10 to-violet-500/10">

                      <FolderKanban size={38} className="text-blue-400" />

                    </div>

                  )}


                  <div className="p-5">

                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div>

                        <h3 className="text-lg font-bold">{project.title}</h3>

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

                      {project.description || "Nta bisobanuro birashyirwaho."}

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

                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-blue-500"

                      >

                        <Pencil size={15} />

                        Hindura

                      </button>


                      <button

                        onClick={() => togglePublished(project)}

                        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:border-emerald-500"

                      >

                        {project.published ? (

                          <EyeOff size={15} />

                        ) : (

                          <Eye size={15} />

                        )}

                        {project.published ? "Hisha" : "Publish"}

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

                        className="inline-flex items-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm text-red-300 hover:bg-red-950/50"

                      >

                        <Trash2 size={15} />

                        Siba

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
