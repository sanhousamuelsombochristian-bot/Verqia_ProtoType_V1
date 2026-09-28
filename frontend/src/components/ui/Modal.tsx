import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Si fourni, le contenu est un formulaire et ce gestionnaire est appelé à la validation. */
  onSubmit?: () => void;
  submitLabel?: string;
  busy?: boolean;
  error?: string | null;
  width?: number;
}

/** Boîte de dialogue accessible (Échap pour fermer, focus automatique, clic sur le fond). */
export function Modal({ open, title, subtitle, onClose, children, onSubmit, submitLabel = 'Enregistrer', busy, error, width = 520 }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input, select, textarea, button:not(.vq-modal-x)');
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const body = (
    <>
      <div className="vq-modal-head">
        <div>
          <h2 className="vq-h2" style={{ fontSize: 20 }}>{title}</h2>
          {subtitle && <div className="vq-sub" style={{ marginTop: 4 }}>{subtitle}</div>}
        </div>
        <button type="button" className="vq-btn sm vq-modal-x" aria-label="Fermer" onClick={onClose}>×</button>
      </div>
      <div className="vq-modal-body">{children}</div>
      {error && <div role="alert" className="vq-callout amber filled">{error}</div>}
      {onSubmit && (
        <div className="vq-modal-foot">
          <button type="button" className="vq-btn" onClick={onClose}>Annuler</button>
          <button type="submit" className="vq-btn primary" disabled={busy}>{busy ? 'Enregistrement…' : submitLabel}</button>
        </div>
      )}
    </>
  );

  return (
    <div className="vq-modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="vq-modal" style={{ maxWidth: width }}>
        {onSubmit ? <form onSubmit={submit} noValidate>{body}</form> : body}
      </div>
    </div>
  );
}
