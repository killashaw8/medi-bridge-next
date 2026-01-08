import React, { useEffect, useRef } from "react";

export type TelegramUser = Readonly<{
  auth_date: number;
  first_name: string;
  last_name?: string;
  hash: string;
  id: number;
  photo_url?: string;
  username?: string;
}>;

type TelegramLoginButtonProps = {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  size?: "large" | "medium" | "small";
  cornerRadius?: number;
  usePic?: boolean;
  requestAccess?: string;
  lang?: string;
  className?: string;
};

declare global {
  interface Window {
    TelegramOnAuthCb?: (user: TelegramUser) => void;
  }
}

const TelegramLoginButton = ({
  botName,
  onAuth,
  size = "small",
  cornerRadius = 12,
  usePic = false,
  requestAccess,
  lang,
  className,
}: TelegramLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!botName || !containerRef.current) return;

    window.TelegramOnAuthCb = (user: TelegramUser) => onAuth(user);

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?21";
    script.async = true;
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", size);
    script.setAttribute("data-radius", String(cornerRadius));
    script.setAttribute("data-userpic", String(usePic));
    script.setAttribute("data-onauth", "TelegramOnAuthCb(user)");
    if (requestAccess) {
      script.setAttribute("data-request-access", requestAccess);
    }
    if (lang) {
      script.setAttribute("data-lang", lang);
    }

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
  }, [botName, cornerRadius, lang, onAuth, requestAccess, size, usePic]);

  return <div className={className} ref={containerRef} />;
};

export default TelegramLoginButton;
