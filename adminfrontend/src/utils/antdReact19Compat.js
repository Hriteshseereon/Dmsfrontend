import { createRoot } from "react-dom/client";
import { unstableSetRender } from "antd";

/**
 * antd 5 + React 19 compatibility for the static helpers: message.success/error(...), notification.*(...)
 * and Modal.confirm(...).
 *
 * React 19 no longer exports `createRoot` / `render` from "react-dom", which is where antd 5 looks for
 * them. Without this, those static calls render NOTHING - no toast, no error - so a failed save looks
 * like nothing happened. This does what the official `@ant-design/v5-patch-for-react-19` package does,
 * without adding a dependency.
 *
 * Must be imported once, before the first static call (see main.jsx). It can be deleted after upgrading
 * to antd 6, which supports React 19 natively.
 */
unstableSetRender((node, container) => {
  container._reactRoot ||= createRoot(container);
  const root = container._reactRoot;
  root.render(node);

  return async () => {
    // Let React finish the current render before unmounting
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
    delete container._reactRoot;
  };
});
