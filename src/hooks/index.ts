import { useEffect, useState } from "react"
import { useAppSettings } from "./appSettings"
import { useAtom } from "jotai";
import { isAppLoadingAtom } from "@/store/appSettings";

export function useInitDaji() {
    const { initAppSettings, appSettings } = useAppSettings();
    const [isDajiInited, setIsDajiInited] = useState(false);
    const [, setIsAppLoading] = useAtom(isAppLoadingAtom)

    useEffect(() => {
        const initialize = async () => {
            setIsAppLoading(true);
            try {
                // Initialize app settings
                const appSettings = initAppSettings()
                setIsDajiInited(true)
            } catch (e: any) {
            }
            setIsAppLoading(false);
        }

        initialize()
    }, [])

    return { isDajiInited };
}
