export default function ErrorAlert({ message, errors }) {
  if (!message && !errors) return null;

  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
      {message && (
        <p className="text-sm font-medium text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {message}
        </p>
      )}
      {errors && Object.keys(errors).length > 0 && (
        <ul className="mt-2 space-y-1">
          {Object.values(errors).flat().map((err, i) => (
            <li key={i} className="text-xs text-red-600 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-600">{error}</p>;
}
