

export function Breadcrumbs({ path, onNavigate }) {
  const segments = path === "." ? [] : path.split("/");

  const crumbs = [{ name: "Home", fullPath: "." }].concat(
    segments.map((seg, idx) => ({
      name: seg,
      fullPath: segments.slice(0, idx + 1).join("/") || ".",
    }))
  );

  return (
    <nav aria-label="breadcrumb">
      {crumbs.map((crumb, idx) => (
        <span key={crumb.fullPath}>
          <button
            onClick={() => onNavigate(crumb.fullPath)}
          >
            {crumb.name}
          </button>
          {idx < crumbs.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
