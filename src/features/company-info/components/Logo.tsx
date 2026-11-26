import { useEffect, useState } from "react";
import { useCompanyStore } from "@/features/company-info/stores/companyStore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import logoFallback from "@/assets/images/logo.png";
import logoDark from "@/assets/images/darklogo.png";

interface LogoProps {
  variant?: "default" | "icon";
  className?: string;
  style?: React.CSSProperties;
}

// --- Préchargement des logos (une seule fois pour toute l'app) ----------------
// On décode les images avant de les afficher : plus de texte "alt" visible
// et plus de dessin progressif de haut en bas.
let logosReady = false;
let preloadPromise: Promise<void> | null = null;

const preloadLogos = (): Promise<void> => {
  preloadPromise ??= Promise.all(
    [logoFallback, logoDark].map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img
            .decode()
            .then(() => resolve())
            .catch(() => resolve()); // en cas d'échec on affiche quand même
        }),
    ),
  ).then(() => {
    logosReady = true;
  });
  return preloadPromise;
};

// Démarre le chargement dès l'import du module
void preloadLogos();

const useLogosReady = () => {
  const [ready, setReady] = useState(logosReady);

  useEffect(() => {
    if (ready) return;
    let alive = true;
    void preloadLogos().then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [ready]);

  return ready;
};

export const Logo = ({ variant = "default", className, style }: LogoProps) => {
  const companyName = useCompanyStore(
    (state) => state.company?.name || "EWA Print",
  );
  const ready = useLogosReady();

  const renderIcon = (sizeClass: string, wrapperClassName?: string) => (
    <span
      className={cn("relative inline-block shrink-0", sizeClass, wrapperClassName)}
      style={style}
    >
      {/* Skeleton : occupe exactement la place du logo tant qu'il n'est pas prêt */}
      {!ready && <Skeleton className="absolute inset-0 rounded-lg" />}

      <img
        src={logoFallback}
        alt={ready ? companyName : ""}
        decoding="sync"
        draggable={false}
        className={cn(
          "h-full w-full object-contain transition-opacity duration-200 dark:hidden",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <img
        src={logoDark}
        alt={ready ? companyName : ""}
        decoding="sync"
        draggable={false}
        className={cn(
          "hidden h-full w-full object-contain transition-opacity duration-200 dark:block",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );

  if (variant === "icon") {
    return renderIcon(className || "h-10 w-22");
  }

  return (
    <div
      className={cn("flex items-center gap-2 font-semibold min-w-0", className)}
    >
      {renderIcon("h-8 w-8")}
    </div>
  );
};