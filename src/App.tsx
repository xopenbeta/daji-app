import { Toaster } from "@/components/ui/sonner";
import { UpdateDialog } from '@/pages/update-dialog';
import { useInitDaji } from '@/hooks';
import { isAppLoadingAtom } from "@/store/appSettings";
import { useAtom } from "jotai";
import Daji from "./pages";
import { useAppTheme } from "./hooks/useTheme";
import { Loading } from "./Loading";
import { useAppTitleVersion } from "./hooks/useAppVersion";

function App(): JSX.Element {
  const [isAppLoading] = useAtom(isAppLoadingAtom);
  useInitDaji();
  useAppTheme();
  useAppTitleVersion();

  return (
    <>
      <Daji />
      {/* {isAppLoading && <Loading />} */}
      <UpdateDialog />
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'heroui-card heroui-transition',
          style: {
            background: 'hsl(var(--content1))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--divider) / 0.6)',
            borderRadius: 'calc(var(--radius) * 1.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }
        }}
      />
    </>
  )
}

export default App
