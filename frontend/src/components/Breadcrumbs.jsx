import React from "react";

export function Breadcrumbs({ path, onNavigate }) {
  const segments = path === "." ? [] : path.split("/");

  const crumbs = [
    { name: "Home", fullPath: ".", isHome: true },
    ...segments.map((seg, idx) => ({
      name: seg,
      fullPath: segments.slice(0, idx + 1).join("/") || ".",
      isHome: false,
    })),
  ];

  return (
    <nav aria-label="breadcrumb" className="breadcrumbs-nav">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;

        return (
          <React.Fragment key={crumb.fullPath}>
            {/* Separator (skip before the first item) */}
            {idx > 0 && <span className="breadcrumb-separator">{">"}</span>}

            {/* If this is the last crumb, render as a non-clickable span in accent color */}
            {isLast ? (
              <span className="breadcrumb-item breadcrumb-current">
                {crumb.isHome ? (
                  <span className="breadcrumb-home-emoji" role="img" aria-label="home">
                    🏠
                  </span>
                ) : (
                  crumb.name
                )}
              </span>
            ) : (
              /* Otherwise, render as a button you can click to navigate */
              <button
                type="button"
                className="breadcrumb-item breadcrumb-link"
                onClick={() => onNavigate(crumb.fullPath)}
                title={crumb.fullPath === "." ? "Go to Home" : `Go to ${crumb.name}`}
              >
                {crumb.isHome ? (
                  <span className="breadcrumb-home-emoji" role="img" aria-label="home">
                    🏠
                  </span>
                ) : (
                  crumb.name
                )}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}