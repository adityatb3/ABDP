// ═══════════════════════════════════════════════════
// CHANGE PASSWORD MODAL
//
// Modal dialog for updating a player's password.
// Verifies current password before allowing change.
// New password is hashed with SHA-256 before saving.
//
// Props:
//   user       — current user object
//   onClose    — close without saving
//   onSuccess  — called after successful password change
// ═══════════════════════════════════════════════════

function ChangePasswordModal({ user, onClose, onSuccess }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!current || !next || !confirm) { setError('Please fill in all fields.'); return; }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    setLoading(true);
    const valid = await verifyPassword(current, user.password);
    if (!valid) { setError('Current password is incorrect.'); setLoading(false); return; }
    const newHash = await hashPassword(next);
    DB.saveUser({ ...user, password: newHash });
    // Update the in-memory user object
    user.password = newHash;
    setLoading(false);
    onSuccess();
  }

  return (
    <Modal title="CHANGE PASSWORD" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <InputField label="Current Password" type="password" value={current} onChange={setCurrent} placeholder="••••••••" autoFocus />
        <InputField label="New Password" type="password" value={next} onChange={setNext} placeholder="Min 6 characters" hint="Your password is hashed with SHA-256 and never leaves your browser." />
        <InputField label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" error={error} />
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          <button type="submit" disabled={loading} style={{ ...S.btnPrimary, opacity:loading?.7:1 }}>{loading?'SAVING...':'UPDATE PASSWORD'}</button>
          <button type="button" style={S.btnSecondary} onClick={onClose}>CANCEL</button>
        </div>
      </form>
    </Modal>
  );
}