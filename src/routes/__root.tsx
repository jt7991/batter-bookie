import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { CalendarDays } from "lucide-react";
import * as React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const activeProps = {
    className: "font-bold bg-slate-800",
  };
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="h-full min-h-screen bg-slate-800 flex flex-row">
        <aside className="p-2 flex-col gap-2 text-lg h-screen bg-slate-900 min-w-60 sm:flex hidden">
          <Link
            to="/"
            activeProps={activeProps}
            activeOptions={{ exact: true }}
            className="text-slate-50 m-2"
          >
            <div className="flex flex-row h-6 gap-5 text-center">
              <img src="/favicon.svg" />
              Batter Bookie
            </div>
          </Link>
          <Link
            to="/lineups"
            activeProps={activeProps}
            activeOptions={{ exact: true }}
            className="text-slate-50 m-2 rounded-md p-1 flex flex-row gap-2"
          >
            <CalendarDays className="p-1" />
            <div className="flex flex-row h-6 gap-5 text-center ">Lineups</div>
          </Link>
        </aside>
        <hr />
        <div className="overflow-y-auto max-h-screen w-full">{children}</div>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
