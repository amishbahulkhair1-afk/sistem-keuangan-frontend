import React, { useState } from "react";
import { createPortal } from "react-dom";
import { IconPlusCircle, IconCheckCircle, IconBriefcase, IconEdit, IconTrash, IconShield } from "../../Icons";
import CustomDropdown from "../common/CustomDropdown";
import TableActionMenu from "../common/TableActionMenu";

const ACCESS_LEVELS = [
  { value: "full", label: "Hak Akses Penuh (Full Control)", desc: "Dapat melihat, menambah, mengedit, dan menghapus seluruh data pada pos yang ditugaskan." },
  { value: "view_edit", label: "Lihat & Edit (Tanpa Hapus)", desc: "Dapat melihat, menambah, dan mengedit data, namun tidak dapat menghapus transaksi." },
  { value: "add_only", label: "Hanya Tambah Transaksi", desc: "Dapat menginput transaksi/donasi baru tanpa akses mengubah data lama." },
  { value: "read_only", label: "Hanya Lihat (Read Only / Monitor)", desc: "Hanya dapat memantau dan melihat laporan/jurnal transaksi tanpa izin edit/tambah." }
];

export default function MasterUsers({
  isReadOnly,
  masterMsg,
  handleTambahUser,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserRole,
  setNewUserRole,
  newUserCatIds = [],
  setNewUserCatIds,
  newUserAccessLevel = "full",
  setNewUserAccessLevel,
  categories = [],
  usersList = [],
  setEditUserItem,
  handleDeleteUser,
  editUserItem,
  handleUpdateUser
}) {
  const [tableFontSize, setTableFontSize] = useState("compact");
  const toggleCatSelection = (catId, currentList, setter) => {
    const id = Number(catId);
    if (currentList.includes(id)) {
      setter(currentList.filter(item => item !== id));
    } else {
      setter([...currentList, id]);
    }
  };

  const getAccessLabel = (val) => {
    switch (val) {
      case "read_only": return "Hanya Lihat";
      case "add_only": return "Hanya Tambah";
      case "view_edit": return "Lihat & Edit";
      case "full":
      default: return "Akses Penuh";
    }
  };

  return (
    <div className={!isReadOnly ? "desktop-2col-grid" : ""}>
      {!isReadOnly && (
        <div className="desktop-panel">
          <div className="panel-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <IconPlusCircle size={18} color="var(--primary)" /> Daftarkan Petugas / Penjab Pos Baru
            </h3>
          </div>
          {masterMsg && <div className={`alert-box alert-${masterMsg.type}`}>{masterMsg.text}</div>}

          <form onSubmit={handleTambahUser}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap Petugas</label>
              <input
                className="form-control"
                type="text"
                placeholder="Contoh: Ust. Ainul Fais"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label">Email Login</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="penjab.spm@annuqayah.test"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="Password..."
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label">Peran / Role</label>
                <CustomDropdown
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  options={[
                    { value: "penjab_pos", label: "Penanggung Jawab Pos (Penjab)" },
                    { value: "admin_keuangan", label: "Admin Keuangan Pusat" },
                    { value: "petugas_lapangan", label: "Petugas Lapangan" },
                    { value: "pimpinan", label: "Pimpinan Pesantren" }
                  ]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tingkat Hak Akses</label>
                <CustomDropdown
                  value={newUserAccessLevel}
                  onChange={e => setNewUserAccessLevel(e.target.value)}
                  options={ACCESS_LEVELS.map(lvl => ({
                    value: lvl.value,
                    label: lvl.label
                  }))}
                />
              </div>
            </div>

            {/* Multiple Select Pos Program */}
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Tugas Alokasi Pos Program (Bisa Pilih Beberapa Pos):
                </label>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {newUserCatIds.length === 0 ? "Semua Pos (Tanpa Batasan)" : `${newUserCatIds.length} Pos Terpilih`}
                </span>
              </div>
              <div className="multi-pos-select-box">
                {categories.map(c => {
                  const isChecked = newUserCatIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`pos-checkbox-label ${isChecked ? "checked" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCatSelection(c.id, newUserCatIds, setNewUserCatIds)}
                      />
                      <span>[{c.code}] {c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary-action" style={{ marginTop: "10px" }}>
              <IconCheckCircle size={18} color="white" />
              <span>Daftarkan Petugas</span>
            </button>
          </form>
        </div>
      )}

      <div className="desktop-panel">
        <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <IconBriefcase size={18} color="var(--primary)" /> Daftar Petugas & Penjab Pos ({usersList.length})
          </h3>
          <TableActionMenu
            fontSize={tableFontSize}
            onFontSizeChange={setTableFontSize}
          />
        </div>
        <div className={`table-responsive-desktop table-font-${tableFontSize}`}>
          <table className={`portal-table table-font-${tableFontSize}`}>
            <thead>
              <tr>
                <th>Nama Petugas</th>
                <th>Email Login</th>
                <th>Peran</th>
                <th>Hak Akses</th>
                <th>Tugas Pos Program</th>
                {!isReadOnly && <th style={{ textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => {
                const posDisplay = u.pos_labels && u.pos_labels.length > 0
                  ? u.pos_labels.join(", ")
                  : (u.assigned_category_code ? `[${u.assigned_category_code}] ${u.assigned_category_name}` : "Semua Pos");

                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: "700" }}>{u.name}</td>
                    <td><code>{u.email}</code></td>
                    <td>
                      <span className="badge-tag" style={{ background: u.role === 'penjab_pos' ? '#f0f9ff' : '#eff6ff', color: u.role === 'penjab_pos' ? '#0284c7' : '#1d4ed8' }}>
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge-tag"
                        style={{
                          background: u.access_level === 'full' ? '#e0f2fe' : u.access_level === 'read_only' ? '#f1f5f9' : '#fef3c7',
                          color: u.access_level === 'full' ? '#0369a1' : u.access_level === 'read_only' ? '#475569' : '#b45309',
                          fontWeight: "700"
                        }}
                      >
                        {getAccessLabel(u.access_level)}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", maxWidth: "220px", whiteSpace: "normal" }}>
                      {posDisplay}
                    </td>
                    {!isReadOnly && (
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <button
                            type="button"
                            title="Edit Petugas"
                            className="btn-edit-cell"
                            onClick={() => setEditUserItem({
                              ...u,
                              assigned_categories: u.assigned_categories || (u.assigned_category_id ? [u.assigned_category_id] : []),
                              access_level: u.access_level || "full"
                            })}
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            type="button"
                            title="Hapus Petugas"
                            className="btn-delete-cell"
                            onClick={() => handleDeleteUser(u)}
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT MASTER USER / PENJAB */}
      {editUserItem && createPortal(
        <div className="modal-backdrop-custom" onClick={() => setEditUserItem(null)}>
          <div className="modal-card-custom" style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-header-icon-circle">
                  <IconBriefcase size={18} color="currentColor" />
                </div>
                <div>
                  <h3>Edit Petugas / Penjab ({editUserItem.name})</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>Perbarui informasi akun, peran, dan alokasi pos program</p>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setEditUserItem(null)} title="Tutup">✕</button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body-custom" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap Petugas</label>
                  <input
                    className="form-control"
                    type="text"
                    value={editUserItem.name}
                    onChange={e => setEditUserItem({ ...editUserItem, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Email Login</label>
                    <input
                      className="form-control"
                      type="email"
                      value={editUserItem.email}
                      onChange={e => setEditUserItem({ ...editUserItem, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password Baru (Kosongkan jika tetap)</label>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="Password baru..."
                      value={editUserItem.password || ""}
                      onChange={e => setEditUserItem({ ...editUserItem, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Peran / Role</label>
                    <CustomDropdown
                      value={editUserItem.role}
                      onChange={e => setEditUserItem({ ...editUserItem, role: e.target.value })}
                      options={[
                        { value: "penjab_pos", label: "Penanggung Jawab Pos (Penjab)" },
                        { value: "admin_keuangan", label: "Admin Keuangan Pusat" },
                        { value: "petugas_lapangan", label: "Petugas Lapangan" },
                        { value: "pimpinan", label: "Pimpinan Pesantren" }
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tingkat Hak Akses</label>
                    <CustomDropdown
                      value={editUserItem.access_level || "full"}
                      onChange={e => setEditUserItem({ ...editUserItem, access_level: e.target.value })}
                      options={ACCESS_LEVELS.map(lvl => ({
                        value: lvl.value,
                        label: lvl.label
                      }))}
                    />
                  </div>
                </div>

                {/* Edit Multi Pos Program */}
                <div className="form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Tugas Alokasi Pos Program:
                    </label>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {(editUserItem.assigned_categories || []).length === 0 ? "Semua Pos (Tanpa Batasan)" : `${editUserItem.assigned_categories.length} Pos Terpilih`}
                    </span>
                  </div>
                  <div className="multi-pos-select-box">
                    {categories.map(c => {
                      const currentList = editUserItem.assigned_categories || [];
                      const isChecked = currentList.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`pos-checkbox-label ${isChecked ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const updated = isChecked
                                ? currentList.filter(id => id !== c.id)
                                : [...currentList, c.id];
                              setEditUserItem({ ...editUserItem, assigned_categories: updated });
                            }}
                          />
                          <span>[{c.code}] {c.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-secondary" onClick={() => setEditUserItem(null)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
