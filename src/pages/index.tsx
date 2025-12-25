import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useAtom } from 'jotai'
import { useEffect, useRef } from "react"
import { ImperativePanelHandle, ImperativePanelGroupHandle } from "react-resizable-panels"
import NavBar from "./nav-bar/nav-bar"
import { WelcomeFragment } from "./welcome-fragment"
import { isNavPanelOpenAtom, nowProgramIdAtom } from "@/store"
import { ProgramPanel } from "./program-panel/program-panel"

export default function Daji() {
  const [nowProgramId] = useAtom(nowProgramIdAtom);
  const [isNavPanelOpen, setIsNavPanelOpen] = useAtom(isNavPanelOpenAtom);
  const navPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    if (isNavPanelOpen) {
      navPanelRef.current?.expand?.();
    } else {
      navPanelRef.current?.collapse?.();
    }
  }, [isNavPanelOpen]);

  const resizableHandleClassName = "w-px bg-content2 hover:bg-default heroui-transition";
  return <div className="fixed w-screen h-screen overflow-hidden bg-content2">
  <ResizablePanelGroup direction="horizontal" className="w-screen h-screen">

      {/* 导航栏 */}
      <ResizablePanel
        ref={navPanelRef}
        defaultSize={30}
        collapsedSize={0}
        collapsible={true}
        minSize={10}
        className="min-w-0"
      >
        <NavBar onClose={() => setIsNavPanelOpen(false)} />
      </ResizablePanel>

      {/* 拖动线 */}
      <ResizableHandle className={resizableHandleClassName} />

      {/* 主体内容 */}
      <ResizablePanel
        defaultSize={70}
        minSize={20}
      >
        <div className='w-full h-screen flex justify-center items-center'>
          <div style={{ width: 'calc(100% - 8px)', height: 'calc(100vh - 10px)' }} className="bg-white dark:bg-[#030303] flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-white/5 shadow-sm">
            {!!nowProgramId ? (
              <ProgramPanel onOpen={isNavPanelOpen ? undefined : () => setIsNavPanelOpen(true)} />
            ) : (
              <WelcomeFragment onOpen={isNavPanelOpen ? undefined : () => setIsNavPanelOpen(true)} />
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
}
